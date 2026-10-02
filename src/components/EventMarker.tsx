import React from 'react';
import { Image } from 'react-native';
import { Marker } from 'react-native-maps';
import { VolunteerEvent } from '../types/Event';
import { eventState } from '../utils/eventState';
import available from '../images/map-marker.png';
import applied from '../images/map-marker-blue.png';
import full from '../images/map-marker-grey.png';

export default function EventMarker({ event, userId, onPress }: {
    event: VolunteerEvent; userId?: string; onPress?: () => void;
}) {
    const state = eventState(event, userId);
    return <Marker coordinate={event.position} onPress={onPress}
        accessibilityLabel={`${event.name}, ${state.status}`}>
        <Image source={state.applied ? applied : state.full ? full : available}
            resizeMode="contain" style={{ width: 48, height: 54 }} />
    </Marker>;
}
