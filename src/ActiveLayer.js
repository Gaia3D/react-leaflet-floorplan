import React from "react";

const layers = [
    { value: 'L1', label: '1층' },
    { value: 'L2', label: '2층' },
    { value: 'office', label: '사무동' }
];

const ActiveLayer = ({ activeLayer, setActiveLayer }) => {
    const renderRadioButton = (layer) => (
        <label key={layer.value}>
            <input
                type="radio"
                value={layer.value}
                checked={activeLayer === layer.value}
                onChange={() => setActiveLayer(layer.value)}
            /> {layer.label}
        </label>
    );

    return (
        <div className="leaflet-top" style={{ left: '50%' }}>
            <div className="leaflet-control-layers leaflet-control-layers-expanded leaflet-control">
                {layers.map(renderRadioButton)}
            </div>
        </div>
    );
};

export default ActiveLayer;