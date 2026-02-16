import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * RestaurantOrders component
 * Dashboard for restaurant owners to view and manage incoming orders
 * Allows owners to change order status
 *
 * @returns {React.JSX.Element} The order management dashboard
 *
 * @author Ethan Swain
 */
const RestaurantOrders = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    /**
     * Fetches all orders for the specific restaurant
     */
    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`http://localhost:5000/api/orders/restaurant/${id}`, {
                    headers: {'x-auth-token': token}
                });
                setOrders(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchOrders();
    }, [id]);

    /**
     * Updates the status of a specific order
     * Sends a PATCH request to the API and updates the state if successful
     *
     * @param orderId ID of the order to update
     * @param newStatus New status (e.g. Cooking, Delivered)
     */
    const updateStatus = async (orderId, newStatus) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`http://localhost:5000/api/orders/${orderId}/status`,
                {status: newStatus},
                {headers: {'x-auth-token': token}}
            );

            // Updates the UI
            setOrders(orders.map(order =>
                order._id === orderId ? {...order, status: newStatus} : order
            ));
        } catch (err) {
            alert("Error updating status");
        }
    };

    if (loading) return <div>Loading Orders</div>;

    return (
        <div style={{maxWidth: '1000px', margin: '0 auto', padding: '20px'}}>
            <button onClick={() => navigate('/')} style={{
                marginBottom: '20px',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                color: '#1976d2',
                textDecoration: 'underline'
            }}>
                &larr; Back to Dashboard
            </button>

            <h1>Incoming Orders</h1>

            {orders.length === 0 ? <p>No orders yet</p> : (
                <div style={{display: 'grid', gap: '20px'}}>
                    {orders.map(order => (
                        <div key={order._id} style={{
                            border: '1px solid #ddd',
                            padding: '20px',
                            borderRadius: '8px',
                            background: 'white'
                        }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                                <h3>Order #{order._id.slice(-6)}</h3>
                                <span style={{
                                    padding: '5px 10px',
                                    borderRadius: '15px',
                                    background: order.status === 'Delivered' ? '#4caf50' : '#ff9800',
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}>
                                    {order.status}
                                </span>
                            </div>

                            <p><strong>Customer:</strong> {order.user?.name} ({order.user?.email})</p>

                            <div style={{background: '#f9f9f9', padding: '10px', margin: '10px 0'}}>
                                {order.items.map((item, index) => (
                                    <div key={index} style={{display: 'flex', justifyContent: 'space-between'}}>
                                        <span>{item.qty}x {item.name}</span>
                                        <span>£{(item.price * item.qty).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div style={{
                                    borderTop: '1px solid #ccc',
                                    marginTop: '5px',
                                    paddingTop: '5px',
                                    fontWeight: 'bold',
                                    textAlign: 'right'
                                }}>
                                    Total: £{order.totalAmount.toFixed(2)}
                                </div>
                            </div>

                            <div style={{display: 'flex', gap: '10px'}}>
                                {order.status === 'Pending' && (
                                    <button onClick={() => updateStatus(order._id, 'Accepted')} style={{
                                        padding: '8px 16px',
                                        background: '#2196f3',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}>
                                        Accept Order
                                    </button>
                                )}
                                {(order.status === 'Accepted' || order.status === 'Pending') && (
                                    <button onClick={() => updateStatus(order._id, 'Cooking')} style={{
                                        padding: '8px 16px',
                                        background: '#ff9800',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}>
                                        Start Cooking
                                    </button>
                                )}
                                {order.status === 'Cooking' && (
                                    <button onClick={() => updateStatus(order._id, 'Delivered')} style={{
                                        padding: '8px 16px',
                                        background: '#4caf50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}>
                                        Mark Delivered
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RestaurantOrders;