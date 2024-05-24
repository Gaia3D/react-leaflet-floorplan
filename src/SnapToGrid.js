import {FeatureGroup, Polyline, useMap, useMapEvents} from "react-leaflet";
import L from 'leaflet';
import React, {useEffect, useState} from "react";

const fixtureStyle = {
    color: 'black',
    weight: 1,
    opacity: .5,
};

const calculateMarkerSize = (zoom) => {
    let baseSize = 3.5; // 기본 마커 크기
    // 줌 레벨에 따라 크기 조절
    baseSize = baseSize * Math.pow(2, zoom - 18);
    return baseSize;
};

const SnapToGrid = ({selectedItem, layer}) => {

    const map = useMap();
    const bounds = layer.getBounds();
    const [features, setFeatures] = useState([]);
    const [tempMarker, setTempMarker] = useState(null);

    useEffect(() => {

        const gridSize = 1;

        const latStep = gridSize / 111320; // 1미터 간격 (위도)
        const lngStep = gridSize / (40075000 * Math.cos((bounds.getNorth() + bounds.getSouth()) / 2 * Math.PI / 180) / 360); // 1미터 간격 (경도)

        const onMouseMove = (e) => {
            const { lat, lng } = e.latlng;

            const snappedLat = Math.round(lat / latStep) * latStep;
            const snappedLng = Math.round(lng / lngStep) * lngStep;

            if (tempMarker) {
                tempMarker.setLatLng([snappedLat, snappedLng]);
            } else {
                const zoom = map.getZoom();
                const markerSize = calculateMarkerSize(zoom);
                const marker = L.marker([snappedLat, snappedLng], {
                    icon: L.icon({
                        iconUrl: 'http://localhost:3000/printer.png',
                        iconSize: [markerSize * 1.6, markerSize],
                        iconAnchor: [0, markerSize],
                    }),
                    opacity: 0.5,
                }).addTo(map);
                setTempMarker(marker);
            }
        };

        const onZoomEnd = (e) => {
            const zoom = e.target.getZoom();
            const markerSize = calculateMarkerSize(zoom);
            if (tempMarker) {
                tempMarker.setIcon(
                    L.icon({
                        iconUrl: 'http://localhost:3000/printer.png',
                        iconSize: [markerSize * 1.6, markerSize],
                        iconAnchor: [0, markerSize],
                    })
                )
            }
        }

        map.on('mousemove', onMouseMove);
        map.on('zoomend', onZoomEnd);

        return () => {
            map.off('mousemove', onMouseMove);
            map.off('zoomend', onZoomEnd);
        };
    }, [map, tempMarker, bounds]);

    const moveGeoJson = (geoJson, latOffset, lngOffset, originX, originY) => {
        const newGeoJson = JSON.parse(JSON.stringify(geoJson));
        newGeoJson.features = newGeoJson.features.map(feature => {
            feature.geometry.coordinates = feature.geometry.coordinates.map(coords => {
                return [coords[0] - originX + lngOffset, coords[1] - originY + latOffset];
            });
            return feature;
        });
        return newGeoJson;
    };

    const onMouseClick = (e) => {

        if (!selectedItem) return;

        const { lat, lng } = e.latlng;

        const gridSize = 1;
        const latStep = gridSize / 111320; // 1미터 간격 (위도)
        const lngStep = gridSize / (40075000 * Math.cos((bounds.getNorth() + bounds.getSouth()) / 2 * Math.PI / 180) / 360); // 1미터 간격 (경도)

        const snappedLat = Math.round(lat / latStep) * latStep;
        const snappedLng = Math.round(lng / lngStep) * lngStep;

        let filename = 'printer_4326.geojson';
        let originX = 129.4327801076524906;
        let originY = 35.5199154963992854;

        if (selectedItem === 'desk') {
            filename = 'desk_4326.geojson';
            originX = 129.4328747644724160;
            originY = 35.5199742834149319;
        } else if (selectedItem === 'chiffonier') {
            filename = 'chiffonier_4326.geojson';
            originX = 129.4327103507249319;
            originY = 35.5198678404523775;
        }

        // 클릭 위치를 기준으로 GeoJSON 데이터를 이동시킵니다.
        // GeoJson 파일을 불러옵니다.
        fetch(`http://localhost:3000/${filename}`)
            .then(response => response.json())
            .then(data => {
                const movedGeoJsonData = moveGeoJson(data, snappedLat, snappedLng, originX, originY);
                let movedFeatures = movedGeoJsonData.features;
                setFeatures([...features, ...movedFeatures]);
            })
            .catch(error => console.error(error));

    };

    useMapEvents({
        click: onMouseClick,
    });

    return (
        <>
            {
                features.length > 0 && (
                    <FeatureGroup>
                        {features.map((feature, index) => {
                            if (feature.geometry.type === "LineString") {
                                const positions = feature.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                                return <Polyline key={index} positions={positions} pathOptions={fixtureStyle}/>;
                            }
                            return null;
                        })}
                    </FeatureGroup>
                )
            }
        </>
    );
};

export default SnapToGrid;