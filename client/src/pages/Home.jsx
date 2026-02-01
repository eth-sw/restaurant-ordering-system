import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * Home Component
 */
const Home = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // useEffect runs once when component loads
    useEffect(() => {
        const fetchUser = async () => {
            // Retrieve token from Local Storage
            const token = localStorage.getItem('token');

            if (!token) {
                return;
            }

            try {
                // Send GET request with Token in the header
                const res = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: {
                        'x-auth-token': token
                    }
                });

                setUser(res.data);
            } catch (err) {
                console.error("Error fetching user", err);
                // If token is invalid, remove it
                localStorage.removeItem('token');
            }
        };

        fetchUser();
    }, []);

    // Handle Logout
    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove token
        setUser(null);
        navigate('/login'); // Redirect to login
    };

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Welcome to the Restaurant App</h1>

            {user ? (
                <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #4caf50', borderRadius: '8px', display: 'inline-block' }}>
                    <h2 style={{ color: '#2e7d32' }}>Hello, {user.name}!</h2>
                    <p>Email: {user.email}</p>
                    <p>Role: <strong>{user.role}</strong></p>
                    <button
                        onClick={handleLogout}
                        style={{ marginTop: '10px', padding: '10px 20px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <div style={{ marginTop: '20px' }}>
                    <p>Please log in to manage your account.</p>
                </div>
            )}
        </div>
    );
};

export default Home;