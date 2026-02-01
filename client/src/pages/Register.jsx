import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

/**
 * Register Component
 * Displays a sign-up form and handles the user creation process via the API
 */
const Register = () => {
    // State for managing form input values
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    // State for feedback messages (Success or Error)
    const [message, setMessage] = useState('');

    // Hook for redirection after successful registration
    const navigate = useNavigate();

    // Destructure values for easier access in the JSX below
    const { name, email, password } = formData;

    // Handle input changes, updates specific field in the state object
    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const onSubmit = async (e) => {
        e.preventDefault(); // Prevent page reload
        try {
            // Send POST request to backend with form data
            await axios.post('http://localhost:5000/api/auth/register', formData);
            setMessage('Registration Successful! Redirecting...');
            // Delay redirect slightly so user can read the success message
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            // Handle errors
            setMessage('Error: ' + (err.response?.data?.message || 'Server Error'));
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Create Account</h2>

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
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={onChange}
                            placeholder="John Smith"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            placeholder="johnsmith@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            minLength="6"
                            placeholder="Min 6 characters"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary">
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;