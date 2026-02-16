import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DeliveryZoneMap from '../components/DeliveryZoneMap';
import './Register.css';

/**
 * CreateRestaurant Component.
 * Allows a logged-in user to create their restaurant profile.
 * Links the restaurant to the user's ID via the backend.
 *
 * @returns {React.JSX.Element} Restaurant setup form
 *
 * @author Ethan Swain
 */

const CreateRestaurant = () => {
    // State for form inputs
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        cuisine: ''
    });

    const [deliveryZone, setDeliveryZone] = useState(null);

    // State to handle success/error messages
    const [message, setMessage] = useState('');

    // Hook to navigate user after creating restaurant successfully
    const navigate = useNavigate();

    const { name, address, cuisine } = formData;

    // Update state dynamically as user types
    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Callback from Map component
    const handleZoneChange = (polygonPath) => {
        setDeliveryZone(polygonPath);
    };

    // Handles form submission
    const onSubmit = async (e) => {
        e.preventDefault(); // Prevents default HTML form reload
        const token = localStorage.getItem('token');

        if (!deliveryZone) {
            setMessage('Error: Please draw a delivery zone on the map.');
            return;
        }

        try {
            const payload = {
                ...formData,
                deliveryZone: {
                    type: 'Polygon',
                    coordinates: [deliveryZone]
                }
            };

            await axios.post('http://localhost:5000/api/restaurants', payload, {
                headers: {
                    'x-auth-token': token
                }
            });

            setMessage('Restaurant Created Successfully! Redirecting...');
            setTimeout(() => navigate('/'), 1500);

        } catch (err) {
            console.error(err);
            setMessage('Error: ' + (err.response?.data?.message || 'Error creating restaurant'));
        }
    };

    return (
        <div className="register-container">
            <div className="register-card" style={{ maxWidth: '800px' }}>
                <h2>Setup Your Restaurant</h2>
                <p style={{marginBottom: '20px', color: '#666'}}>Tell us about your restaurant and draw your delivery area.</p>

                {message && (
                    <div className="message-box" style={{
                        backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9',
                        color: message.includes('Error') ? '#c62828' : '#2e7d32',
                        padding: '10px',
                        marginBottom: '15px',
                        borderRadius: '4px'
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Restaurant Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={name}
                            onChange={onChange}
                            placeholder="e.g. John's Pizza"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <input
                            id="address"
                            type="text"
                            name="address"
                            value={address}
                            onChange={onChange}
                            placeholder="e.g. 123 Street Lane"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cuisine">Cuisine Type</label>
                        <select
                            name="cuisine"
                            value={cuisine}
                            onChange={onChange}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}>
                            <option value="">Select Cuisine...</option>
                            <option value="Italian">Italian</option>
                            <option value="Indian">Indian</option>
                            <option value="Chinese">Chinese</option>
                            <option value="Burgers">Burgers</option>
                            <option value="Vegan">Vegan</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginTop: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            Delivery Zone
                            <span style={{ fontWeight: 'normal', fontSize: '0.9em', color: '#666', marginLeft: '10px' }}>
                                (Click points to shape area, click first point to close)
                            </span>
                        </label>
                        <div style={{ border: '1px solid #ddd', padding: '5px' }}>
                            <DeliveryZoneMap onZoneChange={handleZoneChange} />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '20px' }}>
                        Create Restaurant
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateRestaurant;