import {useContext, useEffect, useState} from 'react';
import AddressCheck from '../components/AddressCheck';
import BasketContext from "../context/BasketContext.jsx";
import axios from 'axios';
import {Link} from 'react-router-dom';

/**
 * Home Component.
 * Main page of the app.
 * Allows users and guests to view menu, add items to basket, and check delivery availability.
 * Displays admin buttons based on role.
 *
 * @returns {React.JSX.Element} Dashboard view
 *
 * @author Ethan Swain
 */
const Home = () => {
    // Auth state
    const [user, setUser] = useState(null);
    const [menuItems, setMenuItems] = useState([]);

    const [isStoreOpen, setIsStoreOpen] = useState(true);
    const [restaurantName, setRestaurantName] = useState('Our Restaurant');

    const {basketItems, addToBasket, getBasketTotal} = useContext(BasketContext);

    const isAdmin = user?.role === 'admin' || user?.role === 'supervisor';
    const isStaff = ['admin', 'supervisor', 'staff'].includes(user?.role);
    const isCustomer = user?.role === 'customer';

    // Fetches the data
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Get user data
                    const userRes = await axios.get('http://localhost:5000/api/auth/me', {
                        headers: {'x-auth-token': token}
                    });
                    setUser(userRes.data);
                } catch (err) {
                    console.error(err);
                    setMessage("Error: Could not authenticate user.");
                }
            }
            try {
                const menuRes = await axios.get('http://localhost:5000/api/menu');
                setMenuItems(menuRes.data);

                const restRes = await axios.get('http://localhost:5000/api/restaurants');
                const restaurantConfig = Array.isArray(restRes.data) ? restRes.data[0] : restRes.data;
                if (restaurantConfig) {
                    if (restaurantConfig.isOpen !== undefined) {
                        setIsStoreOpen(restaurantConfig.isOpen);
                    }
                    if (restaurantConfig.name) {
                        setRestaurantName(restaurantConfig.name);
                    }
                }
            } catch (err) {
                console.error(err);
                setMessage("Error: Could not fetch menu.")
            }
        };
        fetchData();
    }, []);

    /**
     * Toggles restaurant's open/close status in DB.
     * Admin/Supervisor only.
     */
    const toggleStoreStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.patch('http://localhost:5000/api/restaurants/status', {}, {
                headers: {'x-auth-token': token}
            });
            setIsStoreOpen(res.data.isOpen);
            alert(res.data.message);
        } catch (err) {
            console.error(err);
            setMessage("Error: Could not update store status.");
        }
    };

    /**
     * Toggles a menu item's availability. Allows staff to mark items as "sold out".
     * @param id MongoDB ID of Menu Item
     * @param currentStatus Current availability flag
     */
    const toggleAvailability = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = currentStatus === false;

            await axios.put(`http://localhost:5000/api/menu/${id}`,
                {isAvailable: newStatus},
                {headers: {'x-auth-token': token}}
            );

            setMenuItems(menuItems.map(item =>
                item._id === id ? {...item, isAvailable: newStatus} : item
            ));
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Permanently delete menu item from the DB.
     * @param id MongoDB ID of menu item
     */
    const handleDelete = async (id) => {
        if (!globalThis.confirm("Delete this item?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/menu/${id}`, {
                headers: {'x-auth-token': localStorage.getItem('token')}
            });
            setMenuItems(menuItems.filter(item => item._id !== id));
        } catch (err) {
            console.error(err)
            setMessage("Error: Could not delete item.");
        }
    };

    const getImageUrl = (image) => {
        if (!image) return 'https://placehold.co/400x300?text=No+Image';
        if (image.startsWith('/uploads')) return `http://localhost:5000${image}`;
        return image;
    };

    const getButtonText = (item) => {
        if (!isStoreOpen) return 'Store Closed';
        if (item.isAvailable === false) return 'Unavailable';
        return 'Add to Basket';
    };

    const getButtonBg = (item) => (!isStoreOpen || item.isAvailable === false) ? '#9e9e9e' : '#2e7d32';
    const getButtonCursor = (item) => (!isStoreOpen || item.isAvailable === false) ? 'not-allowed' : 'pointer';

    return (
        <div style={{padding: '20px', maxWidth: '1200px', margin: '0 auto'}}>

            {/* Header Section */}
            <header style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#e8f5e9',
                borderRadius: '15px',
                marginBottom: '40px'
            }}>
                <h1 style={{fontSize: '3rem', color: '#2e7d32', marginBottom: '10px'}}>
                    Welcome to {restaurantName}
                </h1>
                <p style={{fontSize: '1.2rem', color: '#555'}}>
                    Food delivered straight to your door.
                </p>

                {user && <p>Welcome back, <strong>{user.name}</strong>!</p>}

                {/* Store status */}
                {isAdmin && (
                    <button onClick={toggleStoreStatus} style={{
                        margin: '15px 0',
                        padding: '10px 20px',
                        background: isStoreOpen ? '#d32f2f' : '#2e7d32',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}>
                        {isStoreOpen ? 'Close Restaurant' : 'Open Restaurant'}
                    </button>
                )}

                {!isStoreOpen && (
                    <div style={{
                        background: '#c62828',
                        color: 'white',
                        padding: '15px',
                        borderRadius: '8px',
                        maxWidth: '500px',
                        margin: '20px auto',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                    }}>
                        We are currently closed.
                    </div>
                )}

                {(!user || isCustomer) && (
                    <div style={{marginTop: '30px'}}>
                        <AddressCheck/>
                    </div>
                )}
            </header>

            {/* Menu Section */}
            <section>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h2 style={{fontSize: '2rem', borderBottom: '3px solid #2e7d32', display: 'inline-block'}}>Our
                        Menu</h2>

                    <div style={{display: 'flex', gap: '10px'}}>
                        {/* Kitchen Dashboard Button (Staff/Admin) */}
                        {isStaff && (
                            <Link to="/kitchen">
                                <button style={{
                                    background: '#1976d2',
                                    color: 'white',
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}>
                                    Kitchen Orders
                                </button>
                            </Link>
                        )}

                        {/* Add Menu Item Button (Admin Only) */}
                        {isAdmin && (
                            <Link to="/add-menu">
                                <button style={{
                                    background: '#d32f2f',
                                    color: 'white',
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}>
                                    + Add Menu Item
                                </button>
                            </Link>
                        )}

                        {!user && (
                            <Link to="/login" style={{textDecoration: 'none', color: '#1976d2'}}>Log in to
                                order &rarr;</Link>
                        )}
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '25px'
                }}>
                    {menuItems.map(item => (
                        <div key={item._id} style={{
                            opacity: item.isAvailable === false ? 0.6 : 1,
                            filter: item.isAvailable === false ? 'grayscale(100%)' : 'none',
                            border: '1px solid #eee',
                            borderRadius: '10px',
                            padding: '0',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            background: 'white'
                        }}>
                            {/* Menu Image */}
                            <img
                                src={getImageUrl(item.image)}
                                alt={item.name}
                                style={{width: '100%', height: '200px', objectFit: 'cover'}}
                            />
                            <div style={{padding: '20px'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                                    <h3 style={{margin: '0 0 10px 0', fontSize: '1.3rem'}}>{item.name}</h3>
                                    <span style={{
                                        background: '#e8f5e9',
                                        color: '#2e7d32',
                                        padding: '5px 10px',
                                        borderRadius: '15px',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem'
                                    }}>
                                        £{item.price.toFixed(2)}
                                    </span>
                                </div>
                                <p style={{
                                    color: '#666',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5'
                                }}>{item.description}</p>
                                <p style={{fontSize: '0.8rem', color: '#999', fontStyle: 'italic'}}>{item.category}</p>

                                {/* Add to Basket Button */}
                                {!isStaff && (
                                    <button
                                        onClick={() => addToBasket(item)}
                                        disabled={!isStoreOpen || item.isAvailable === false}
                                        style={{
                                            width: '100%',
                                            marginTop: '15px',
                                            padding: '10px',
                                            background: getButtonBg(item),
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: getButtonCursor(item)
                                        }}
                                    >
                                        {getButtonText(item)}
                                    </button>
                                )}

                                {isAdmin && (
                                    <div style={{display: 'flex', gap: '5px', marginTop: '10px'}}>
                                        <button
                                            onClick={() => toggleAvailability(item._id, item.isAvailable)}
                                            style={{
                                                flex: 1,
                                                background: item.isAvailable === false ? '#2e7d32' : '#f57c00',
                                                color: 'white',
                                                border: 'none',
                                                padding: '5px',
                                                borderRadius: '5px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {item.isAvailable === false ? 'Enable' : 'Disable'}
                                        </button>

                                        <Link to={`/edit-menu/${item._id}`} style={{flex: 1}}>
                                            <button style={{
                                                width: '100%',
                                                background: '#1976d2',
                                                color: 'white',
                                                border: 'none',
                                                padding: '5px',
                                                borderRadius: '5px',
                                                cursor: 'pointer'
                                            }}>Edit
                                            </button>
                                        </Link>

                                        <button onClick={() => handleDelete(item._id)} style={{
                                            flex: 1,
                                            background: '#d32f2f',
                                            color: 'white',
                                            border: 'none',
                                            padding: '5px',
                                            borderRadius: '5px',
                                            cursor: 'pointer'
                                        }}>Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {(!user || isCustomer) && basketItems.length > 0 && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: '#2e7d32',
                    color: 'white',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 -4px 10px rgba(0,0,0,0.2)'
                }}>
                    <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>
                        {basketItems.reduce((acc, i) => acc + i.qty, 0)} items in basket | Total: £{getBasketTotal().toFixed(2)}
                    </span>
                    <Link to="/checkout">
                        <button style={{
                            background: 'white',
                            color: '#2e7d32',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}>
                            View Checkout &rarr;
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Home;