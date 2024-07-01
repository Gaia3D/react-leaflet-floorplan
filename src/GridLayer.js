import {useMap} from "react-leaflet";
import {useEffect, useRef, useState} from "react";
import L from 'leaflet';
import * as turf from '@turf/turf';
import {useRecoilState} from "recoil";
import {addedFeatureState, itemFeatureCollectionsState, placedItemState} from "./recoil/common";

const gridStyle = {
    color: 'green', opacity: 0.5, fillColor: 'green', fillOpacity: 0.15, weight: 1,
};

const disabledGridStyle = {
    color: 'red', opacity: 0.5, fillColor: 'red', fillOpacity: 0.15, weight: 1,
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
            const rect = L.rectangle([[lat, lng], [lat + latStep, lng + lngStep],], gridStyle);
            gridGroup.addLayer(rect);
        }
    }
    return gridGroup;
};

const convertMultiLineStringToLineStrings = (multiLineString) => {
    const {coordinates} = multiLineString.geometry;
    return coordinates.map(coords => turf.lineString(coords));
};

const getGridPolygon = (grid) => {
    const gridBounds = grid.getBounds();
    const gridPolygon = turf.polygon([[[gridBounds.getWest(), gridBounds.getSouth()], [gridBounds.getWest(), gridBounds.getNorth()], [gridBounds.getEast(), gridBounds.getNorth()], [gridBounds.getEast(), gridBounds.getSouth()], [gridBounds.getWest(), gridBounds.getSouth()],],]);

    return gridPolygon
}

const checkInterSectionAndSetStyle = (grid, gridPolygon, lineStrings) => {
    lineStrings.forEach((lineString) => {
        const intersect = turf.lineIntersect(lineString, gridPolygon);
        if (intersect.features.length > 0) {
            grid.setStyle(disabledGridStyle);
        }
    })
}

const GridLayer = ({layer, outer, inner}) => {
    const bounds = layer?.getBounds();
    const map = useMap();

    const [gridLayer, setGridLayer] = useState(null)
    const [itemFeatureCollections, setItemFeatureCollections] = useRecoilState(itemFeatureCollectionsState)
    const [addedFeature, setAddedFeature] = useRecoilState(addedFeatureState)
    const [placedItem, setPlacedItem] = useRecoilState(placedItemState)


    // grid 생성, 외벽 내벽 intersect
    useEffect(() => {
        if (!bounds) return;

        const gridSize = 1;
        const newGridLayer = createGrid(gridSize, bounds);
        newGridLayer.addTo(map);
        newGridLayer.pm.disable();

        const outerMultiLineString = turf.multiLineString(outer.features.map((feature) => {
            return feature.geometry.coordinates;
        }));

        const innerMultiLineString = turf.multiLineString(inner.features.map((feature) => {
            return feature.geometry.coordinates;
        }));

        const outerLineStrings = convertMultiLineStringToLineStrings(outerMultiLineString);
        const innerLineStrings = convertMultiLineStringToLineStrings(innerMultiLineString);

        //건물 외벽, 내벽과 grid intersect
        newGridLayer.eachLayer((grid) => {
            const gridPolygon = getGridPolygon(grid)
            checkInterSectionAndSetStyle(grid, gridPolygon, outerLineStrings)
            checkInterSectionAndSetStyle(grid, gridPolygon, innerLineStrings)
        })

        setGridLayer(newGridLayer);

        return () => {
            map.removeLayer(newGridLayer)
        }

    }, [outer, inner, bounds]);


    // feature 추가될 때 마다 검증, 추가
    useEffect(() => {
        if (!gridLayer || !addedFeature) return

        const featureMultiLineString = turf.multiLineString(addedFeature.features.map((feature) => {
            return feature.geometry.coordinates
        }))
        const featureLineStrings = convertMultiLineStringToLineStrings(featureMultiLineString)

        // 겹치는 grid
        let intersectGridCount = 0;
        // 유효한 grid
        let validGridCount = 0;

        // room polygon 생성
        const boundsPolygon = turf.polygon([[
            [bounds.getWest(), bounds.getSouth()],
            [bounds.getWest(), bounds.getNorth()],
            [bounds.getEast(), bounds.getNorth()],
            [bounds.getEast(), bounds.getSouth()],
            [bounds.getWest(), bounds.getSouth()],
        ]]);

        gridLayer.eachLayer((grid) => {
            const gridPolygon = getGridPolygon(grid)

            featureLineStrings.forEach((lineString) => {
                const isInside = turf.booleanContains(boundsPolygon, lineString)
                const intersect = turf.lineIntersect(lineString, gridPolygon);

                if (intersect.features.length > 0) {
                    intersectGridCount++
                    if (isInside && grid.options.color === 'green') {
                        validGridCount++
                    }
                }
            })
        })
        if (intersectGridCount !== 0 && intersectGridCount === validGridCount) {
            setItemFeatureCollections([...itemFeatureCollections, addedFeature])
            setPlacedItem([...placedItem, addedFeature])
        } else {
            alert('배치할 수 없습니다.')
        }

        setAddedFeature(null)
    }, [addedFeature]);


    useEffect(() => {
        if (!gridLayer || !placedItem) return;

        placedItem.forEach(featureCollection => {
            const featureMultiLineString = turf.multiLineString(featureCollection.features.map((feature) => {
                return feature.geometry.coordinates;
            }))
            const featureLineStrings = convertMultiLineStringToLineStrings(featureMultiLineString)

            gridLayer.eachLayer((grid) => {
                const gridPolygon = getGridPolygon(grid)
                checkInterSectionAndSetStyle(grid, gridPolygon, featureLineStrings)
            })
        })

        const handleGlobalEditModeToggle = () => {
            gridLayer.pm.disable();
        };

        map.on('pm:globaleditmodetoggled', handleGlobalEditModeToggle);

        return () => {
            map.off('pm:globaleditmodetoggled', handleGlobalEditModeToggle);
            map.removeLayer(gridLayer);
        };

    }, [gridLayer, placedItem]);

    return null;
};

export default GridLayer;