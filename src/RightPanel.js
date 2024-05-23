import React from 'react';
import './RightPanel.css';

const items = [
    { value: 'printer', label: '프린터' },
    { value: 'desk', label: '책상' },
    { value: 'chiffonier', label: '서랍장' }
];

const RightPanel = ({selectedItem, setSelectedItem}) => {
    const renderRadioButton = (item) => (
        <label key={item.value}>
            <input
                type="radio"
                value={item.value}
                checked={selectedItem === item.value}
                onChange={() => setSelectedItem(item.value)}
            /> {item.label}
        </label>
    );

    return (
        <div className="leaflet-right">
            <div className="right-panel leaflet-control-layers leaflet-control-layers-expanded leaflet-control">
                <h2>배치 아이템</h2>
                {items.map(item => (
                    renderRadioButton(item)
                ))}
            </div>
        </div>
    );
};

export default RightPanel;