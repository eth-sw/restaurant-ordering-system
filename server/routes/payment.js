const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const optionalAuth = require('../middleware/optionalAuth');

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
    try{
        const { amount } = req.body;

        // Create PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "gbp",
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Payment Error"});
    }
});

module.exports = router;