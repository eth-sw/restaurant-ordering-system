import {useEffect, useState} from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom';

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
    const [formData, setFormData] = useState({ name: '', price: '', description: '', category: 'Pizza', image: '' });

    useEffect(() => {
        axios.get('http://localhost:5000/api/menu')
            .then(res => {
                const item = res.data.find(i => i._id === id);
                if (item) setFormData({
                    name: item.name,
                    price: item.price,
                    description: item.description,
                    category: item.category,
                    image: item.image || ''
                });
            })
            .catch(err => console.error(err));
    }, [id]);

    // Handles form submission
    const onSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:5000/api/menu/${id}`, formData, {
                headers: { 'x-auth-token': token }
            });
            alert("Item Updated!");

            globalThis.location.href = '/';
        } catch (err) {
            alert("Error updating item");
        }
    };

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Edit Item</h1>
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input name="name" value={formData.name} onChange={onChange} placeholder="Name" style={{ padding: '10px' }} />
                <input name="price" value={formData.price} onChange={onChange} type="number" step="0.01" style={{ padding: '10px' }} />
                <textarea name="description" value={formData.description} onChange={onChange} style={{ padding: '10px' }} />
                <select name="category" value={formData.category} onChange={onChange} style={{ padding: '10px' }}>
                    <option value="Pizza">Pizza</option>
                    <option value="Burger">Burger</option>
                    <option value="Side">Side</option>
                    <option value="Drink">Drink</option>
                    <option value="Dessert">Dessert</option>
                </select>
                <input name="image" value={formData.image} onChange={onChange} placeholder="Image URL" style={{ padding: '10px'}} />

                <button type="submit" style={{ padding: '10px', background: '#2e7d32', color: 'white', border: 'none', cursor: 'pointer' }}>Update Item</button>
                <button type="button" onClick={() => globalThis.location.href = '/'} style={{ padding: '10px', background: '#ccc', border: 'none', cursor: 'pointer' }}>Cancel</button>
            </form>
        </div>
    );
};

export default EditMenu;