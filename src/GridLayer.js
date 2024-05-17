import {useMap} from "react-leaflet";
import {useEffect} from "react";
import L from 'leaflet';
import {LatLng} from "leaflet/src/geo";

const gridStyle = {
    color: 'red',
    opacity: 0.5,
    fillColor: 'red',
    fillOpacity: 0.15,
    weight: 1,
};

const createGrid = () => {
    const southWest = new LatLng(35.519722, 129.432778);
    const northEast = new LatLng(35.520000, 129.433056);
    const gridGroup = L.layerGroup();

    const step = 0.000045 / 5; // 약 1m

    for (let lat = southWest.lat; lat < northEast.lat; lat += step) {
        for (let lng = southWest.lng; lng < northEast.lng; lng += step) {
            const rect = L.rectangle(
                [
                    [lat, lng],
                    [lat + step, lng + step],
                ],
                gridStyle
            );
            gridGroup.addLayer(rect);
        }
    }

    return gridGroup;
};

const GridLayer = () => {
    const map = useMap();

    useEffect(() => {
        const gridLayer = createGrid();
        map.addLayer(gridLayer);

        return () => {
            map.removeLayer(gridLayer);
        };
    }, [map]);

    return null;
};

export default GridLayer;