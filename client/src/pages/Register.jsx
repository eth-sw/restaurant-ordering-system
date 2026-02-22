import {useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import './Register.css';

/**
 * Register Component.
 * Provides a form for new customers to create an account.
 * Handles backend registration payload and redirects to login if successful.
 *
 * @returns {React.JSX.Element} Registration form UI
 *
 * @author Ethan Swain
 */
const Register = () => {
    // State to hold form input values
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });

    // State to handle success/error messages
    const [message, setMessage] = useState('');

    // Hook to redirect user after registering successfully
    const navigate = useNavigate();

    const { name, email, phone, password } = formData;

    // Update state dynamically as user types
    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const onSubmit = async (e) => {
        e.preventDefault(); // Prevents default HTML form reload
        try {
            // Send credentials to backend
            await axios.post('http://localhost:5000/api/auth/register', formData);

            setMessage('Registration Successful! Redirecting...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
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
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={name}
                            onChange={onChange}
                            placeholder="John Smith"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            placeholder="johnsmith@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number (Include +44)</label>
                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={phone}
                            onChange={onChange}
                            placeholder="+447123456789"
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