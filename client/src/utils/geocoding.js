/**
 * Geocodes a text address into latitude and longitude using Google Maps geocoder.
 *
 * @param address Address string
 * @returns {Promise<{lat, lng}>} Coordinates object
 *
 * @author Ethan Swain
 */
export const geocodeAddress = (address) => {
    return new Promise((resolve, reject) => {
        if (!globalThis.google?.maps) {
            reject(new Error("Google Maps API not loaded yet."))
            return;
        }

        const geocoder = new globalThis.google.maps.Geocoder();

        geocoder.geocode({address: address}, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                resolve({
                    lat: location.lat(),
                    lng: location.lng(),
                });
            } else {
                reject(new Error("Address not found"));
            }
        });
    });
};