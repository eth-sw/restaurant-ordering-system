import React, {useState} from 'react';
import {PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";

/**
 * PaymentForm Component.
 * Allows the user to pay using Stripe.
 *
 * @author Ethan Swain
 */
export default function PaymentForm({ onPaymentSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        // Confirms payment with Stripe
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return to this page if 3D secure is needed
                return_url: globalThis.location.origin + "/checkout",
            },
            redirect: "if_required", // Prevents redirect if not needed
        });

        if (error) {
            setMessage(error.message);
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            // Places order in DB if successful
            onPaymentSuccess(paymentIntent.id);
        } else {
            setMessage("Unexpected state")
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <PaymentElement />
            { message && <div style={{ color: "red", marginTop: "10px" }}>{message}</div>}
            <button
                disabled={isProcessing || !stripe || !elements}
                id="submit"
                style={{
                    width: '100%', margin: '20px', padding: '15px',
                    background: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px',
                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
            >
                {isProcessing ? "Processing..." : "Pay Now" }
            </button>
        </form>
    );
}