import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogs = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/logs', {
                    headers: { 'x-auth-token': token }
                });
                setLogs(res.data);
            } catch (err) {
                console.error(err);
                setMessage("Error: Could not load system logs.");
            }
        };
        fetchLogs();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <button onClick={() => navigate('/')} style={{ marginBottom: '20px', background: 'none', color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}>
                &larr; Back to Dashboard
            </button>

            <h1 style={{ borderBottom: '3px solid #1976d2', display: 'inline-block', marginBottom: '30px' }}>System Logs</h1>

            {message && (
                <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '5px', background: '#ffebee', color: '#c62828', fontWeight: 'bold' }}>
                    {message}
                </div>
            )}

            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                            <th style={{ padding: '15px' }}>Timestamp</th>
                            <th style={{ padding: '15px' }}>Admin</th>
                            <th style={{ padding: '15px' }}>Actions</th>
                            <th style={{ padding: '15px' }}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#666'}}>No logs recorded yet</td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px', color: '#555', fontSize: '0.9em' }}>{formatDate(log.timestamp)}</td>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{log.adminId ? log.adminId.name : 'Unknown User'}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold' }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>{log.description}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminLogs;