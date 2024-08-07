import {
    FeatureGroup,
    LayerGroup,
    Polygon,
    Polyline,
    Tooltip,
    useMap
} from "react-leaflet";
import "@geoman-io/leaflet-geoman-free";
import React, {useEffect, useState} from "react";
import './Map.css';
import GridLayer from "./GridLayer";
import SnapToGrid from "./SnapToGrid";
import ActiveLayerPanel from "./ActiveLayer";
import L from 'leaflet';
import ReactDOM from 'react-dom/client';
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {
    roomFeatureCollectionsState,
    selectedItemState,
    itemFeatureCollectionsState, placedItemState, statusBoardState
} from "./recoil/common";
import CustomPopup from "./CustomPopup";

// LAYER STYLES
const footprintStyle = {
    color: 'black',
    fillColor: 'white',
    fillOpacity: 1
};

const fixtureStyle = {
    color: 'black',
    weight: .5,
    opacity: 0.25,
};

const roomStyle = {
    color: 'black',
    opacity: 0,
    fillColor: 'white',
    fillOpacity: .5,
};

const wallStyle = {
    color: 'black',
    fillColor: 'none',
    weight: 3,
    fillOpacity: 1
};

const highlight = {
    color: 'red',
    opacity: 0,
    fillColor: 'red',
    fillOpacity: .5,
    weight: 2,
};

// LAYER DATA
const L1fixture = [[[14, 0], /*counter*/ [14, 9], [17, 9], [17, 2], [23, 2], [23, 0], [14, 0]], [[15, 5], /*sink*/ [15, 8], [16.75, 8], [16.75, 5], [15, 5]], [[18, 0], /*oven*/ [18, 2], [20, 2], [20, 0], [18, 0]], [[18.25, 0.25], /*oven Units*/ [18.25, 0.5], [18.5, 0.5], [18.5, 0.25], [18.25, 0.25]], [[18.25, 1.25], /*oven Units*/ [18.25, 1.5], [18.5, 1.5], [18.5, 1.25], [18.25, 1.25]], [[19.75, 1.25], /*oven Units*/ [19.75, 1.5], [19.5, 1.5], [19.5, 1.25], [19.75, 1.25]], [[19.75, 0.25], /*oven Units*/ [19.75, 0.5], [19.5, 0.5], [19.5, 0.25], [19.75, 0.25]], [[28, 3], /*counter*/ [28, 6], [25, 6], [25, 3], [28, 3]], [[28, 6], /*fridge*/ [28, 10], [25, 10], [25, 6], [28, 6]], [[30.75, 13.25], /*sink*/ [30.75, 15.25], [29.75, 15.25], [29.75, 13.25], [30.75, 13.25]], [[30.5, 13.5], /*sink*/ [30.5, 15], [30, 15], [30, 13.5], [30.5, 13.5]], [[30.75, 16.75], /*Toilet*/ [30.75, 18.75], [29.75, 18.75], [29.75, 16.75], [30.75, 16.75]], [[29.75, 17.25], /*Toilet*/ [28, 17.25], [28, 18.25], [29.75, 18.25], [29.75, 17.25]], [[31, 3], /*Stairs*/ [28, 3]], [[31, 4], [28, 4]], [[31, 5], [28, 5]], [[31, 6], [28, 6]], [[31, 7], [28, 7]], [[31, 8], [28, 8]], [[31, 9], [28, 9]], [[31, 10], [28, 10]],];
const L1walls = [[[0, 0],   /*perimeter*/ [50.5, 0], [50.5, 17], [31, 17], [31, 19], [12, 19], [12, 17], [8, 17], [4, 17], [4, 13], [0, 13], [0, 0]], [[14, 0], /*kitchen*/ [14, 6]], [[23, 0],  /*pantry*/ [23, 2], [23.5, 2.25]], [[28, 0], [28, 3], [25, 3], [24.5, 2.75]], [[28, 3], [28, 10]], [[31, 0], /*garage*/ [31, 10]], [[31, 13], /*walls*/ [31, 19]], [[31, 13], /*bathroom*/ [27, 13]], [[25, 13], [25, 19]], [[12, 17], /*closet*/ [12, 13], [9, 13], [9, 14]], [[9, 16.0], [9, 17]], [[12, 13], [13, 13]],];
const L1footprint = [[0, 0], [50.5, 0], [50.5, 17], [31, 17], [31, 19], [12, 19], [12, 17], [8, 17], [4, 17], [4, 13], [0, 13],];
const L1livingroom = [
    [0, 0],
    [14, 0],
    [14, 13],
    [0, 13]
];
const L1closet = [
    [9, 13],
    [9, 17],
    [12, 17],
    [12, 13]
];
const L1kitchen = [
    [14, 0],
    [14, 13],
    [28, 13],
    [28, 0]
];
const L1pantry = [
    [28, 0],
    [28, 3],
    [25, 3],
    [23, 2],
    [23, 0]
];
const L1diningroom = [
    [12, 13],
    [25, 13],
    [25, 19],
    [12, 19]
];
const L1bathroom = [
    [25, 13],
    [25, 19],
    [31, 19],
    [31, 13]
];
const L1garage = [
    [31, 0],
    [50.5, 0],
    [50.5, 17],
    [31, 17]
];

const L1Dataset = [
    {
        type: 'polygon',
        data: L1footprint,
        style: footprintStyle
    },
    {
        type: 'polyline',
        data: L1fixture,
        style: fixtureStyle
    },
    {
        type: 'polyline',
        data: L1walls,
        style: wallStyle
    },
    {
        type: 'polygon',
        data: L1livingroom,
        style: roomStyle,
        title: 'Living Room'
    },
    {
        type: 'polygon',
        data: L1closet,
        style: roomStyle,
        title: 'Closet'
    },
    {
        type: 'polygon',
        data: L1kitchen,
        style: roomStyle,
        title: 'Kitchen'
    },
    {
        type: 'polygon',
        data: L1pantry,
        style: roomStyle,
        title: 'Pantry'
    },
    {
        type: 'polygon',
        data: L1diningroom,
        style: roomStyle,
        title: 'Dining Room'
    },
    {
        type: 'polygon',
        data: L1bathroom,
        style: roomStyle,
        title: 'Bathroom'
    },
    {
        type: 'polygon',
        data: L1garage,
        style: roomStyle,
        title: 'Garage'
    }
];

const L2fixture = [[[31, 3], /*Stairs*/ [28, 3]], [[31, 4], [28, 4]], [[31, 5], [28, 5]], [[31, 6], [28, 6]], [[31, 7], [28, 7]], [[31, 8], [28, 8]], [[31, 9], [28, 9]], [[28, 0], [28, 3]], [[27, 0], [27, 3]], [[26, 0], [26, 3]], [[25, 0], [25, 3]], [[24, 0], [24, 3]], [[50, 0], /*masterbath*/ [50, 5]], [[46.25, 0.25], /*toilet*/ [48.25, 0.25], [48.25, 1.25], [46.25, 1.25], [46.25, 0.25]], [[47.75, 1.25], [47.75, 2.5], [46.75, 2.5], [46.75, 1.25], [47.75, 1.25]], [[46, 2], /*vanity*/ [39, 2]], [[45.75, 0.5], [45.75, 1.5], [43.75, 1.5], [43.75, 0.5], [45.75, 0.5]], [[41.25, 0.5], [41.25, 1.5], [39.25, 1.5], [39.25, 0.5], [41.25, 0.5]], [[18, 6], /*bathroom*/ [15.5, 6], [15.5, 8]], [[13, 3], [13, 8]], [[12.5, 3.5], [12.5, 7.5], [10.5, 7.5], [10.5, 3.5], [12.5, 3.5]], [[17.75, 6.5], [17.75, 7.5], [15.75, 7.5], [15.75, 6.5], [17.75, 6.5]], [[15.25, 6.5], [15.25, 7.5], [13.25, 7.5], [13.25, 6.5], [15.25, 6.5]], [[14.75, 6.5], [14.75, 5], [13.75, 5], [13.75, 6.5], [14.75, 6.5]],];
const L2walls = [[[0, 0], /*perimeter*/ [52, 0], [52, 17], [31, 17], [31, 19], [12, 19], [12, 17], [8, 17], [3, 17], [3, 13], [0, 13], [0, 0]], [[3, 13], /*greencloset*/ [3, 12], [3.25, 12]], [[10, 17], [10, 12], [5.25, 12]], [[10, 12], /*greenroom*/ [10, 3], [13, 3], [13, 2.75]], [[31, 0], [31, 13]], [[31, 9], /*stairs*/ [28, 9], [28, 3], [24, 3]], [[13, 3], /*bathroom*/ [14.75, 3]], [[16.75, 3], [18, 3], [18, 8], [10, 8]], [[12, 17], /*bluecloset*/ [12, 15]], [[12, 10], [12, 8]], [[18, 3], /*hallcloset*/ [20, 3], [20, 4]], [[20, 7], [20, 8], [18, 8]], [[20, 8], [21, 9.25]], /*blueroom*/ [[23, 11.75], [24, 13], [24, 19]], [[31, 13], [31.5, 13]], [[33.5, 13], [36, 13], [36, 14]], [[36, 16.5], [36, 17]], [[36, 13], /*master*/ [36, 5], [40, 5]], [[39, 0], /*mastercloset*/ [39, 2.5]], [[39, 4.5], [39, 5]], [[36, 5], [31, 5]], [[36, 7], [31, 7]], [[46, 0], /*masterbath*/ [46, 2.5]], [[46, 4.5], [46, 5]], [[52, 5], [45, 5]],];

