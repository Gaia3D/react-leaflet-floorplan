import React from 'react';
import './App.css';
import MapComponent from './MapComponent';
import {RecoilRoot} from "recoil";

function App() {
    return (
        <RecoilRoot>
            <div className="App">
                <MapComponent/>
            </div>
        </RecoilRoot>
    );
}

export default App;