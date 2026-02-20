import {useState} from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';
import './Register.css';

/**
 * Login Component.
 * Provides a form for customers to login to their account.
 * Refreshes if successful.
 *
 * @returns {React.JSX.Element} Login form UI
 *
 * @author Ethan Swain
 */
const Login = () => {
    // State to hold form inputs
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // State to handle success/error messages
    const [message, setMessage] = useState('');

    // Hook to navigate user after logging in successfully
    const navigate = useNavigate();

    const { email, password } = formData;

    // Update state dynamically as user types
    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handles form submission
    const onSubmit = async (e) => {
        e.preventDefault(); // Prevents default HTML form reload
        try {
            // Send credentials to backend
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);

            // Restaurant received JWT in browser's local storage
            localStorage.setItem('token', res.data.token);

            setMessage('Login Successful! Redirecting...');
            setTimeout(() =>{
                window.location.href = '/';
            }, 1500);
        } catch (err) {
            setMessage('Error: ' + (err.response?.data?.message || 'Login Failed'));
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Welcome Back</h2>

                {message && (
                    <div className="message-box" style={{
                        backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9',
                        color: message.includes('Error') ? '#c62828' : '#2e7d32'
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary">
                        Login
                    </button>
                </form>
                <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;