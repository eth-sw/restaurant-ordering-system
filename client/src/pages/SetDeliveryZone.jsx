import {useState} from 'react';
import axios from 'axios';
import DeliveryZoneMap from '../components/DeliveryZoneMap';

/**
 * SetDeliveryZone Component.
 * Provides interactive mapping tool for admins and supervisors to set or update
 * the delivery geofence.
 *
 * @returns {React.JSX.Element} Map drawing interface
 * @constructor
 */
const SetDeliveryZone = () => {
    const [message, setMessage] = useState('');

    const handleSaveZone = async (coordinates) => {
        if (!coordinates) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/restaurants/zone',
                { deliveryZone: { type: 'Polygon', coordinates: [coordinates] } },
                { headers: { 'x-auth-token': token } }
            );
            setMessage("Delivery Zone Updated Successfully");
        } catch (err) {
            console.error(err);
            setMessage("Error: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <h1>Update Delivery Zone</h1>
            <p>Draw a shape on the map to define where you deliver</p>

            {message && (
                <div style={{ padding: '10px', background: message.includes('Error') ? '#ffebee' : '#e8f5e9', color: message.includes('Error') ? '#c62828' : 'green', marginBottom: '10px', fontWeight: 'bold' }}>
                    {message}
                </div>
            )}

            <DeliveryZoneMap onZoneChange={handleSaveZone} />
        </div>
    );
};

export default SetDeliveryZone;