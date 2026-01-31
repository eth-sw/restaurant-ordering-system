import { useEffect, useState } from 'react'

function App() {
    const [status, setStatus] = useState("Loading...")
    useEffect(() => {
        fetch('http://localhost:5000/api/status')
            .then(res => res.json())
            .then(data => setStatus(data.message))
            .catch(() => setStatus("Error: Could not connect to backend"))
    }, []);

    return (
        <div style={{ padding: "50px" }}>
            <h1>Restaurant Ordering System</h1>
            <h2>System Status: {status}</h2>
        </div>
    )
}

export default App