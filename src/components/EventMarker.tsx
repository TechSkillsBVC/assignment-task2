import React from 'react';
import { Image, ImageSourcePropType, StyleSheet } from 'react-native';
import { LatLng, Marker } from 'react-native-maps';
import mapMarkerImg from '../images/map-marker.png';
import mapMarkerBlueImg from '../images/map-marker-blue.png';
import mapMarkerGreyImg from '../images/map-marker-grey.png';
import { EventStatus } from '../types/Event';

const markerImages: Record<EventStatus, ImageSourcePropType> = {
    open: mapMarkerImg,
    volunteered: mapMarkerBlueImg,
    full: mapMarkerGreyImg,
};

interface EventMarkerProps {
    coordinate: LatLng;
    status: EventStatus;
    onPress?: () => void;
}

export default function EventMarker({ coordinate, status, onPress }: EventMarkerProps) {
    return (
        <Marker coordinate={coordinate} onPress={onPress}>
            <Image resizeMode="contain" style={styles.image} source={markerImages[status]} />
        </Marker>
    );
}

const styles = StyleSheet.create({
    image: {
        width: 48,
        height: 54,
    },
});
