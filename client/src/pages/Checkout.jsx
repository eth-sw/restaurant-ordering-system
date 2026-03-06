import {useContext, useEffect, useRef, useState} from 'react';
import {useJsApiLoader} from '@react-google-maps/api';
import {loadStripe} from '@stripe/stripe-js';
import {Elements} from '@stripe/react-stripe-js';
import {geocodeAddress} from "../utils/geocoding.js";
import PaymentForm from "../components/PaymentForm";
import BasketContext from "../context/BasketContext.jsx";
import axios from 'axios';
import {useNavigate} from 'react-router-dom'

// Initialise Stripe outside component so that it doesn't reload on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const libraries = ['places', 'drawing'];

/**
 * Checkout Component.
 * Displays current basket items, total price, and allows users to place orders.
 * Checks delivery address against geofence and create Stripe payments.
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

    const {isLoaded} = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: libraries
    });

    const autocompleteContainerRef = useRef(null);

    // Initialise Google Places Autocomplete
    useEffect(() => {
        if (!isLoaded || !autocompleteContainerRef.current) return;

        autocompleteContainerRef.current.innerHTML = '';

        const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();

        placeAutocomplete.setAttribute('placeholder', 'Enter your address');
        placeAutocomplete.style.width = '100%';
        placeAutocomplete.style.height = '42px';

        autocompleteContainerRef.current.appendChild(placeAutocomplete);

        placeAutocomplete.addEventListener('gmp-placeselect', async (e) => {
            if (!e.place) return;
            await e.place.fetchFields({fields: ['formattedAddress', 'location']});

            if (e.place.formattedAddress && e.place.location) {
                setCustomerInfo(prev => ({...prev, address: e.place.formattedAddress}));
                setDeliveryCoords({
                    lat: e.place.location.lat(),
                    lng: e.place.location.lng()
                });
                setAddressVerified(false);
            }
        });

        return () => {
            if (autocompleteContainerRef.current) {
                autocompleteContainerRef.current.innerHTML = '';
            }
        };
    }, [isLoaded]);

    // State management
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: '+44',
        address: ''
    });
    const [addressVerified, setAddressVerified] = useState(false);
    const [deliveryCoords, setDeliveryCoords] = useState(null);
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
                .then(res => setCustomerInfo(prev => ({
                    ...prev,
                    name: res.data.name,
                    email: res.data.email || '',
                    phone: res.data.phone || '+44'
                })))
                .catch(err => console.error(err));
        }
    }, []);

    /**
     * Handler for text inputs in delivery form.
     */
    const onInfoChange = (e) => {
        let {name, value} = e.target;
        setCustomerInfo({...customerInfo, [name]: value});
        setAddressVerified(false);
    };

    /**
     * Handler for phone input to enforce +44 prefix.
     */
    const onPhoneChange = (e) => {
        let val = e.target.value;
        if (!val.startsWith('+44')) {
            val = '+44';
        }
        setCustomerInfo({...customerInfo, phone: val});
        setAddressVerified(false);
    }

    /**
     * Geocodes the address and checks it against restaurant's delivery zone.
     * Prevents payment if out of bounds.
     */
    const handleVerifyAddress = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            let currentAddressStr = customerInfo.address;
            const placeElement = autocompleteContainerRef.current?.firstChild;
            if (placeElement?.value) {
                currentAddressStr = placeElement.value;
                setCustomerInfo(prev => ({...prev, address: currentAddressStr}));
            }

            if (!customerInfo.name || customerInfo.name.trim() === '') {
                setError("Error: Please enter your full name");
                setLoading(false);
                return;
            }

            if (!customerInfo.email || customerInfo.email.trim() === '') {
                setError("Error: Please enter your email address");
                setLoading(false);
                return;
            }

            if (!customerInfo.phone.startsWith('+44') || customerInfo.phone.length < 10) {
                setError("Error: Please enter a valid phone number");
                setLoading(false);
                return;
            }

            if (!currentAddressStr || currentAddressStr.trim() === '') {
                setError("Error: Please enter a delivery address.");
                setLoading(false);
                return;
            }

            let coords = deliveryCoords;
            if (!coords) coords = await geocodeAddress(currentAddressStr);

            const res = await axios.post('http://localhost:5000/api/geofence/check-availability', {
                latitude: coords.lat,
                longitude: coords.lng
            });

            if (res.data.canDeliver) {
                setAddressVerified(true);
                setMessage(`Address verified. ETA: ${res.data.eta}`);
            } else {
                setError("Error: This address is outside the delivery zone.");
            }
        } catch (err) {
            console.error(err);
            setError("Error: Could not validate address.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Initialises Stipe Payment Intent on backend.
     * Passes items to the server so the total is calculated securely.
     */
    const initPayment = async () => {
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = token ? {'x-auth-token': token} : {};

            const payload = {
                items: basketItems.map(item => ({ menuItem: item._id, qty: item.qty }))
            };

            const res = await axios.post('http://localhost:5000/api/payment/create-payment-intent', payload, {headers} );

            // Switches UI to Stripe payment form
            setClientSecret(res.data.clientSecret);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Error: Failed to initialise payment.");
            setLoading(false);
        }
    };

    /**
     * Handles submitting order to the backend.
     * Redirects to Order Success tracking page.
     * @param paymentId Successful Strip intent ID
     */
    const handlePlaceOrder = async (paymentId) => {
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = token ? {'x-auth-token': token} : {};

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

            const res = await axios.post('http://localhost:5000/api/orders', payload, {headers});

            setMessage("Order Placed Successfully");
            clearBasket();
            navigate(`/order-success/${res.data._id}`);

        } catch (err) {
            console.error(err);
            setError("Error: Could not place order.");
            setLoading(false);
        }
    };

    if (basketItems.length === 0) {
        return (
            <div style={{textAlign: 'center', padding: '50px'}}>
                <h2>Your basket is empty</h2>
                <button onClick={() => navigate('/')} style={{marginTop: '20px', padding: '10px 20px', cursor: 'pointer'}}>
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

            {/* Basket items summary */}
            <div style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px'
            }}>
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

            {/* Delivery details form */}
            <div style={{background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '20px'}}>
                <h3>Delivery Details</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <input type="text" name="name" placeholder="Full Name" value={customerInfo.name} onChange={onInfoChange} required style={{padding: '10px'}} disabled={addressVerified}/>
                    <input type="email" name="email" placeholder="Email Address" value={customerInfo.email} onChange={onInfoChange} required style={{padding: '10px'}} disabled={addressVerified}/>
                    <input type="tel" name="phone" placeholder="Phone (+44...)" value={customerInfo.phone} onChange={onPhoneChange} required style={{padding: '10px'}} disabled={addressVerified}/>
                    {isLoaded ? (
                        <div ref={autocompleteContainerRef} style={{ width: '100%', display: addressVerified ? 'none' : 'block' }}></div>
                    ) : (
                        <input type="text" name="address" placeholder="Loading map..." disabled style={{padding: '10px'}}/>
                    )}

                    {customerInfo.address && (
                        <input
                            type="text"
                            name="address"
                            value={customerInfo.address}
                            readOnly
                            style={{
                                padding: '10px',
                                backgroundColor: '#f0f0f0',
                                border: '1px solid #ccc',
                                color: '#555'
                            }}
                        />
                    )}

                    {!addressVerified && (
                        <button
                            type="button"
                            onClick={handleVerifyAddress}
                            disabled={loading}
                            style={{
                                padding: '12px',
                                background: '#1976d2',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {loading ? 'Checking...' : 'Verify Delivery Address'}
                        </button>
                    )}
                </div>

                {message && <p style={{
                    marginTop: '15px',
                    fontWeight: 'bold',
                    color: 'green'
                }}>{message}</p>}
                {error && <p style={{
                    marginTop: '15px',
                    fontWeight: 'bold',
                    color: 'red'
                }}>{error}</p>}

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

                {/* Stripe Payment elements */}
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