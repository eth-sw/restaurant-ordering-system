import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import './Register.css';

/**
 * EditMenu component.
 * Allows admins and supervisors to edit menu items.
 *
 * @returns {React.JSX.Element} Edit Menu Item form
 *
 * @author Ethan Swain
 */
const EditMenu = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Pizza',
        image: ''
    });
    const [file, setFile] = useState(null);

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { name, description, price, category, image } = formData;

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/menu');
                const itemToEdit = res.data.find(item => item._id === id);

                if (itemToEdit) {
                    setFormData({
                        name: itemToEdit.name,
                        description: itemToEdit.description,
                        price: itemToEdit.price,
                        category: itemToEdit.category,
                        image: itemToEdit.image || ''
                    });
                } else {
                    setMessage('Error: Item not found');
                }
            } catch (err) {
                console.error("Error fetching item", err);
                setMessage('Error: Could not load item data');
            }
        };
        fetchItem();
    }, [id]);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onFileChange = e => setFile(e.target.files[0]);

    // Handles form submission
    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            let finalImageUrl = image;

            if (file) {
                const uploadData = new FormData();
                uploadData.append('image', file);

                const uploadRes = await axios.post('http://localhost:5000/api/upload', uploadData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'x-auth-token': token
                    }
                });

                finalImageUrl = uploadRes.data.imageUrl;
            }

            const payload = {
                name,
                price: Number(price),
                description,
                category,
                image: finalImageUrl
            };

            await axios.put(`http://localhost:5000/api/menu/${id}`, payload, {
                headers: { 'x-auth-token': token }
            });

            setMessage('Menu item updated successfully');
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            console.error(err);
            setMessage('Error: Could not update menu item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
            <h2>Edit Menu Item</h2>

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
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="price">Price (£)</label>
                    <input
                        id="price"
                        type="number"
                        name="price"
                        value={price}
                        onChange={onChange}
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

                <div className="form-group">
                    <label htmlFor="image">Upload New Image (Optional)</label>
                    {image && !file && <p style={{ fontSize: '0.85em', color: '#666', marginTop: 0, marginBottom: '5px' }}>Uploading a new file will replace it.</p>}

                    <input
                        id="image"
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={onFileChange}
                        style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'white' }}
                        />
                </div>

                <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '20px' }}>
                        {loading ? 'Saving...' : 'Update Menu Item'}
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/')}
                    style={{ marginTop: '10px', width: '100%', padding: '10px', background: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Cancel & Back
                </button>
            </form>
            </div>
        </div>
    );
};

export default EditMenu;