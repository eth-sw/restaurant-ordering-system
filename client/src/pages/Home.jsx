import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

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
    const [user, setUser] = useState(null);
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
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

                // Get restaurant data
                try {
                    const restRes = await axios.get('http://localhost:5000/api/restaurants/mine', {
                        headers: { 'x-auth-token': token }
                    });
                    setRestaurant(restRes.data);

                    // Get menu items (if the restaurant exists)
                    const menuRes = await axios.get('http://localhost:5000/api/menu', {
                        headers: { 'x-auth-token': token }
                    });
                    setMenuItems(menuRes.data);

                } catch (err) {
                    console.info("No restaurant found for this user.", err.message);
                }

            } catch (err) {
                console.error("Error fetching data", err);
                // If token is invalid, remove it, force user to login again
                localStorage.removeItem('token');
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove token
        setUser(null);
        setRestaurant(null);
        navigate('/login');
    };

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1>Restaurant Dashboard</h1>

            {/* Check if user is logged in */}
            {user ? (
                <div>
                    {/* Welcome card */}
                    <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h2 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>Hello, {user.name}!</h2>
                        <button
                            onClick={handleLogout}
                            style={{ padding: '8px 16px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Logout
                        </button>
                    </div>

                    {/* Restaurant details */}
                    {restaurant ? (
                        <div style={{ border: '2px solid #4caf50', borderRadius: '10px', padding: '30px', background: 'white' }}>
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
                    <div style={{ border: '2px dashed #ccc', borderRadius: '10px', padding: '40px', background: '#fafafa' }}>
                        <h3>Start your Business</h3>
                        <Link to="/create-restaurant">
                            <button style={{ padding: '12px 24px', fontSize: '16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>
                                Create My Restaurant
                            </button>
                        </Link>
                    </div>
                )}

                </div>
            ) : (
                // Not logged in
                <div><Link to="/login">Go to Login</Link></div>
            )}
        </div>
    );
};

export default Home;