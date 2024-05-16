import React from 'react';
import './RightPanel.css';

const RightPanel = ({ selectedItem, setSelectedItem }) => {
    return (
        <div className="leaflet-right">
            <div className="right-panel leaflet-control-layers leaflet-control-layers-expanded leaflet-control">
                <h2>배치 아이템</h2>
                <label>
                    <input
                        type="radio"
                        value="printer"
                        checked={selectedItem === 'printer'}
                        onChange={() => setSelectedItem('printer')}
                    /> 프린터
                </label>
                <label>
                    <input
                        type="radio"
                        value="desk"
                        checked={selectedItem === 'desk'}
                        onChange={() => setSelectedItem('desk')}
                    /> 책상
                </label>
                <label>
                    <input
                        type="radio"
                        value="chiffonier"
                        checked={selectedItem === 'chiffonier'}
                        onChange={() => setSelectedItem('chiffonier')}
                    /> 서랍장
                </label>
            </div>
        </div>
    );
};

export default RightPanel;