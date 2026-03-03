import {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

/**
 * AdminSettings Component.
 * Dashboard for admins to update the restaurant's settings/config.
 * Fetches, validates, and saves restaurant details.
 *
 * @returns {React.JSX.Element} Settings dashboard form
 *
 * @author Ethan Swain
 */
const AdminSettings = () => {
    const navigate = useNavigate();

    // Predefined list of cuisines for dropdown menu
    const cuisineOptions = [
        'American', 'British', 'Chinese', 'Fast Food', 'Indian', 'Italian',
        'Japanese', 'Mexican', 'Vegan/Vegetarian', 'Other'
    ];

    // Default form data
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '+44',
        email: '',
        cuisine: '',
        deliveryFee: 0
    });

    // UI feedback
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const {name, address, phone, email, cuisine, deliveryFee} = formData;

    /**
     * Fetches current restaurant settings.
     * Ensures phone number has a +44 prefix.
     */
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/restaurants');
                // Supports both array and object responses
                const config = Array.isArray(res.data) ? res.data[0] : res.data;

                if (config) {
                    // Standardise phone number format
                    let fetchedPhone = config.phone || '';
                    if (fetchedPhone && !fetchedPhone.startsWith('+44')) {
                        fetchedPhone = '+44' + fetchedPhone.replace(/^0/, '');
                    }

                    // Update form with values from DB
                    setFormData({
                        name: config.name || '',
                        address: config.address || '',
                        phone: fetchedPhone || '+44',
                        email: config.email || '',
                        cuisine: config.cuisine || '',
                        deliveryFee: config.deliveryFee || 0,
                    });
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
                setMessage('Error: Could not load restaurant settings');
            }
        };
        fetchSettings();
    }, []);

    /**
     * Handles input changes across all form fields.
     * Ensures phone number has a +44 prefix.
     */
    const onChange = (e) => {
        let {name, value} = e.target;

        if (name === 'phone') {
            if (!value.startsWith('+44')) {
                value = '+44';
            }
        }

        setFormData({...formData, [name]: value});
    };

    /**
     * Pushes the updated config to the backend API.
     */
    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');

            // Cast delivery fee to a number before sending
            const payload = {
                ...formData,
                deliveryFee: Number(deliveryFee)
            };

            await axios.put('http://localhost:5000/api/restaurants', payload, {
                headers: {'x-auth-token': token}
            });

            setMessage('Settings updated successfully');

            // Scroll to top of page so user sees success message
            globalThis.scrollTo({top: 0, behavior: 'smooth'});
        } catch (err) {
            console.error(err);
            setMessage('Error: Could not update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{maxWidth: '800px', margin: '0 auto', padding: '20px'}}>
            {/* Navigation Header */}
            <button onClick={() => navigate('/')} style={{
                marginBottom: '20px',
                background: 'none',
                border: 'none',
                color: '#1976d2',
                textDecoration: 'underline',
                cursor: 'pointer'
            }}>
                &larr; Back to Dashboard
            </button>

            <h1 style={{borderBottom: '3px solid #1976d2', display: 'inline-block', marginBottom: '30px'}}>Restaurant
                Settings</h1>

            {/* Status Message Box */}
            {message && (
                <div style={{
                    padding: '15px',
                    marginBottom: '20px',
                    borderRadius: '5px',
                    background: message.includes('Error:') ? '#ffebee' : '#e8f5e9',
                    color: message.includes('Error:') ? '#c62828' : '#2e7d32'
                }}>
                    {message}
                </div>
            )}

            {/* Settings Form Wrapper */}
            <div style={{background: '#f5f5f5', padding: '20px', borderRadius: '8px', border: '1px solid #ddd'}}>
                <form onSubmit={onSubmit} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>

                    {/* Input Fields */}
                    <input type="text" name="name" value={name} onChange={onChange} placeholder="Restaurant Name"
                           style={{padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}/>
                    <input type="text" name="address" value={address} onChange={onChange} placeholder="Address"
                           style={{padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}/>
                    <input type="email" name="email" value={email} onChange={onChange} placeholder="Email Address"
                           style={{padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}/>
                    <input type="tel" name="phone" value={phone} onChange={onChange} placeholder="Phone Number (+44...)"
                           style={{padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}/>

                    {/* Cuisine Dropdown */}
                    <select name="cuisine" value={cuisine} onChange={onChange}
                            style={{padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}>
                        <option value="" disabled>Select Cuisine Type</option>
                        {cuisineOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>

                    <input type="number" step="0.01" min="0" name="deliveryFee" value={deliveryFee} onChange={onChange}
                           required placeholder="Delivery Fee (£)"
                           style={{padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}/>

                    {/* Submit Button */}
                    <button type="submit" disabled={loading} style={{
                        gridColumn: 'span 2',
                        marginTop: '10px',
                        padding: '10px',
                        background: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}>
                        {loading ? 'Saving Changes...' : 'Save Settings'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminSettings;