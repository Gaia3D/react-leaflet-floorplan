import React from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Map from './Map';

const MAP_SETTINGS = {
    center: [35.51992, 129.432798],
    zoom: 18,
    minZoom: 0,
    maxZoom: 25,
    tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    style: { height: '100vh', width: '100%', backgroundColor: '#ddd' }
};

function MapComponent() {

    return (
        <MapContainer
            center={MAP_SETTINGS.center}
            zoom={MAP_SETTINGS.zoom}
            style={MAP_SETTINGS.style}
            minZoom={MAP_SETTINGS.minZoom}
            maxZoom={MAP_SETTINGS.maxZoom}
        >
            <TileLayer
                url={MAP_SETTINGS.tileLayerUrl}
                maxZoom={MAP_SETTINGS.maxZoom}
            />
            <Map />
        </MapContainer>
    );
}

export default MapComponent;