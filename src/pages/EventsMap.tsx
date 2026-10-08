import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { LatLng, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import EventMarker from '../components/EventMarker';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import * as api from '../services/api';
import { getFromNetworkFirst } from '../services/caching';
import { Event } from '../types/Event';
import { RootStackParamList } from '../types/Navigation';
import { getEventStatus, isUpcomingEvent } from '../utils/events';

export default function EventsMap(props: StackScreenProps<RootStackParamList, 'EventsMap'>) {
    const { navigation } = props;
    const authenticationContext = useContext(AuthenticationContext);
    const currentUserId = authenticationContext?.value?.id;
    const mapViewRef = useRef<MapView>(null);
    const isFocused = useIsFocused();

    const [events, setEvents] = useState<Event[]>([]);
    const [userLocation, setUserLocation] = useState<LatLng>();
    const [isMapReady, setIsMapReady] = useState(false);

    //reload when screen gains focus
    useEffect(() => {
        if (!isFocused) return;
        loadEvents();
        loadUserLocation();
    }, [isFocused]);

    useEffect(() => {
        if (isFocused && isMapReady) fitMapToContent();
    }, [isFocused, isMapReady, events, userLocation]);

    const loadEvents = () => {
        getFromNetworkFirst('events', api.getEvents())
            .then((allEvents) => setEvents(allEvents.filter(isUpcomingEvent)))
            .catch((error) => console.log(error));
    };

    const loadUserLocation = async () => {
        try {
            const { granted } = await Location.requestForegroundPermissionsAsync();
            if (!granted) return;
            const location =
                (await Location.getLastKnownPositionAsync()) ??
                (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
            setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
        } catch (error) {
            console.log(error);
        }
    };

    const fitMapToContent = () => {
        const coordinates = events.map(({ position }) => position);
        if (userLocation) coordinates.push(userLocation);
        if (coordinates.length === 0) return;
        mapViewRef.current?.fitToCoordinates(coordinates, { edgePadding: MapSettings.EDGE_PADDING, animated: true });
    };

    const handleNavigateToCreateEvent = () => {};

    const handleNavigateToEventDetails = (event: Event) => {
        navigation.navigate('EventDetails', { event });
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
                onMapReady={() => setIsMapReady(true)}
            >
                {events.map((event) => (
                    <EventMarker
                        key={event.id}
                        event={event}
                        status={getEventStatus(event, currentUserId)}
                        onPress={() => handleNavigateToEventDetails(event)}
                    />
                ))}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>{events.length} event(s) found</Text>
                <RectButton
                    style={[styles.smallButton, { backgroundColor: '#00A3FF' }]}
                    onPress={handleNavigateToCreateEvent}
                >
                    <Feather name="plus" size={20} color="#FFF" />
                </RectButton>
            </View>
            <RectButton
                style={[styles.logoutButton, styles.smallButton, { backgroundColor: '#4D6F80' }]}
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
        color: '#8fa7b3',
    },

    smallButton: {
        width: 56,
        height: 56,
        borderRadius: 16,

        justifyContent: 'center',
        alignItems: 'center',
    },
});
