import {FeatureGroup, Polyline, useMap, useMapEvents} from "react-leaflet";
import L from 'leaflet';
import React, {useEffect, useState} from "react";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {addedFeatureState, placedItemState} from "./recoil/common";

const fixtureStyle = {
    color: 'black',
    weight: 1,
    opacity: .5,
};

const calculateMarkerSize = (zoom, item) => {
    // 기본 마커 크기
    let baseSize = 3.5
    if (item === "desk") {
        baseSize = 6
    } else if (item === "chiffonier") {
        baseSize = 2
    }

    // 줌 레벨에 따라 크기 조절
    baseSize = baseSize * Math.pow(2, zoom - 18);
    return baseSize;
};

const calculateIconSizeAndAnchor = (zoom, selectedItem) => {
    const markerSize = calculateMarkerSize(zoom, selectedItem);
    let iconSize = [markerSize * 1.6, markerSize]
    let iconAnchor = [0, markerSize]

    if (selectedItem === "desk") {
        iconSize = [markerSize, markerSize * 1.6];
        iconAnchor = [0, markerSize * 1.6];
    }

    return {iconSize, iconAnchor};
};

const SnapToGrid = ({
                        selectedItem,
                        layer,
                        nowSelectedRoomFeature
                    }) => {
    const map = useMap();
    const bounds = layer.getBounds();
    const [tempMarker, setTempMarker] = useState(null);


    const setAddedFeature = useSetRecoilState(addedFeatureState)
    const placedItem = useRecoilValue(placedItemState)

    useEffect(() => {
        if (selectedItem === "noItem") {
            if (tempMarker) {
                map.removeLayer(tempMarker);
                setTempMarker(null);
            }
            return
        }
        const gridSize = 1;

        const latStep = gridSize / 111320; // 1미터 간격 (위도)
        const lngStep = gridSize / (40075000 * Math.cos((bounds.getNorth() + bounds.getSouth()) / 2 * Math.PI / 180) / 360); // 1미터 간격 (경도)

        const zoom = map.getZoom();
        const {iconSize, iconAnchor} = calculateIconSizeAndAnchor(zoom, selectedItem)
        const markerIcon = L.icon({
            iconUrl: `http://localhost:3000/${selectedItem}.png`,
            iconSize: iconSize,
            iconAnchor: iconAnchor,
        })

        const onMouseMove = (e) => {
            const {lat, lng} = e.latlng;

            const snappedLat = Math.round(lat / latStep) * latStep;
            const snappedLng = Math.round(lng / lngStep) * lngStep;

            if (tempMarker) {
                tempMarker.setLatLng([snappedLat, snappedLng]);
                tempMarker.setIcon(
                    markerIcon
                )
            } else {
                const marker = L.marker([snappedLat, snappedLng], {
                    icon: markerIcon,
                    opacity: 0.5,
                }).addTo(map);
                setTempMarker(marker);
            }
        };

        const onZoomEnd = (e) => {
            if (tempMarker) {
                tempMarker.setIcon(markerIcon)
            }
        }

        map.on('mousemove', onMouseMove);
        map.on('zoomend', onZoomEnd);


        return () => {
            map.off('mousemove', onMouseMove);
            map.off('zoomend', onZoomEnd);
        };
    }, [map, tempMarker, bounds, selectedItem]);

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
        if (selectedItem === "noItem") return

        const {lat, lng} = e.latlng;

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
                const nowRoom = nowSelectedRoomFeature.options.children.props.children
                const movedFeaturesCollection = {
                    "type": "FeatureCollection",
                    "name": selectedItem,
                    "features": movedFeatures,
                    "room": nowRoom
                }
                setAddedFeature(movedFeaturesCollection)
            })
            .catch(error => console.error(error));
    };

    useMapEvents({
        click: onMouseClick,
    });

    return (
        <>
            {
                placedItem.length > 0 && (
                    <FeatureGroup>
                        {placedItem.flatMap((featureCollection, collectionIndex) =>
                            featureCollection.features.map((feature, featureIndex) => {
                                if (feature.geometry.type === "LineString") {
                                    const positions = feature.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                                    return <Polyline key={`${collectionIndex}-${featureIndex}`} positions={positions}
                                                     pathOptions={fixtureStyle}/>;
                                }
                                return null;
                            })
                        )}
                    </FeatureGroup>
                )
            }
        </>
    );
};

export default SnapToGrid;