const L2Dataset = [
    {
        data: L2fixture,
        style: fixtureStyle
    },
    {
        data: L2walls,
        style: wallStyle
    },
];

const tooltipOptions = {permanent: true, direction: "center", className: 'tooltipclass'};

const fetchGeoJsonData = async (url, setGeoJsonData) => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        setGeoJsonData(data);
    } catch (error) {
        console.error(error);
    }
};

const polygonEvent = (map, dataset) => {
    return {
        mouseover: (e) => {
            e.target.setStyle(highlight);
        },
        mouseout: (e) => {
            e.target.setStyle(dataset.style);
        },
        click: (e) => {
            map.fitBounds(e.target.getBounds());
        }
    }
}

const roomPolygonEvent = (map, setSelectedFeature) => {
    return {
        mouseover: (e) => {
            e.target.setStyle(highlight);
        },
        mouseout: (e) => {
            e.target.setStyle(roomStyle);
        },
        click: (e) => {
            map.fitBounds(e.target.getBounds());
            setSelectedFeature(e.target);
        }
    }
}

function Map() {
    const map = useMap();
    // 레이어 선택
    const [activeLayer, setActiveLayer] = useState('office');

    const [wallOuterData, setWallOuterData] = useState(null);
    const [wallInnerData, setWalInnerData] = useState(null);

    // room 배열
    const [roomFeatureCollections, setRoomFeatureCollections] = useRecoilState(roomFeatureCollectionsState);
    // 선택된 room
    const [selectedRoomFeature, setSelectedRoomFeature] = useState();

    // 선택된 아이템
    const selectedItem = useRecoilValue(selectedItemState);
    // 추가된 아이템
    const itemFeatureCollections = useRecoilValue(itemFeatureCollectionsState);
    // 현재 지도에 배치된 아이템
    const setPlacedItem = useSetRecoilState(placedItemState);
    // 현황판
    const setStatusBoard = useSetRecoilState(statusBoardState);

    const [currentFeatures, setCurrentFeatures] = useState([])

    useEffect(() => {
        map.pm.addControls();
        map.pm.setLang("ko");

        fetchGeoJsonData('http://localhost:3000/wall_outer.geojson', setWallOuterData);
        fetchGeoJsonData('http://localhost:3000/wall_inner.geojson', setWalInnerData);

        const updateFeatures = (e) => {
            const layer = e.layer;

            const tempCurrentFeatures = currentFeatures
            tempCurrentFeatures.push(layer.toGeoJSON());
            setCurrentFeatures(tempCurrentFeatures)

            setRoomFeatureCollections([...tempCurrentFeatures]);

            const popupNode = document.createElement('div');
            const root = ReactDOM.createRoot(popupNode);
            root.render(<CustomPopup feature={layer} currentFeatures={tempCurrentFeatures}
                                     setFeatures={setRoomFeatureCollections} map={map}/>);

            // const root = createRoot(popupNode);
            // root.render(<PopupContent feature={layer} />);
            layer.bindPopup(popupNode).openPopup();
        }

        map.on('pm:create', (e) => {
            updateFeatures(e)
        });

        // 컴포넌트가 언마운트 될 때 이벤트 리스너 제거
        return () => {
            map.off('pm:create', updateFeatures);
        };

    }, [map]);

    // room 추가시 현황판 업데이트
    useEffect(() => {
        if (roomFeatureCollections.length <= 0) return;

        const newRooms = roomFeatureCollections
            .filter((feature) => feature.properties?.title !== undefined)
            .map(feature => {
                return {
                    room: feature.properties?.title,
                    printerCount: 0,
                    deskCount: 0,
                    chiffonierCount: 0,
                };
            });

        setStatusBoard(prevStatusBoard => {
            const existingRoomSet = new Set(prevStatusBoard.map(room => room.room));
            const updatedStatusBoard = [...prevStatusBoard]

            newRooms.length > 0 && newRooms.forEach(newRoom => {
                if (!existingRoomSet.has(newRoom.room)) {
                    existingRoomSet.add(newRoom.room);
                    updatedStatusBoard.push(newRoom)
                }
            });

            return updatedStatusBoard
        });

    }, [roomFeatureCollections]);


    // 전체 feature 변경시 status board 업데이트
    useEffect(() => {
        if (itemFeatureCollections.length <= 0) return;

        setStatusBoard(prevStatusBoard => {
            return prevStatusBoard.map(board => {
                const targetRoom = board.room;

                return itemFeatureCollections.reduce((acc, featureCollection) => {
                    if (featureCollection.room === targetRoom) {
                        if (featureCollection.name === "printer") {
                            acc.printerCount++;
                        } else if (featureCollection.name === "desk") {
                            acc.deskCount++;
                        } else if (featureCollection.name === "chiffonier") {
                            acc.chiffonierCount++;
                        }
                    }
                    return acc;
                }, {...board, printerCount: 0, deskCount: 0, chiffonierCount: 0});
            });
        });
    }, [itemFeatureCollections]);

    // 방 변경시 placedItem 업데이트
    useEffect(() => {
        if (selectedRoomFeature) {
            const nowRoom = selectedRoomFeature.options.children.props.children
            let tempPlacedItems = []
            itemFeatureCollections.forEach(featureCollection => {
                if (featureCollection.room === nowRoom) {
                    tempPlacedItems.push(featureCollection)
                }
            })
            setPlacedItem(tempPlacedItems)
        } else {
            setPlacedItem([])
        }

    }, [selectedRoomFeature]);


    useEffect(() => {
        if (activeLayer === 'office' && wallOuterData && wallInnerData) {
            const wallOuterLayer = L.geoJSON(wallOuterData, {
                style: wallStyle
            }).addTo(map);

            const wallInnerLayer = L.geoJSON(wallInnerData, {
                style: wallStyle
            }).addTo(map);

            wallOuterLayer.pm.disable(); // Disable editing
            const handleGlobalEditModeToggle = () => {
                wallOuterLayer.pm.disable();
                wallInnerLayer.pm.enable({snappable: true});
            };

            const onDrag = (e, layer) => {
                const latLngs = e.target.getLatLngs();
                const startPoint = new L.LatLng(e.latlng.lat, latLngs[0].lng);
                const endPoint = new L.LatLng(e.latlng.lat, latLngs[1].lng);
                layer.setLatLngs([startPoint, endPoint]);
            };

            const onDragEnd = (e, layer) => {
                const newLatLngs = e.target.getLatLngs();
                layer.setLatLngs([newLatLngs[0], newLatLngs[1]]);
            };

            const handleGlobalDragModeToggle = () => {
                wallInnerLayer.eachLayer(layer => {
                    layer.on('pm:drag', (e) => onDrag(e, layer));
                    layer.on('pm:dragend', (e) => onDragEnd(e, layer));
                })
            };

            map.on('pm:globaleditmodetoggled', handleGlobalEditModeToggle);
            map.on('pm:globaldragmodetoggled', handleGlobalDragModeToggle);

            return () => {
                map.off('pm:globaleditmodetoggled', handleGlobalEditModeToggle);
                map.off('pm:globaldragmodetoggled', handleGlobalDragModeToggle);
                map.removeLayer(wallOuterLayer);
                map.removeLayer(wallInnerLayer);
            }
        }
    }, [activeLayer, wallOuterData, wallInnerData, map]);

    const renderLayerGroup = (dataset) => (
        <LayerGroup>
            {dataset.map((data, idx) => {
                if (data.type === 'polygon') {
                    return (<Polygon
                        key={idx}
                        positions={data.data}
                        pathOptions={data.style}
                        eventHandlers={polygonEvent(map, data)}
                    >
                        <Tooltip {...tooltipOptions}>{data.title}</Tooltip>
                    </Polygon>)

                } else {
                    return (<Polyline
                        key={idx}
                        positions={data.data}
                        pathOptions={data.style}
                    />)
                }
            })}
        </LayerGroup>
    );

    return (
        <>
            {activeLayer === 'L1' && renderLayerGroup(L1Dataset)}
            {activeLayer === 'L2' && renderLayerGroup(L2Dataset)}
            {selectedRoomFeature &&
                <GridLayer layer={selectedRoomFeature} outer={wallOuterData} inner={wallInnerData}/>}
            <ActiveLayerPanel activeLayer={activeLayer} setActiveLayer={setActiveLayer}/>
            {
                selectedItem && selectedRoomFeature &&
                <SnapToGrid selectedItem={selectedItem} layer={selectedRoomFeature}
                            nowSelectedRoomFeature={selectedRoomFeature}/>
            }
            {
                roomFeatureCollections.length > 0 && (
                    <FeatureGroup>
                        {roomFeatureCollections.map((feature, index) => {
                            if (feature.geometry.type === "Polygon") {
                                const positions = feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
                                return <Polygon
                                    key={index}
                                    positions={positions}
                                    pathOptions={roomStyle}
                                    eventHandlers={roomPolygonEvent(map, setSelectedRoomFeature)}
                                >
                                    <Tooltip {...tooltipOptions}>{feature.properties.title}</Tooltip>
                                </Polygon>;
                            }
                            return null;
                        })}
                    </FeatureGroup>
                )
            }
        </>
    );
}

export default Map;