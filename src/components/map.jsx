import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';

const userIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [position, map]);
  return null;
}

export const PulpulakMap = () => {
  const [pulpulaks, setPulpulaks] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultCenter = [40.1792, 44.4991];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    fetch('/pulpulaks.json')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.elements) {
          const points = data.elements
            .map((el) => ({
              id: el.id,
              lat: el.lat,
              lng: el.lon,
              name: el.tags && el.tags.name ? el.tags.name : 'Pulpulak 💧',
            }))
            .filter((p) => p.lat && p.lng);

          setPulpulaks(points);
        }
      })
      .catch((err) => console.error('Error loading pulpulaks.json:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 15,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.85)',
            color: '#fff',
            padding: '8px 18px',
            borderRadius: '20px',
            fontSize: '14px',
            pointerEvents: 'none',
          }}
        >
          Loading Pulpulaks...
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userPos && (
          <>
            <Marker position={userPos} icon={userIcon}>
              <Popup>📍</Popup>
            </Marker>
            <RecenterMap position={userPos} />
          </>
        )}

        {pulpulaks.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={5}
            pathOptions={{
              fillColor: '#0078ff',
              color: '#ffffff',
              weight: 1,
              fillOpacity: 0.85,
            }}
          >
            <Popup>{p.name}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PulpulakMap;