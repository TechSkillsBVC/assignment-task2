import { EdgePadding, LatLng, Region } from 'react-native-maps';

export const DEFAULT_POSITION: LatLng = {
    latitude: 51.03,
    longitude: -114.093,
};

export const DEFAULT_DELTA = { 
    latitudeDelta: 0.08, 
    longitudeDelta: 0.08 
};

export const DEFAULT_REGION: Region = {
    ...DEFAULT_POSITION,
    ...DEFAULT_DELTA,
};

export const EDGE_PADDING: EdgePadding = {
    top: 64,
    right: 16,
    bottom: 104,
    left: 16,
};
