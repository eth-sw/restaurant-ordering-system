import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import AddressCheck from '../components/AddressCheck';

/**
 * Home Component.
 * Fetches and displays User Profiles, Restaurant Details, and menu Items.
 * Handles the logic based on whether the user has created a restaurant or not
 *
 * @returns {React.JSX.Element} Dashboard view
 *
 * @author Ethan Swain
 */
const Home = () => {
    // Auth state
    const [user, setUser] = useState(null);
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);

    // Customer state
    const [deliveryLocation, setDeliveryLocation] = useState(null);
    const [availableRestaurants, setAvailableRestaurants] = useState([]);
    const [isCheckingLocation, setIsCheckingLocation] = useState(true);

    const navigate = useNavigate();

    // Fetches the data
    useEffect(() => {
        const fetchData = async () => {
            // Get authentication token
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // Get user data
                const userRes = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: { 'x-auth-token': token }
                });
                setUser(userRes.data);

                // Check if user owns a restaurant
                try {
                    const restRes = await axios.get('http://localhost:5000/api/restaurants/mine', {
                        headers: { 'x-auth-token': token }
                    });

                    if(restRes.data) {
                        setRestaurant(restRes.data);

                        // Get menu items (if the restaurant exists)
                        const menuRes = await axios.get('http://localhost:5000/api/menu', {
                            headers: {'x-auth-token': token}
                        });
                        setMenuItems(menuRes.data);
                    }

                } catch (err) {
                    console.info("User is not a restaurant owner.");
                }

            } catch (err) {
                console.error("Error fetching data", err);
                // If token is invalid, remove it, force user to login again
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove token
        setUser(null);
        setRestaurant(null);
        navigate('/login');
    };

    // Customer has entered a valid address inside a zone
    const handleAddressValidated = (address, coords, restaurants) => {
        setDeliveryLocation({ address, coords });
        setAvailableRestaurants(restaurants);
        setIsCheckingLocation(false);
    };

    const handleResetLocation = () => {
        setDeliveryLocation(null);
        setAvailableRestaurants([]);
        setIsCheckingLocation(true);
    };

    if(!user) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h1>Welcome to the Restaurant</h1>
                <p>Please <Link to="/login">Login</Link> or <Link to="/register">Register</Link></p>
            </div>
        );
    }
    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto'}} >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, color: '#1565c0' }}>Hello, {user.name}!</h2>
                <button
                    onClick={handleLogout}
                    style={{ padding: '8px 16px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Logout
                </button>
            </div>

            {/* Restaurant details */}
            {restaurant ? (
                <div style={{ border: '2px solid #4caf50', borderRadius: '10px', padding: '30px', background: 'white' }}>
                    <h1 style={{ textAlign: 'center' }}>Restaurant Dashboard</h1>
                    <h2 style={{ color: '#2e7d32', fontSize: '28px' }}>{restaurant.name}</h2>
                    <p>Address: {restaurant.address} | Cuisine: {restaurant.cuisine}</p>

                    <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Your Menu</h3>
                            <Link to="/add-menu">
                                <button style={{ background: '#4caf50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>
                                    Add Item
                                </button>
                            </Link>
                        </div>

                        {/* Menu grid */}
                        {menuItems.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                                {menuItems.map(item => (
                                    <div key={item._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', textAlign: 'left', background: '#fafafa' }}>
                                        <h4 style={{ margin: '0 0 5px 0' }}>{item.name}</h4>
                                        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{item.category}</p>
                                        <p style={{ fontSize: '12px', color: '#888' }}>{item.description}</p>
                                        <p style={{ fontWeight: 'bold', color: '#2e7d32' }}>{item.price.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#888' }}>No items on the menu yet</p>
                        )}
                    </div>
                </div>
            ) : (
            // If user has no restaurant
                <div>
                    <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Find Food Near You</h1>

                    {isCheckingLocation && (
                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <AddressCheck onAddressValidated={handleAddressValidated} />

                            <div style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                <p style={{ color: '#666' }}>Are you a restaurant owner?</p>
                                <Link to="/create-restaurant">
                                    <button style={{ padding: '10px 20px', background: '#9e9e9e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Create Business Account
                                    </button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {!isCheckingLocation && deliveryLocation && (
                        <div>
                            <div style={{
                                background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <span>Delivering to: <strong>{deliveryLocation.address}</strong></span>
                                <button onClick={handleResetLocation} style={{ cursor: 'pointer', border: 'none', background: 'transparent', color: '#1976d2', textDecoration: 'underline' }}>
                                    Change Location
                                </button>
                            </div>

                            {availableRestaurants.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                                    {availableRestaurants.map(rest => (
                                        <div key={rest._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                            <h3 style={{ margin: '0 0 10px 0' }}>{rest.name}</h3>
                                            <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                                {rest.cuisine}
                                            </span>
                                            <p style={{ color: '#666', fontSize: '14px', margin: '10px 0' }}>{rest.address}</p>
                                            <Link to={`/menu/${rest._id}`}>
                                                <button style={{ width: '100%', padding: '10px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                    View Menu
                                                </button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    <h3>No restaurants found here.</h3>
                                    <p>Try a different address.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;