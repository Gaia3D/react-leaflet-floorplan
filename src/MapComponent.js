import React from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Map from './Map';
import "@geoman-io/leaflet-geoman-free";

function MapComponent() {
    const center = [35.51992, 129.432798];
    const zoom = 18;
    //const crs = L.CRS.EPSG3857; // 커스텀 CRS 설정
    const minZoom = 0;
    const maxZoom = 25;

    return (
        <MapContainer center={center} zoom={zoom} style={{height: '100vh', width: '100%', backgroundColor:'#ddd'}} /*crs={crs}*/ minZoom={minZoom}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={maxZoom}/>
            <Map />
        </MapContainer>
    );
}

export default MapComponent;