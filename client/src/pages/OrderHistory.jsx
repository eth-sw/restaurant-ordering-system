import {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

/**
 * Helper function for colour of order status.
 *
 * @param status Status of the order
 * @returns {string} Hex colour code linked to status
 */
const getStatusColor = (status) => {
    switch (status) {
        case 'Delivered': return '#4caf50'; // Green
        case 'Cooking': return '#ff9800'; // Orange
        case 'Cancelled': return '#f44336'; // Red
        default: return '#2196f3'; // Blue
    }
};

/**
 * OrderHistory Component.
 * Displays a list of past orders for the logged in customer.
 * ALlows users to track the status of their order.
 *
 * @returns {React.JSX.Element} List of orders
 *
 * @author Ethan Swain
 */
const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const res = await axios.get('http://localhost:5000/api/orders', {
                    headers: { 'x-auth-token': token }
                });
                setOrders(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    if (loading) return <div style={{ padding: '20px' }}>Loading Orders</div>;

    return(
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1>Your Orders</h1>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <h3>No orders yet</h3>
                    <button onClick={() => navigate('/')} style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer'}}>
                        Find Food
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {orders.map(order => (
                        <div key={order._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                <div>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                    <span style={{ color: '#666', marginLeft: '10px', fontSize: '0.9em' }}>
                                        at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <span style={{
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.9em',
                                    background: getStatusColor(order.status)
                                }}>
                                    {order.status}
                                </span>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                {order.items.map((item, idx) => (
                                    <div key={item._id || `${order._id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                                        <span>{item.qty}x {item.name}</span>
                                        <span>£{(item.price * item.qty).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Total: £{order.totalAmount.toFixed(2)}</span>
                                <button onClick={() => globalThis.location.reload()} style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}>
                                    Refresh
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;