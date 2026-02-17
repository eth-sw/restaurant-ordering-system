import React, {useState} from 'react';
import {DrawingManager, GoogleMap, Polygon, useJsApiLoader} from '@react-google-maps/api';
import PropTypes from "prop-types";

const containerStyle = {
    width: '100%',
    height: '400px'
};

const center = {
    lat: 52.4128,
    lng: -4.078
};

const libraries = ['places', 'drawing'];


/**
 * DeliveryZoneMap Component.
 * Map allowing Restaurant Owner to draw a polygon for their delivery area
 *
 * @param onZoneChange Callback function to return array of coordinates
 * @returns {React.JSX.Element} Returns area that restaurant delivers to
 *
 * @author Ethan Swain
 */
export default function DeliveryZoneMap({ onZoneChange }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: libraries
    });

    const [path, setPath] = useState([]);

    // Triggered after user finishes drawing a polygon
    const onPolygonComplete = (polygon) => {
        // Extract coordinates from Google object
        const polygonPath = polygon.getPath().getArray().map(latLng => [
            latLng.lng(),
            latLng.lat()
        ]);

        // Close loop (when the user clicks back on the first point)
        if (polygonPath.length > 0) {
            polygonPath.push(polygonPath[0]);
        }

        setPath(polygonPath);
        onZoneChange(polygonPath); // Sends to parent

        // Resets map
        polygon.setMap(null);
    };

    if (!isLoaded) return <div>Loading Map...</div>;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
        >
            {path.length === 0 && (
                <DrawingManager
                    onPolygonComplete={onPolygonComplete}
                    options={{
                        drawingControl: true,
                        drawingControlOptions: {
                            position: globalThis.google.maps.ControlPosition.TOP_CENTER,
                            drawingModes: ['polygon']
                        },
                        polygonOptions: {
                            fillColor: '#2196F3',
                            strokeColor: '#2196F3',
                            fillOpacity: 0.5,
                            strokeWeight: 2,
                            clickable: true,
                            editable: true,
                            zIndex: 1,
                        },
                    }}
                />
            )}

            {path.length > 0 && (
                <Polygon
                    paths={path.map(p => ({ lng: p[0], lat: p[1] }))}
                    options={{
                        fillColor: "#4CAF50",
                        strokeColor: "#4CAF50",
                        fillOpacity: 0.4,
                    }}
                    onClick={() => {
                        if(globalThis.confirm("Reset delivery zone?")) {
                            setPath([]);
                            onZoneChange(null);
                        }
                    }}
                />
            )}
        </GoogleMap>
    );
}

DeliveryZoneMap.propTypes = {
    onZoneChange: PropTypes.func.isRequired,
};