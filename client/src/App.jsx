import {BrowserRouter as Router, Link, Navigate, Route, Routes} from 'react-router-dom';
import {BasketProvider} from './context/BasketContext';
import {useEffect, useState} from 'react';
import {jwtDecode} from "jwt-decode";

import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import AddMenu from './pages/AddMenu';
import Checkout from "./pages/Checkout";
import RestaurantOrders from "./pages/RestaurantOrders";
import OrderHistory from "./pages/OrderHistory";
import SetDeliveryZone from './pages/SetDeliveryZone';
import EditMenu from './pages/EditMenu';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';

/**
 * Protected Route Wrapper Component.
 * Stops users from accessing routes that they should not have access to.
 * Redirects unauthorised users to the login page or home page
 *
 * @param children The component to render if authorised
 * @param allowedRoles Array of roles allowed to access the route
 * @returns {*|React.JSX.Element} The requested route or redirect.
 *
 * @author Ethan Swain
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;

    try {
        const decodedUser = jwtDecode(token).user;
        if (allowedRoles && !allowedRoles.includes(decodedUser.role)) {
            return <Navigate to="/" replace />;
        }
        return children;
    } catch (e) {
        return <Navigate to="/login" replace />;
    }
}

/**
 * Main App Component.
 * Initialises the React Router and nav bar, manages auth state across tabs,
 * and defines all routes.
 *
 * @returns {React.JSX.Element} Root app component
 *
 * @author Ethan Swain
 */
function App() {
    const [user, setUser] = useState(null);

    // Initialise user state from jwt token and handles synchronisation across multiple tabs/windows
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                setUser(jwtDecode(token).user);
            } catch (e) {
                console.error("Invalid token");
            }
        }

        // Event listener to sync logout/login state across multiple tabs/windows
        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                globalThis.location.reload();
            }
        };

        globalThis.addEventListener('storage', handleStorageChange);
        return () => globalThis.removeEventListener('storage', handleStorageChange);
    }, []);

    /**
     * Logs a user out by destroying the token and refreshing.
     */
    const handleLogout = () => {
        localStorage.removeItem('token');
        globalThis.location.href = '/login';
    };

    // Role-based helpers for any conditional rendering
    const isCustomer = user && user.role === 'customer';
    const isStaff = user && ['staff', 'supervisor', 'admin'].includes(user.role);
    const isAdmin = user && ['supervisor', 'admin'].includes(user.role);

    return (
        <BasketProvider>
            <Router>
                <div className="App">
                    {/* Nav Bar */}
                    <nav style={{ padding: '20px', backgroundColor: '#f0f0f0', marginBottom: '20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <Link to="/" style={{ marginRight: '15px', fontWeight: 'bold', textDecoration: 'none', color: 'black' }}>
                                Home
                            </Link>
                            {isStaff && (
                                <Link to="/kitchen" style={{ marginRight: '15px', color: '#d32f2f', fontWeight: 'bold' }}>
                                    Kitchen Orders
                                </Link>
                            )}
                            {isAdmin && (
                                <>
                                    <Link to="/delivery-zone" style={{ marginRight: '15px', color: '#1976d2' }}>
                                        Delivery Zone
                                    </Link>
                                    <Link to="/admin/users" style={{ marginRight: '15px', color: '#6a1b9a', fontWeight: 'bold' }}>
                                        Manage Users
                                    </Link>
                                    <Link to="/admin/settings" style={{ marginRight: '15px', color: '#e65100', fontWeight: 'bold' }}>
                                        Settings
                                    </Link>
                                </>
                            )}
                        </div>

                        <div>
                            {!user && (
                                <>
                                    <Link to="/login" style={{ marginRight: '15px' }}>
                                        Login
                                    </Link>
                                    <Link to="/register" style={{ marginRight: '15px' }}>
                                        Register
                                    </Link>
                                </>
                            )}

                            {isCustomer && (
                                <>
                                    <Link to="/orders" style={{ marginRight: '15px', color: '#1565c0' }}>
                                        My Orders
                                    </Link>
                                    <Link to="/checkout" style={{ fontWeight: 'bold', color: '#2e7d32', marginRight: '15px' }}>
                                        Basket
                                    </Link>
                                </>
                            )}

                            {user && (
                                <button onClick={handleLogout} style={{ cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline', color: '#555' }}>
                                    Logout ({user.role})
                                </button>
                            )}
                        </div>
                    </nav>

                    {/* Route defs */}
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/checkout" element={<Checkout />} />

                        <Route path="/orders" element={
                            <ProtectedRoute allowedRoles={['customer']}><OrderHistory /></ProtectedRoute>
                        } />

                        {/* Staff/Admin routes */}
                        <Route path="/kitchen" element={
                            <ProtectedRoute allowedRoles={['staff', 'supervisor', 'admin']}><RestaurantOrders /></ProtectedRoute>
                        } />
                        <Route path="/delivery-zone" element={
                            <ProtectedRoute allowedRoles={['supervisor', 'admin']}><SetDeliveryZone /></ProtectedRoute>
                        } />
                        <Route path="/add-menu" element={
                            <ProtectedRoute allowedRoles={['supervisor', 'admin']}><AddMenu /></ProtectedRoute>
                        } />
                        <Route path="/edit-menu/:id" element={
                            <ProtectedRoute allowedRoles={['supervisor', 'admin']}><EditMenu /></ProtectedRoute>
                        } />
                        <Route path="/admin/users" element={
                            <ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>
                        } />
                        <Route path="/admin/settings" element={
                            <ProtectedRoute allowedRoles={['supervisor', 'admin']}><AdminSettings /></ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </Router>
        </BasketProvider>
    );
}

export default App;