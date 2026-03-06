import { useParams,useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Order Success Component.
 * Displays a live tracking screen for customers after a successful order.
 * Polls the backend every 15 secs to give guest real-time kitchen updates.
 *
 * @returns {React.JSX.Element} Order tracking UI
 *
 * @author Ethan Swain
 */
const OrderSuccess = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        globalThis.scrollTo(0, 0);

        const fetchOrder = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/orders/track/${id}`);
                setOrder(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchOrder();

        const interval = setInterval(fetchOrder, 15000);
        return () => clearInterval(interval);
    }, [id]);

    if (!order) return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading order details...</div>;

    return (
        <div style={{
            maxWidth: '600px',
            margin: '50px auto',
            padding: '40px 20px',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
            <h1 style={{ color: '#2e7d32', textAlign: 'center' }}>Order Placed Successfully</h1>

            <div style={{ textAlign: 'center', padding: '20px', background: '#f5f5f5', borderRadius: '8px', margin: '20px 0' }}>
                <h2 style={{ margin: '0 0 10px 0' }}>Status: <span style={{ color: order.status === 'Delivered' ? 'green' : '#e65100'}}>{order.status}</span></h2>
                <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '1.1em' }}>Order ID: {order._id}</p>
                {order.status !== 'Delivered' && (
                    <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
                        <em>Keep this page open to track your order</em>
                    </p>
                )}
            </div>

            <h3>Your Items:</h3>
            <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
                {order.items.map((item, idx) => (
                    <div key={item.menuItem || idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>{item.qty}x {item.name}</span>
                        <span>£{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                ))}
            </div>
            <h3 style={{ textAlign: 'right', marginTop: '20px', color: '#2e7d32' }}>Total: £{order.totalAmount.toFixed(2)}</h3>

            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button onClick={() => navigate('/')} style={{ padding: '12px 24px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Return to Home
                </button>
            </div>
        </div>
    );
};

export default OrderSuccess;