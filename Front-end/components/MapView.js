import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Fix for missing marker icons in Leaflet maps
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component to render a map with markers for different locations
const MapView = ({ fetchArticlesByCity }) => {
  const [locations, setLocations] = useState([]);

  // Fetch geographic data on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      const response = await axios.get('http://localhost:3050/map-data');
      setLocations(response.data);
    };
    fetchLocations();
  }, []);

  // Render map with markers for each location
  return (
    <MapContainer center={[51.1657, 10.4515]} zoom={5} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map((location, index) => (
        <Marker
          key={index}
          position={[location.latitude, location.longitude]}
          eventHandlers={{
            click: () => {
              fetchArticlesByCity(location.place_corrected);
            },
          }}
        >
          <Tooltip>{location.place_corrected}</Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
