import {useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import './Register.css';

/**
 * AddMenu Component.
 * Allows restaurant owner to add items to their menu.
 *
 * @returns {React.JSX.Element} Add Menu Item form
 *
 * @author Ethan Swain
 */
const AddMenu = () => {
    // State for form inputs
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Pizza'
    });

    // State to handle success/error messages
    const [message, setMessage] = useState('');

    // Hook to navigate user after creating restaurant successfully
    const navigate = useNavigate();

    const { name, description, price, category } = formData;

    // Update state dynamically as user types
    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handles form submission
    const onSubmit = async (e) => {
        e.preventDefault(); // Prevents default HTML form reload

        // Retrieve token
        const token = localStorage.getItem('token');

        try {
            await axios.post('http://localhost:5000/api/menu', formData, {
                headers: { 'x-auth-token': token }
            });

            setMessage('Item Added Successfully.');

            // Clears form but keeps the category so extra item can be easily added
            setFormData({
                    ...formData,
                    name: '',
                    description: '',
                    price: ''
            });

            setTimeout(() => setMessage(''), 1500);
        } catch (err) {
            setMessage('Error: ' + (err.response?.data?.message || 'Cannot add item'));
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
            <h2>Add Menu Item</h2>

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
                    <label htmlFor="name">Item Name</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={name}
                        onChange={onChange}
                        placeholder="e.g. Pepperoni Pizza"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={description}
                        onChange={onChange}
                        placeholder="e.g. Tomato base with cheese and pepperoni..."
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                        id="price"
                        type="number"
                        name="price"
                        value={price}
                        onChange={onChange}
                        placeholder="12.99"
                        step="0.01"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={category}
                        onChange={onChange}
                        style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}>
                        <option value="Pizza">Pizza</option>
                        <option value="Burger">Burger</option>
                        <option value="Drink">Drink</option>
                        <option value="Side">Side</option>
                        <option value="Dessert">Dessert</option>
                    </select>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '20px' }}>Add to Menu</button>

                <button
                    type="button"
                    onClick={() => navigate('/')}
                    style={{ marginTop: '10px', width: '100%', padding: '10px', background: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Back to Dashboard
                </button>
            </form>
            </div>
        </div>
    );
};

export default AddMenu;