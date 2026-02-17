import {useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import BasketContext from "../context/BasketContext.jsx";
import axios from 'axios';

/**
 * Checkout Component/
 * Displays current basket items, total price, and allows user to place the order.
 *
 * @returns {React.JSX.Element} Checkout page UI
 * @constructor
 */
const Checkout = () => {
    const { basketItems, addToBasket, decreaseQuantity, removeFromBasket, getBasketTotal } = useContext(BasketContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const total = getBasketTotal();

    /**
     * Handles submitting order to the backend
     * Constructs the order payload and clears the basket if successful
     */
    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Construct payload matching backend order schema
            const payload = {
                restaurantId: basketItems[0].restaurantId,
                items: basketItems.map(item => ({
                    menuItem: item._id,
                    name: item.name,
                    price: item.price,
                    qty: item.qty
                })),
                totalAmount: total
            };

            await axios.post('http://localhost:5000/api/orders', payload, {
                headers: { 'x-auth-token': token }
            });

            setMessage("Order Placed Successfully");
            localStorage.removeItem('food_basket');

            // Redirect to home
            setTimeout(() => {
                globalThis.location.href = '/';
            }, 1500);

        } catch (err) {
            console.error(err);
            setMessage("Error: " + (err.response?.data?.message || "Could not place order"));
            setLoading(false);
        }
    };

    // View if basket empty
    if (basketItems.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '50px'}}>
                <h2>Your basket is empty</h2>
                <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer'}}>
                    Find Restaurants
                </button>
            </div>
        );
    }

    // Main checkout view
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}>
                &larr; Back to Menu
            </button>

            <h1>Checkout</h1>

            <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                {basketItems.map(item => (
                    <div key={item._id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid #eee',
                        padding: '15px 0'
                    }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 5px 0' }}>{item.name}</h3>
                            <p style={{ margin: 0, color: '#666' }}>£{item.price.toFixed(2)} each</p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                                onClick={() => decreaseQuantity(item._id)}
                                style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #ccc', cursor: 'pointer' }}
                            >-</button>

                            <span style={{ fontWeight: 'bold' }}>{item.qty}</span>

                            <button
                                onClick={() => addToBasket(item, item.restaurantId)}
                                style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #ccc', cursor: 'pointer' }}
                            >+</button>

                            <button
                                onClick={() => removeFromBasket(item._id)}
                                style={{ marginLeft: '10px', color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                            >Remove</button>
                        </div>

                        <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: 'bold' }}>
                            £{(item.price * item.qty).toFixed(2)}
                        </div>
                    </div>
                ))}

                <div style={{ marginTop: '30px', textAlign: 'right' }}>
                    <h3>Total: <span style={{ color: '#2e7d32', fontSize: '1.5em' }}>£{total.toFixed(2)}</span></h3>
                </div>

                {message && <p style={{ textAlign: 'right', color: 'blue' }}>{message}</p>}

                <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    style={{
                        width: '100%',
                        marginTop: '20px',
                        padding: '15px',
                        background: '#2e7d32',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '1.2em',
                        cursor: 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Processing Order' : 'Place Order'}
                </button>
            </div>
        </div>
    );
};

export default Checkout;