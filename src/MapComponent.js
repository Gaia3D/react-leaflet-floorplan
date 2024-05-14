import React from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Map from './Map';
import "@geoman-io/leaflet-geoman-free";
import RightPanel from "./RightPanel";

function MapComponent() {
    const center = [25.25, 9];
    const zoom = 4;
    const crs = L.CRS.Simple; // 커스텀 CRS 설정
    const minZoom = 0;

    return (
        <MapContainer center={center} zoom={zoom} style={{height: '100vh', width: '100%', backgroundColor:'#ddd'}} crs={crs} minZoom={minZoom}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Map />
        </MapContainer>
    );
}

export default MapComponent;