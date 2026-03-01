import {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';
import AddressCheck from '../components/AddressCheck';
import BasketContext from "../context/BasketContext.jsx";

/**
 * Home Component.
 * Main page of the app.
 * Allows users and guests to view menu, add items to basket, and check delivery availability.
 * Displays admin buttons based on role.
 *
 * @returns {React.JSX.Element} Dashboard view
 *
 * @author Ethan Swain
 */
const Home = () => {
    // Auth state
    const [user, setUser] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [deliveryStatus, setDeliveryStatus] = useState(null);
    const [eta, setEta] = useState('');

    const [isStoreOpen, setIsStoreOpen] = useState(true);

    const [restaurantName, setRestaurantName] = useState('Our Restaurant');

    const { basketItems, addToBasket, getBasketTotal } = useContext(BasketContext);
    const navigate = useNavigate();

    const isAdmin = user && (user.role === 'admin' || user.role === 'supervisor');
    const isStaff = user && ['admin', 'supervisor', 'staff'].includes(user.role);
    const isCustomer = user && user.role === 'customer';

    // Fetches the data
    useEffect(() => {
        const fetchData = async () => {
            // Get authentication token
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Get user data
                    const userRes = await axios.get('http://localhost:5000/api/auth/me', {
                        headers: {'x-auth-token': token}
                    });
                    setUser(userRes.data);
                } catch (err) {
                    console.info("Authentication error", err);
                }
            }
            try {
                const menuRes = await axios.get('http://localhost:5000/api/menu');
                setMenuItems(menuRes.data);

                const restRes = await axios.get('http://localhost:5000/api/restaurants');
                const restaurantConfig = Array.isArray(restRes.data) ? restRes.data[0] : restRes.data;
                if (restaurantConfig) {
                    if (restaurantConfig.isOpen !== undefined) {
                        setIsStoreOpen(restaurantConfig.isOpen);
                    }
                    if (restaurantConfig.name) {
                        setRestaurantName(restaurantConfig.name);
                    }
                }
            } catch (err) {
                console.error("Menu fetch error", err);
            }
        };
        fetchData();
    }, []);

    const toggleStoreStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.patch('http://localhost:5000/api/restaurants/status', {}, {
                headers: { 'x-auth-token': token }
            });
            setIsStoreOpen(res.data.isOpen);
            alert(res.data.message);
        } catch (err) {
            alert("Error updating store status");
        }
    };

    // Customer has entered a valid address inside a zone
    const handleAddressValidated = (address, coords, resultData) => {
        if (resultData.availableRestaurants && resultData.availableRestaurants.length > 0) {
            setDeliveryStatus('success');
            setEta(resultData.eta || '40 mins');
        } else if (resultData.canDeliver) {
            setDeliveryStatus('success');
            setEta(resultData.eta);
        } else {
            setDeliveryStatus('fail');
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Delete this item?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/menu/${id}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setMenuItems(menuItems.filter(item => item._id !== id));
        } catch(err) {
            alert("Error deleting item");
        }
    };
    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header Section */}
            <header style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#e8f5e9',
                borderRadius: '15px',
                marginBottom: '40px'
            }}>
                <h1 style={{ fontSize: '3rem', color: '#2e7d32', marginBottom: '10px' }}>
                    Welcome to {restaurantName}
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#555' }}>
                    Food delivered straight to your door.
                </p>

                {user && <p>Welcome back, <strong>{user.name}</strong>!</p>}

                {/* Store status */}
                {isAdmin && (
                    <button onClick={toggleStoreStatus} style={{ margin: '15px 0', padding: '10px 20px', background: isStoreOpen ? '#d32f2f' : '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isStoreOpen ? 'Close Restaurant' : 'Open Restaurant'}
                    </button>
                )}

                {!isStoreOpen && (
                    <div style={{ background: '#c62828', color: 'white', padding: '15px', borderRadius: '8px', maxWidth: '500px', margin: '20px auto', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        We are currently closed.
                    </div>
                )}

                {(!user || isCustomer) && (
                    <div style={{ maxWidth: '500px', margin: '30px auto', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginTop: 0 }}>Check Delivery Availability</h3>
                        <AddressCheck onAddressValidated={handleAddressValidated} />
                        {deliveryStatus === 'success' && (
                            <div style={{ marginTop: '15px', color: '#2e7d32', fontWeight: 'bold', padding: '10px', background: '#e8f5e9', borderRadius: '5px' }}>
                                We deliver to you! <br/>
                                <span style={{ fontSize: '0.9em' }}>Estimated Time: {eta}</span>
                            </div>
                        )}
                        {deliveryStatus === 'fail' && (
                            <div style={{ marginTop: '15px', color: '#c62828', fontWeight: 'bold', padding: '10px', background: '#ffebee', borderRadius: '5px' }}>
                                We do not deliver to you.
                            </div>
                        )}
                    </div>
                )}
            </header>

            {/* Menu Section */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '2rem', borderBottom: '3px solid #2e7d32', display: 'inline-block' }}>Our Menu</h2>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        {/* Kitchen Dashboard Button (Staff/Admin) */}
                        {isStaff && (
                            <Link to="/kitchen">
                                <button style={{ background: '#1976d2', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                    Kitchen Orders
                                </button>
                            </Link>
                        )}

                        {/* Add Menu Item Button (Admin Only) */}
                        {isAdmin && (
                            <Link to="/add-menu">
                                <button style={{ background: '#d32f2f', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                    + Add Menu Item
                                </button>
                            </Link>
                        )}

                        {!user && (
                            <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>Log in to order &rarr;</Link>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                    {menuItems.map(item => (
                        <div key={item._id} style={{
                            border: '1px solid #eee',
                            borderRadius: '10px',
                            padding: '0',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            background: 'white'
                        }}>
                            {/* Menu Image */}
                            <img
                                src={item.image ? (item.image.startsWith('/uploads') ? `http://localhost:5000${item.image}` : item.image) : 'https://placehold.co/400x300?text=No+Image'}
                                alt={item.name}
                                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                            />
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>{item.name}</h3>
                                    <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '5px 10px', borderRadius: '15px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        £{item.price.toFixed(2)}
                                    </span>
                                </div>
                                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>{item.description}</p>
                                <p style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>{item.category}</p>

                                {/* Add to Basket Button */}
                                {!isStaff && (
                                    <button
                                        onClick={() => addToBasket(item)}
                                        disabled={!isStoreOpen}
                                        style={{
                                            width: '100%',
                                            marginTop: '15px',
                                            padding: '10px',
                                            background: isStoreOpen ? '#2e7d32' : '#9e9e9e',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: isStoreOpen ? 'pointer' : 'not-allowed'
                                        }}>
                                        {isStoreOpen ? 'Add to Basket' : 'Store Closed'}
                                    </button>
                                )}

                                {isAdmin && (
                                    <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                                        <Link to={`/edit-menu/${item._id}`} style={{ flex: 1 }}>
                                            <button style={{ width: '100%', background: '#1976d2', color: 'white', border: 'none', padding: '5px', borderRadius: '5px', cursor: 'pointer' }}>Edit</button>
                                        </Link>
                                        <button onClick={() => handleDelete(item._id)} style={{ flex: 1, background: '#d32f2f', color: 'white', border: 'none', padding: '5px', borderRadius: '5px', cursor: 'pointer' }}>Delete</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {(!user || isCustomer) && basketItems.length > 0 && (
                <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#2e7d32', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 -4px 10px rgba(0,0,0,0.2)' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {basketItems.reduce((acc, i) => acc + i.qty, 0)} items in basket | Total: £{getBasketTotal().toFixed(2)}
                    </span>
                    <Link to="/checkout">
                        <button style={{ background: 'white', color: '#2e7d32', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                            View Checkout &rarr;
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Home;