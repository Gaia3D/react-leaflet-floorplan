import {useMap} from "react-leaflet";
import {useEffect} from "react";
import L from 'leaflet';
import * as turf from '@turf/turf';

const gridStyle = {
    color: 'green',
    opacity: 0.5,
    fillColor: 'green',
    fillOpacity: 0.15,
    weight: 1,
};

const disabledGridStyle = {
    color: 'red',
    opacity: 0.5,
    fillColor: 'red',
    fillOpacity: 0.15,
    weight: 1,
};

const createGrid = (gridSize, bounds) => {

    const gridGroup = L.layerGroup();

    const startLat = bounds.getSouth();
    const endLat = bounds.getNorth();
    const startLng = bounds.getWest();
    const endLng = bounds.getEast();

    const latStep = gridSize / 111320; // 1미터 간격 (위도)
    const lngStep = gridSize / (40075000 * Math.cos((endLat + startLat) / 2 * Math.PI / 180) / 360); // 1미터 간격 (경도)

    for (let lat = startLat; lat <= endLat; lat += latStep) {
        for (let lng = startLng; lng <= endLng; lng += lngStep) {
            const rect = L.rectangle(
                [
                    [lat, lng],
                    [lat + latStep, lng + lngStep],
                ],
                gridStyle
            );
            gridGroup.addLayer(rect);
        }
    }
    return gridGroup;
};

const GridLayer = ({ layer, outer, inner }) => {

    const bounds = layer.getBounds();
    const map = useMap();

    useEffect(() => {
        const gridSize = 1;
        const gridLayer = createGrid(gridSize, bounds);
        gridLayer.addTo(map);
        gridLayer.pm.disable();

        const outerMultiLineString = turf.multiLineString(outer.features.map((feature) => {
            return feature.geometry.coordinates;
        }));

        const innerMultiLineString = turf.multiLineString(inner.features.map((feature) => {
            return feature.geometry.coordinates;
        }));

        const convertMultiLineStringToLineStrings = (multiLineString) => {
            const { coordinates } = multiLineString.geometry;
            return coordinates.map(coords => turf.lineString(coords));
        };
        const outerLineStrings = convertMultiLineStringToLineStrings(outerMultiLineString);
        const innerLineStrings = convertMultiLineStringToLineStrings(innerMultiLineString);

        gridLayer.eachLayer((grid) => {
            const gridBounds = grid.getBounds();
            const gridPolygon = turf.polygon([
                [
                    [gridBounds.getWest(), gridBounds.getSouth()],
                    [gridBounds.getWest(), gridBounds.getNorth()],
                    [gridBounds.getEast(), gridBounds.getNorth()],
                    [gridBounds.getEast(), gridBounds.getSouth()],
                    [gridBounds.getWest(), gridBounds.getSouth()],
                ],
            ]);

            outerLineStrings.forEach((lineString) => {
                const intersect = turf.lineIntersect(lineString, gridPolygon);
                if (intersect.features.length > 0) {
                    grid.setStyle(disabledGridStyle);
                }
            });

            innerLineStrings.forEach((lineString) => {
                const intersect = turf.lineIntersect(lineString, gridPolygon);
                if (intersect.features.length > 0) {
                    grid.setStyle(disabledGridStyle);
                }
            });

            /*
            if (intersect.features.length > 0) {
                grid.setStyle(disabledGridStyle);
            }
            */
        });

        const handleGlobalEditModeToggle = () => {
            gridLayer.pm.disable();
        };

        map.on('pm:globaleditmodetoggled', handleGlobalEditModeToggle);

        return () => {
            map.off('pm:globaleditmodetoggled', handleGlobalEditModeToggle);
            map.removeLayer(gridLayer);
        };

    }, [outer, inner, bounds, map]);

    return null;
};

export default GridLayer;