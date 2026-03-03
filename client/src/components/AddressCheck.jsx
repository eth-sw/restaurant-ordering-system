import {useState} from "react";
import {useJsApiLoader} from '@react-google-maps/api';
import {geocodeAddress} from '../utils/geocoding';
import PropTypes from 'prop-types';
import axios from 'axios';

const libraries = ['places', 'drawing'];

/**
 * AddressCheck Component.
 * Allows a customer to enter an address, converts it to coordinates,
 * queries backend to check if it's within restaurant delivery zone.
 *
 * @param onAddressValidated Callback function for when restaurants are found
 * @returns {React.JSX.Element} Form interface for address input
 *
 * @author Ethan Swain
 */
export default function AddressCheck({onAddressValidated}) {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Load Google Maps script
    const {isLoaded} = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: libraries
    });

    /**
     * Handles form submission, geocodes the address, and checks API availability.
     */
    const handleCheck = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            // Get lat/lng from Google Geocoding
            const coords = await geocodeAddress(address);

            // Check if restaurant delivers to these coordinates
            const res = await axios.post('http://localhost:5000/api/geofence/check-availability', {
                latitude: coords.lat,
                longitude: coords.lng
            });

            // Handle backend geofence result
            if (res.data.canDeliver) {
                // Sends data payload back to parent (Home.jsx)
                onAddressValidated(address, coords, res.data);
            } else {
                setMessage("Sorry, we do not deliver to this location.");
            }
        } catch (err) {
            console.error(err);
            setMessage("Error: Could not validate location.");
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
        <div className="address-check-container"
             style={{padding: '20px', border: '1px solid #ddd', borderRadius: '8px'}}>
            <form onSubmit={handleCheck}>
                <input
                    type="text"
                    placeholder="Enter your delivery address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{padding: '10px', width: '70%', marginRight: '10px'}}
                    required
                />
                <button type="submit" disabled={loading} style={{padding: '10px 20px', cursor: 'pointer'}}>
                    {loading ? 'Checking...' : 'Check Availability'}
                </button>
            </form>
            {message && <p style={{color: 'red', marginTop: '10px', fontWeight: 'bold'}}>{message}</p>}
        </div>
    );
}

AddressCheck.propTypes = {
    onAddressValidated: PropTypes.func.isRequired
};