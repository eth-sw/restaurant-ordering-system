import {useEffect, useState} from 'react';
import axios from 'axios';

/**
 * RestaurantOrders Component.
 * Dashboard for staff and admins to view and manage incoming orders.
 * Allows staff to update status of an order.
 *
 * @returns {React.JSX.Element} The order management dashboard UI
 *
 * @author Ethan Swain
 */
const RestaurantOrders = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    /**
     * Fetches all orders from the DB.
     * Requires auth token with staff, supervisor, or admin privileges.
     */
    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/orders/all', {
                headers: {'x-auth-token': token}
            });
            setOrders(res.data);
            setError('');
        } catch (err) {
            console.error("Error fetching orders", err);
            setError("Could not load orders");
        }
    };

    /**
     * Updates the status of a specific order.
     * Sends a PATCH request to the API and updates the order list if successful.
     *
     * @param id MongoDB id of order to update
     * @param status New status string (e.g. 'Cooking', 'Delivered')
     */
    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/orders/${id}/status`,
                { status },
                { headers: { 'x-auth-token': token } }
            );
            fetchOrders();
        } catch (err) {
            alert("Error updating status");
        }
    };

    // Fetch orders and refresh every 10 secs
    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1>Kitchen Orders</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {orders.length === 0 && !error ? <p>No active orders</p> : null}

            {orders.map(order => (
                <div key={order._id} style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '15px', borderRadius: '8px', background: order.status === 'Pending' ? '#fff3e0' : 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>Order #{order._id.slice(-4)}</h3>
                            <small>Customer: {order.user ? order.user.name : "Unknown"} | Total: £{order.totalAmount?.toFixed(2)}</small>
                        </div>
                        <strong style={{ color: order.status === 'Delivered' ? 'green' : '#1976d2', fontSize: '1.2em' }}>{order.status}</strong>
                    </div>

                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {order.items.map((item, i) => (
                            <li key={i} style={{ padding: '5px 0' }}>
                                <span style={{ fontWeight: 'bold', marginRight: '10px' }}>{item.qty}x</span>
                                {item.name}
                            </li>
                        ))}
                    </ul>

                    <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                        <button onClick={() => updateStatus(order._id, 'Cooking')} style={{ marginRight: '10px', background: 'orange', padding: '8px 15px', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Start Cooking</button>
                        <button onClick={() => updateStatus(order._id, 'Delivered')} style={{ background: 'green', padding: '8px 15px', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Mark Delivered</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RestaurantOrders;