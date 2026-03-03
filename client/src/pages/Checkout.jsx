import {useContext, useEffect, useState} from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {Elements} from '@stripe/react-stripe-js';
import {geocodeAddress} from "../utils/geocoding.js";
import PaymentForm from "../components/PaymentForm";
import BasketContext from "../context/BasketContext.jsx";
import axios from 'axios';
import {useNavigate} from 'react-router-dom'

// Initialise Stripe outside component so that it doesn't reload on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

/**
 * Checkout Component.
 * Displays current basket items, total price, and allows users to place orders.
 * Checks address geofence before creating Stripe payment form.
 *
 * @returns {React.JSX.Element} Checkout page UI
 *
 * @author Ethan Swain
 */
const Checkout = () => {
    const {
        basketItems,
        addToBasket,
        decreaseQuantity,
        removeFromBasket,
        getBasketTotal,
        clearBasket
    } = useContext(BasketContext);
    const navigate = useNavigate();

    // Delivery and geofencing state
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        address: ''
    });

    const [addressVerified, setAddressVerified] = useState(false);

    // Payment state
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [clientSecret, setClientSecret] = useState('');

    const total = getBasketTotal();

    // Auto-fill user data if they're logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('http://localhost:5000/api/auth/me', {headers: {'x-auth-token': token}})
                .then(res => setCustomerInfo(prev => ({...prev, name: res.data.name, phone: res.data.phone || ''})))
                .catch(err => console.error(err));
        }
    }, []);

    const onInfoChange = (e) => {
        let {name, value} = e.target;
        setCustomerInfo({...customerInfo, [name]: value});
        setAddressVerified(false); // Reset verification if address changes
    };

    /**
     * Geocodes the address and checks it against restaurant's delivery zone
     */
    const handleVerifyAddress = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const coords = await geocodeAddress(customerInfo.address);
            const res = await axios.post('http://localhost:5000/api/geofence/check-availability', {
                latitude: coords.lat,
                longitude: coords.lng
            });

            if (res.data.canDeliver) {
                setAddressVerified(true);
                setMessage(`Address verified. ETA: ${res.data.eta}`);
            } else {
                setMessage("Error: This address is outside the delivery zone.");
            }
        } catch (err) {
            console.error(err);
            setMessage("Error: Could not validate address.");
        } finally {
            setLoading(false);
        }
    };

    const initPayment = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? {'x-auth-token': token} : {};

            const payload = {
                items: basketItems.map(item => ({
                    menuItem: item._id,
                    qty: item.qty
                }))
            };

            const res = await axios.post('http://localhost:5000/api/payment/create-payment-intent',
                {amount: amountInPence},
                {headers}
            );
            // Switches UI to the payment form
            setClientSecret(res.data.clientSecret);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setMessage("Error: Failed to initialise payment.");
            setLoading(false);
        }
    };

    /**
     * Handles submitting order to the backend.
     * Constructs the order payload and clears the basket if successful.
     */
    const handlePlaceOrder = async (paymentId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? {'x-auth-token': token} : {};

            // Construct payload matching backend order schema
            const payload = {
                items: basketItems.map(item => ({
                    menuItem: item._id,
                    name: item.name,
                    price: item.price,
                    qty: item.qty,
                })),
                totalAmount: total,
                paymentId: paymentId,
                customerInfo: customerInfo
            };

            await axios.post('http://localhost:5000/api/orders', payload, {headers});

            setMessage("Order Placed Successfully");
            clearBasket();

            // Redirect to home
            setTimeout(() => globalThis.location.href = '/', 1500);

        } catch (err) {
            console.error(err);
            setMessage("Error: Could not place order.");
            setLoading(false);
        }
    };

    // View if basket empty
    if (basketItems.length === 0) {
        return (
            <div style={{textAlign: 'center', padding: '50px'}}>
                <h2>Your basket is empty</h2>
                <button onClick={() => navigate('/')}
                        style={{marginTop: '20px', padding: '10px 20px', cursor: 'pointer'}}>
                    Back to Menu
                </button>
            </div>
        );
    }

    // Main checkout view
    return (
        <div style={{maxWidth: '800px', margin: '0 auto', padding: '20px'}}>
            <button onClick={() => navigate(-1)} style={{
                marginBottom: '20px',
                background: 'none',
                border: 'none',
                color: '#1976d2',
                textDecoration: 'underline',
                cursor: 'pointer'
            }}>
                &larr; Back to Menu
            </button>

            <h1>Checkout</h1>

            <div style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
            }}>
                {/* List of Basket Items */}
                {basketItems.map(item => (
                    <div key={item._id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid #eee',
                        padding: '15px 0'
                    }}>
                        <div style={{flex: 1}}>
                            <h3 style={{margin: '0 0 5px 0'}}>{item.name}</h3>
                            <p style={{margin: 0, color: '#666'}}>£{item.price.toFixed(2)} each</p>
                        </div>

                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <button onClick={() => decreaseQuantity(item._id)} style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                border: '1px solid #ccc',
                                cursor: 'pointer'
                            }}>-
                            </button>
                            <span style={{fontWeight: 'bold'}}>{item.qty}</span>
                            <button onClick={() => addToBasket(item)} style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                border: '1px solid #ccc',
                                cursor: 'pointer'
                            }}>+
                            </button>
                            <button onClick={() => removeFromBasket(item._id)} style={{
                                marginLeft: '10px',
                                color: '#d32f2f',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}>Remove
                            </button>
                        </div>

                        <div style={{minWidth: '80px', textAlign: 'right', fontWeight: 'bold'}}>
                            £{(item.price * item.qty).toFixed(2)}
                        </div>
                    </div>
                ))}
                <div style={{marginTop: '30px', textAlign: 'right'}}>
                    <h3>Total: <span style={{color: '#2e7d32', fontSize: '1.5em'}}>£{total.toFixed(2)}</span></h3>
                </div>
            </div>

            <div style={{background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '20px'}}>
                <h3>Delivery Details</h3>
                <form onSubmit={handleVerifyAddress} style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <input type="text" name="name" placeholder="Full Name" value={customerInfo.name}
                           onChange={onInfoChange} required style={{padding: '10px'}} disabled={addressVerified}/>
                    <input type="tel" name="phone" placeholder="Phone (+44...)" value={customerInfo.phone}
                           onChange={onInfoChange} required style={{padding: '10px'}} disabled={addressVerified}/>
                    <input type="text" name="address" placeholder="Full Delivery Address" value={customerInfo.address}
                           onChange={onInfoChange} required style={{padding: '10px'}} disabled={addressVerified}/>

                    {!addressVerified && (
                        <button type="submit" disabled={loading} style={{
                            padding: '12px',
                            background: '#1976d2',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer'
                        }}>
                            {loading ? 'Checking...' : 'Verify Delivery Address'}
                        </button>
                    )}
                </form>

                {message && <p style={{
                    marginTop: '15px',
                    fontWeight: 'bold',
                    color: message.includes('Error:') ? 'red' : 'green'
                }}>{message}</p>}

                {/* UI logic switch, switches to payment form */}
                {addressVerified && !clientSecret && (
                    <button onClick={initPayment} disabled={loading} style={{
                        width: '100%',
                        marginTop: '20px',
                        padding: '15px',
                        background: '#2e7d32',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                    }}>
                        Proceed to payment
                    </button>
                )}
                {clientSecret && (
                    <Elements stripe={stripePromise} options={{clientSecret}}>
                        <PaymentForm onPaymentSuccess={handlePlaceOrder}/>
                    </Elements>
                )}
            </div>
        </div>
    );
};

export default Checkout;