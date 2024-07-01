import React from 'react';
import './RightPanel.css';
import {useRecoilState} from "recoil";
import {selectedItemState, statusBoardState} from "./recoil/common";

const items = [
    {value: 'printer', label: '프린터'},
    {value: 'desk', label: '책상'},
    {value: 'chiffonier', label: '서랍장'}
];

const RightPanel = () => {
    const [selectedItem, setSelectedItem] = useRecoilState(selectedItemState);
    const [statusBoard, setStatusBoard] = useRecoilState(statusBoardState);

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

    const clearSelectedItem = () => {
        setSelectedItem("noItem")
    }

    return (
        <>
            <div className="leaflet-right">
                <div className="right-panel leaflet-control-layers leaflet-control-layers-expanded leaflet-control">
                    <h2>배치 아이템</h2>
                    {items.map(item => (
                        renderRadioButton(item)
                    ))}
                    <button onClick={clearSelectedItem}>배치 모드 끄기</button>
                    <div>
                        <h2>현황 조회</h2>
                        <table>
                            <thead>
                            <tr>
                                <th>Room</th>
                                <th>printer</th>
                                <th>desk</th>
                                <th>chiffonier</th>
                            </tr>
                            </thead>
                            <tbody>
                            {statusBoard.length > 0 && (
                                statusBoard.map((room, index) => (
                                    <tr key={index}>
                                        <td>{room.room}</td>
                                        <td>{room.printerCount}</td>
                                        <td>{room.deskCount}</td>
                                        <td>{room.chiffonierCount}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RightPanel;