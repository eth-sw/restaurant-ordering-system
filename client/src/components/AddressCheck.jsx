import {useState} from "react";
import {useJsApiLoader} from '@react-google-maps/api';
import {geocodeAddress} from '../utils/geocoding';
import PropTypes from 'prop-types';
import axios from 'axios';

const libraries = ['places', 'drawing'];

/**
 * AddressCheck Component.
 * Allows a customer to enter an address, geocode it, and check if it's with
 * a restaurant's delivery zone.
 *
 * @param onAddressValidated Callback function for when restaurants are found
 * @returns {React.JSX.Element} Restaurants in the delivery zone
 *
 * @author Ethan Swain
 */
export default function AddressCheck({ onAddressValidated }) {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load Google Maps script
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: libraries
    });

    const handleCheck = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Get lat/lng from Google
            const coords = await geocodeAddress(address);

            // Get restaurants who deliver to these coordinates
            const res = await axios.post('http://localhost:5000/api/geofence/check-availability', {
                latitude: coords.lat,
                longitude: coords.lng
            });

            // Handles result
            if (res.data.canDeliver) {
                // Sends data back to Home.jsx
                onAddressValidated(address, coords, res.data.availableRestaurants);
            } else {
                setError("Sorry, no restaurants deliver to this location.");
            }
        } catch (err) {
            console.error("ERROR:", err);
            setError(err.response?.data?.message || err.message || "Error validating location");
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
        <div className="address-check-container" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Check Delivery Availability</h3>
            <form onSubmit={handleCheck}>
                <input
                    type="text"
                    placeholder="Enter your delivery address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ padding: '10px', width: '70%', marginRight: '10px' }}
                    required
                />
                <button type="submit" disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    {loading ? 'Checking...' : 'Find Food'}
                </button>
            </form>
            {error && <p style={{ color: 'red', marginTop: '10px', fontWeight: 'bold' }}>{error}</p>}
        </div>
    );
}

AddressCheck.propTypes = {
    onAddressValidated: PropTypes.func.isRequired
};