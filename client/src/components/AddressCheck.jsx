import {useEffect, useRef, useState} from "react";
import {useJsApiLoader} from '@react-google-maps/api';
import {geocodeAddress} from '../utils/geocoding';
import axios from 'axios';

const libraries = ['places', 'drawing'];

/**
 * AddressCheck Component.
 * Allows a customer to enter an address, converts it to coordinates,
 * and queries backend to check if it's within restaurant delivery zone.
 *
 * @returns {React.JSX.Element} Form interface for address input
 *
 * @author Ethan Swain
 */
const AddressCheck = () => {
    const {isLoaded} = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: libraries
    });

    const autocompleteContainerRef = useRef(null);
    const [address, setAddress] = useState(null);
    const [deliveryCoords, setDeliveryCoords] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Initialise Google Places Autocomplete component
    useEffect(() => {
        if (!isLoaded || !autocompleteContainerRef.current) return;

        // Clear container to prevent duplicates when React re-renders
        autocompleteContainerRef.current.innerHTML = '';

        const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();

        placeAutocomplete.setAttribute('placeholder', 'Enter your address');
        placeAutocomplete.style.width = '100%';
        placeAutocomplete.style.height = '42px';

        autocompleteContainerRef.current.appendChild(placeAutocomplete);

        // Listen for address selection from dropdown
        placeAutocomplete.addEventListener('gmp-placeselect', async (e) => {
            if (!e.place) return;

            // Request fields needs for geofencing
            await e.place.fetchFields({fields: ['formattedAddress', 'location']});

            if (e.place.formattedAddress && e.place.location) {
                setAddress(e.place.formattedAddress);
                setDeliveryCoords({
                    lat: e.place.location.lat(),
                    lng: e.place.location.lng()
                });
            }
        });

        // Cleanup
        return () => {
            if (autocompleteContainerRef.current) {
                autocompleteContainerRef.current.innerHTML = '';
            }
        };
    }, [isLoaded]);

    /**
     * Handles delivery availability check.
     * Validates input, gets coordinates, and verifies against backend geofence.
     * @param e Form submission event
     */
    const handleCheckAvailability = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            let currentAddressStr = address;
            const placeElement = autocompleteContainerRef.current?.firstChild;

            // Extract text if user didn't click dropdown
            if (placeElement?.value) {
                currentAddressStr = placeElement.value;
                setAddress(currentAddressStr);
            }

            if (!currentAddressStr || currentAddressStr.trim() === '') {
                setError("Error: Please enter a delivery address.")
                setLoading(false);
                return;
            }

            let coords = deliveryCoords;

            // Manually geocode if user didn't click dropdown
            if (!coords) {
                coords = await geocodeAddress(currentAddressStr);
            }

            // Verify with backend
            const res = await axios.post('http://localhost:5000/api/geofence/check-availability', {
                latitude: coords.lat,
                longitude: coords.lng
            });

            if (res.data.canDeliver) {
                setMessage(`We can deliver to you. ETA: ${res.data.eta}`);
            } else {
                setError("Error: This address is outside the delivery zone");
            }
        } catch (err) {
            console.error(err);
            setError("Error: Could not validate address");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            maxWidth: '500px',
            margin: '0 auto'
        }}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {isLoaded ? (
                    <div ref={autocompleteContainerRef} style={{width: '100%'}}></div>
                ) : (
                    <input type="text" placeholder="Loading map..." disabled style={{padding: '10px'}}/>
                )}
                <button type="button" onClick={handleCheckAvailability} disabled={loading} style={{
                    padding: '12px',
                    background: '#e65100',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                }}>
                    {loading ? 'Checking...' : 'Check Availability'}
                </button>
            </div>

            {message && <p style={{
                marginTop: '15px',
                fontWeight: 'bold',
                color: 'green'
            }}>{message}</p>}
            {error && <p style={{
                marginTop: '15px',
                fontWeight: 'bold',
                color: 'red'
            }}>{error}</p>}
        </div>
    )
}

export default AddressCheck;