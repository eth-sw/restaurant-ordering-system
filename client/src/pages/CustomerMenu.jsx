import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BasketContext from '../context/BasketContext.jsx';

/**
 * CustomerMenu component
 * Fetches and displays menu for a specific restaurant
 * Allows users to add items to their basket
 *
 * @returns {React.JSX.Element} Menu page UI
 *
 * @author Ethan Swain
 */
const CustomerMenu = () => {
    const { id} = useParams();
    const navigate = useNavigate();

    // Access global basket functions
    const { addToBasket, basketItems, getBasketTotal } = useContext(BasketContext);

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch menu items
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/menu/${id}`);
                setMenuItems(res.data);

                setLoading(false);
            } catch (err) {
                console.error("Error loading menu: ", err);
                setLoading(false);
            }
        };

        fetchMenu();
    }, [id]);

    if (loading) return <div style={{ padding: '20px' }}>Loading food...</div>

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', paddingBottom: '80px' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: '20px', cursor: 'pointer', background: 'none', color: '#1976d2', textDecoration: 'underline'}}>
                &larr; Back to Restaurants
            </button>

            <h1>Menu</h1>

            <div style={{ display: 'grid', gap: '20px' }}>
                {menuItems.map(item => (
                    <div key={item._id} style={{
                        border: '1px solid #ddd',
                        padding: '15px',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0' }}>{item.name}</h3>
                            <p style={{ color: '#666', margin: 0, fontSize: '0.9em' }}>{item.description}</p>
                            <p style={{ fontWeight: 'bold', color: '#2e7d32', marginTop: '5px' }}>
                                £{item.price.toFixed(2)}
                            </p>
                        </div>
                        <button
                            onClick={() => addToBasket(item, id)}
                            style={{
                                padding: '10px 20px',
                                background: '#ff9800',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Add +
                        </button>
                    </div>
                ))}

                {menuItems.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                        <h3>No items found</h3>
                        <p>This restaurant hasn't added their menu yet.</p>
                    </div>
                )}
            </div>

            {basketItems.length > 0 && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#2e7d32',
                    color: 'white',
                    padding: '15px 30px',
                    borderRadius: '30px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'center',
                    cursor: 'pointer',
                    zIndex: 1000
                }} onClick={() => navigate('/checkout')}>
                    <span style={{ fontWeight: 'bold' }}>{basketItems.reduce((a, b) => a + b.qty, 0)} items</span>
                    <span>|</span>
                    <span style={{ fontWeight: 'bold' }}>£{getBasketTotal().toFixed(2)}</span>
                    <span style={{ marginLeft: '10px' }}>View Basket &rarr;</span>
                </div>
            )}
        </div>
    );
};

export default CustomerMenu;