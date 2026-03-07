const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const optionalAuth = require('../middleware/optionalAuth');
const Order = require('../models/Order');

/**
 * POST: Create a Stripe payment intent.
 * Initialises a secure transation with Stripe. Uses optionalAuth for guests.
 *
 * @param req HTTP Request object (body contains amount in pence)
 * @param res HTTP Response object (contains client secret)
 *
 * @author Ethan Swain
 */
router.post('/create-payment-intent', optionalAuth, async (req, res) => {
    try {
        const { amount, orderId } = req.body;

        // Create PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "gbp",
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                orderId: orderId
            }
        });

        res.send({
            clientSecret: paymentIntent.client_secret
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Payment Error"});
    }
});

/**
 * POST: Stripe Webhook Endpoint
 * Stripe servers ping this route when a payment succeeds.
 */
router.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
            try {
                const order = await Order.findById(orderId);
                if (order) {
                    order.status = 'Accepted';
                    order.paymentId = paymentIntent.id;
                    await order.save();
                    console.log(`Order: ${orderId} marked as Accepted via webhook`)
                }
            } catch (err) {
                console.error(err);
            }
        }
    }
    res.send();
});

module.exports = router;