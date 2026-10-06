import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import { Colors } from '../constants/Colors';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { EventsContext } from '../context/EventsContext';
import mapMarkerBlueImg from '../images/map-marker-blue.png';
import mapMarkerGreyImg from '../images/map-marker-grey.png';
import mapMarkerImg from '../images/map-marker.png';
import { EventStatus } from '../types/Event';
import { getEventStatus, isPastEvent } from '../utils/events';

/** Marker artwork for each event state, matching the design. */
const markerImages: Record<EventStatus, any> = {
    open: mapMarkerImg,
    volunteered: mapMarkerBlueImg,
    full: mapMarkerGreyImg,
};

export default function EventsMap(props: StackScreenProps<any>) {
    const { navigation } = props;
    const authenticationContext = useContext(AuthenticationContext);
    const eventsContext = useContext(EventsContext);
    const mapViewRef = useRef<MapView>(null);

    const [userPosition, setUserPosition] = useState<LatLng>();

    const currentUserId = authenticationContext?.value?.id;
    const events = eventsContext?.events ?? [];

    // Past events are not shown on the map.
    const upcomingEvents = useMemo(() => events.filter((event) => !isPastEvent(event)), [events]);

    useEffect(() => {
        const loadUserPosition = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== Location.PermissionStatus.GRANTED) return;

            const { coords } = await Location.getCurrentPositionAsync();
            setUserPosition({ latitude: coords.latitude, longitude: coords.longitude });
        };

        loadUserPosition();
    }, []);

    /** Frames the user's location together with every event still open. */
    const fitMapToEvents = useCallback(() => {
        const coordinates = upcomingEvents.map(({ position }) => position);
        if (userPosition) coordinates.push(userPosition);
        if (!coordinates.length) return;

        mapViewRef.current?.fitToCoordinates(coordinates, { edgePadding: MapSettings.EDGE_PADDING });
    }, [upcomingEvents, userPosition]);

    // Reposition the map on load and every time the user comes back to this screen.
    useFocusEffect(
        useCallback(() => {
            fitMapToEvents();
        }, [fitMapToEvents])
    );

    const handleNavigateToCreateEvent = () => {};

    const handleNavigateToEventDetails = (eventId: string) => {
        navigation.navigate('EventDetails', { eventId });
    };

    const handleLogout = async () => {
        AsyncStorage.multiRemove(['userInfo', 'accessToken']).then(() => {
            authenticationContext?.setValue(undefined);
            navigation.navigate('Login');
        });
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapViewRef}
                provider={PROVIDER_GOOGLE}
                initialRegion={MapSettings.DEFAULT_REGION}
                style={styles.mapStyle}
                customMapStyle={customMapStyle}
                showsMyLocationButton={false}
                showsUserLocation={true}
                rotateEnabled={false}
                toolbarEnabled={false}
                moveOnMarkerPress={false}
                mapPadding={MapSettings.EDGE_PADDING}
                onLayout={fitMapToEvents}
            >
                {upcomingEvents.map((event) => {
                    const status = getEventStatus(event, currentUserId);

                    return (
                        <Marker
                            key={event.id}
                            coordinate={event.position}
                            onPress={() => handleNavigateToEventDetails(event.id)}
                        >
                            <Image resizeMode="contain" style={styles.marker} source={markerImages[status]} />
                        </Marker>
                    );
                })}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>{upcomingEvents.length} event(s) found</Text>
                <RectButton
                    style={[styles.smallButton, { backgroundColor: Colors.primary }]}
                    onPress={handleNavigateToCreateEvent}
                >
                    <Feather name="plus" size={20} color="#FFF" />
                </RectButton>
            </View>
            <RectButton
                style={[styles.logoutButton, styles.smallButton, { backgroundColor: Colors.slate }]}
                onPress={handleLogout}
            >
                <Feather name="log-out" size={20} color="#FFF" />
            </RectButton>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },

    mapStyle: {
        ...StyleSheet.absoluteFillObject,
    },

    marker: {
        width: 48,
        height: 54,
    },

    logoutButton: {
        position: 'absolute',
        top: 70,
        right: 24,

        elevation: 3,
    },

    footer: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 40,

        backgroundColor: '#FFF',
        borderRadius: 16,
        height: 56,
        paddingLeft: 24,

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        elevation: 3,
    },

    footerText: {
        fontFamily: 'Nunito_700Bold',
        color: Colors.muted,
    },

    smallButton: {
        width: 56,
        height: 56,
        borderRadius: 16,

        justifyContent: 'center',
        alignItems: 'center',
    },
});
