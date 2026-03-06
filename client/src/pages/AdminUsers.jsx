import {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

/**
 * AdminUsers Component.
 * Dashboard for admins to view, create, and delete users.
 *
 * @returns {React.JSX.Element} User management dashboard
 *
 * @author Ethan Swain
 */
const AdminUsers = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);

    // Default form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '+44',
        password: '',
        role: 'staff'
    });

    // UI feedback
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const {name, email, phone, password, role} = formData;

    /**
     * Fetches registered users from the backend.
     * Passwords are automatically stripped.
     * @returns {Promise<void>}
     */
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/users', {
                headers: {'x-auth-token': token}
            });
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users", err);
            setMessage('Error: Could not load users');
        }
    };

    useEffect(() => {
        fetchUsers();
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
     * Resets form and refreshes table if successful.
     */
    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/users', formData, {
                headers: {'x-auth-token': token}
            });

            setMessage('User created successfully');

            // Clear form after successful
            setFormData({name: '', email: '', phone: '', password: '', role: 'staff'});

            // Fetch updated list so new user instantly appears
            fetchUsers();
        } catch (err) {
            console.error(err);
            setMessage('Error: Could not create user');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles deletion of specific user account.
     *
     * @param id MongoDB ID of user to delete
     * @param userName Display name of the user
     */
    const handleDelete = async (id, userName) => {
        if (!globalThis.confirm(`Are you sure you want to delete ${userName}?`)) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/users/${id}`, {
                headers: {'x-auth-token': token}
            });

            // Remove deleted user from local state array
            setUsers(users.filter(user => user._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Error deleting user");
        }
    };

    const getRoleStyle = (userRole) => {
        switch(userRole) {
            case 'admin': return { color: '#c62828', background: '#ffebee' };
            case 'supervisor': return { color: '#ef6c00', background: '#fff3e0' };
            case 'staff': return { color: '#1565c0', background: '#e3f2fd' };
            default: return { color: '#2e7d32', background: '#e8f5e9' };
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

            <h1 style={{borderBottom: '3px solid #1976d2', display: 'inline-block', marginBottom: '30px'}}>User
                Management</h1>

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

            {/* Create User Form Section */}
            <div style={{
                background: '#f5f5f5',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '40px',
                border: '1px solid #ddd'
            }}>
                <h3>Create New Account</h3>
                <form onSubmit={onSubmit} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>

                    {/* Input Fields */}
                    <input type="text" name="name" value={name} onChange={onChange} placeholder="Full Name" required
                           style={{padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}/>
                    <input type="email" name="email" value={email} onChange={onChange} placeholder="Email Address"
                           required style={{padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}/>
                    <input type="tel" name="phone" value={phone} onChange={onChange} placeholder="Phone Number (+44...)"
                           required style={{padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}/>
                    <input type="password" name="password" value={password} onChange={onChange}
                           placeholder="Password (Min 6 chars)" minLength="6" required
                           style={{padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}/>

                    {/* Role Dropdown */}
                    <select name="role" value={role} onChange={onChange}
                            style={{padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}>
                        <option value="customer">Customer</option>
                        <option value="staff">Staff</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="admin">Admin</option>
                    </select>

                    {/* Submit Button */}
                    <button type="submit" disabled={loading} style={{
                        padding: '10px',
                        background: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}>
                        {loading ? 'Creating...' : '+ Create Account'}
                    </button>
                </form>
            </div>

            {/* Existing Users Table Section */}
            <h3>Existing Users ({users.length})</h3>
            <div style={{background: 'white', borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                    <thead>
                    <tr style={{background: '#eee'}}>
                        <th style={{padding: '12px'}}>Name</th>
                        <th style={{padding: '12px'}}>Email</th>
                        <th style={{padding: '12px'}}>Phone</th>
                        <th style={{padding: '12px'}}>Role</th>
                        <th style={{padding: '12px', textAlign: 'center'}}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(u => (
                        <tr key={u._id} style={{borderBottom: '1px solid #eee'}}>
                            <td style={{padding: '12px'}}>{u.name}</td>
                            <td style={{padding: '12px'}}>{u.email}</td>
                            <td style={{padding: '12px'}}>{u.phone}</td>
                            <td style={{padding: '12px'}}>
                                {/* Role Badges Styled Based on Staff Hierarchy */}
                                <span style={{
                                    padding: '4px 8px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 'bold', ...getRoleStyle(u.role)
                                }}>
                                        {u.role.toUpperCase()}
                                    </span>
                            </td>
                            <td style={{padding: '12px', textAlign: 'center'}}>
                                <button onClick={() => handleDelete(u._id, u.name)} style={{
                                    background: '#d32f2f',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;