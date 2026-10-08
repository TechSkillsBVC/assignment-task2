import React from 'react';
import { Image } from 'react-native';
import { Marker } from 'react-native-maps';
import mapMarkerBlueImg from '../images/map-marker-blue.png';
import mapMarkerGreyImg from '../images/map-marker-grey.png';
import mapMarkerImg from '../images/map-marker.png';
import { Event, EventStatus } from '../types/Event';

const MARKER_IMAGES: Record<EventStatus, any> = {
    [EventStatus.Volunteered]: mapMarkerBlueImg,
    [EventStatus.Open]: mapMarkerImg,
    [EventStatus.Full]: mapMarkerGreyImg,
};

interface EventMarkerProps {
    event: Event;
    status: EventStatus;
    onPress?: () => void;
}

export default function EventMarker({ event, status, onPress }: EventMarkerProps) {
    return (
        <Marker coordinate={event.position} onPress={onPress}>
            <Image resizeMode="contain" style={{ width: 48, height: 54 }} source={MARKER_IMAGES[status]} />
        </Marker>
    );
}
