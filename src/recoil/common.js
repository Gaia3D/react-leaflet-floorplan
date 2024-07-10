import {atom} from "recoil";

//배치할 아이템 (printer / desk / chiffonier)
export const selectedItemState = atom({
    key: 'selectedItemState',
    default: '',
})

// 추가된 Feature
export const addedFeatureState = atom({
    key: 'addedFeatureState',
    default: null,
})

// 지도에 배치된 아이템
export const placedItemState = atom({
    key: 'placedItemState',
    default: [],
})

// 전체 아이템
export const itemFeatureCollectionsState = atom({
    key: 'featureCollectionsState',
    default: [],
})

// 추가된 room
export const roomFeatureCollectionsState = atom({
    key: 'roomFeatureCollectionsState',
    default: [],
})

// 현황판
export const statusBoardState = atom({
    key: 'statusBoardState',
    default: [],
})