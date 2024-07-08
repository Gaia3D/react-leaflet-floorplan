import React, {useState} from "react";

const CustomPopup = ({feature, currentFeatures, setFeatures, map}) => {
    const [name, setName] = useState('');

    const roomNameValidation = (name, roomArray) => {
        const invalidName = roomArray.filter((feature) => feature.properties?.title === name)
        if (invalidName.length === 0) {
            return true
        } else {
            return false
        }
    }

    const handleChange = (e) => {
        setName(e.target.value);
    }

    const handleButtonClick = () => {
        if (!name) {
            alert('이름을 입력해주세요');
            return
        }

        let json = feature.toGeoJSON();
        if (roomNameValidation(name, currentFeatures)) {
            json.properties.title = name;
            currentFeatures.push(json);
            setFeatures([...currentFeatures]);
            map.removeLayer(feature);
        } else {
            alert('사용할수 없는 이름입니다.')
        }
    }
    return (
        <div style={{width: '10vw'}}>
            <h2>Feature Info</h2>
            <p>{feature && feature.pm._shape}</p>
            <p>Coordinates: {feature && (feature.getLatLngs ? feature.getLatLngs().toString() : feature.getLatLng().toString())}</p>
            <input type="text" name="name" value={name} onChange={handleChange}/>
            <button type="button" onClick={handleButtonClick}>저장</button>
        </div>
    );
}

export default CustomPopup;
