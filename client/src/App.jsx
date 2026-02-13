import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BasketProvider } from './context/BasketContext'

import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import CreateRestaurant from './pages/CreateRestaurant';
import AddMenu from './pages/AddMenu';
import CustomerMenu from './pages/CustomerMenu';
import Checkout from "./pages/Checkout.jsx";

/**
 * Main App Component.
 * Sets up React Router, Nav Bar, and defines route paths
 *
 * @returns {React.JSX.Element} Root component containing router
 *
 * @author Ethan Swain
 */
function App() {
    return (
        <BasketProvider>
            <Router>
                <div className="App">
                    {/* Nav Bar */}
                    <nav style={{ padding: '20px', backgroundColor: '#f0f0f0', marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
                        <Link to="/" style={{ marginRight: '15px', fontWeight: 'bold' }}>Home</Link>
                        <Link to="/register" style={{ marginRight: '15px' }}>Register</Link>
                        <Link to="/login" style={{ marginRight: '15px' }}>Login</Link>
                        <Link to="/checkout" style={{ fontWeight: 'bold', color: '#2e7d32' }}>View Basket</Link>
                    </nav>

                    {/* Route defs */}
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/create-restaurant" element={<CreateRestaurant />} />
                        <Route path="/add-menu" element={<AddMenu />} />
                        <Route path="/menu/:id" element={<CustomerMenu />} />
                        <Route path="/checkout" element={<Checkout />} />
                    </Routes>
                </div>
            </Router>
        </BasketProvider>
    );
}

export default App;