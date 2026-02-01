import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';

function App() {
    return (
        <Router>
            <div className="App">
                <nav style={{ padding: '20px', background: '#eee' }}>
                    <Link to="/" style={{ marginRight: '20px' }}>Home</Link>
                    <Link to="/register" style={{ marginRight: '20px' }}>Register</Link>
                    <Link to="/login" style={{ marginRight: '20px' }}>Login</Link>
                </nav>

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;