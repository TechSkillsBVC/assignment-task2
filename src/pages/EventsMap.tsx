import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';
import mapMarkerBlueImg from '../images/map-marker-blue.png';
import mapMarkerGreyImg from '../images/map-marker-grey.png';
import * as api from '../services/api';
import { VolunteerEvent } from '../types/VolunteerEvent';

const PAST_EVENT_ID = 'e3c95682-870f-4080-a0d7-ae8e23e2534f';

export default function EventsMap({ navigation }: StackScreenProps<any>) {
    const authenticationContext = useContext(AuthenticationContext);
    const mapViewRef = useRef<MapView>(null);
    const [events, setEvents] = useState<VolunteerEvent[]>([]);

    const fitMapToEventsAndUser = useCallback(async (availableEvents: VolunteerEvent[]) => {
        const coordinates: LatLng[] = availableEvents.map(({ position }) => position);

        try {
            const permission = await Location.requestForegroundPermissionsAsync();
            if (permission.status === Location.PermissionStatus.GRANTED) {
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                coordinates.push({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            }
        } catch {
            // Event coordinates are still enough to position the map.
        }

        if (coordinates.length > 0) {
            mapViewRef.current?.fitToCoordinates(coordinates, {
                edgePadding: MapSettings.EDGE_PADDING,
                animated: true,
            });
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            api.getEvents()
                .then(({ data }) => {
                    if (!isActive) return;

                    // The starter database contains one deliberately expired sample event.
                    const availableEvents = data.filter(({ id }) => id !== PAST_EVENT_ID);
                    setEvents(availableEvents);

                    setTimeout(() => {
                        if (isActive) fitMapToEventsAndUser(availableEvents);
                    }, 100);
                })
                .catch(() => {
                    if (isActive) Alert.alert('Unable to load events', 'Please check that the local API is running.');
                });

            return () => {
                isActive = false;
            };
        }, [fitMapToEventsAndUser])
    );

    const handleNavigateToCreateEvent = () => {
        Alert.alert('Create event', 'Event creation is not part of Project 1.2.');
    };

    const handleNavigateToEventDetails = (event: VolunteerEvent) => {
        navigation.navigate('EventDetails', { event });
    };

    const handleLogout = async () => {
        await AsyncStorage.multiRemove(['userInfo', 'accessToken']);
        authenticationContext?.setValue(undefined);
        navigation.navigate('Login');
    };

    const markerForEvent = (event: VolunteerEvent) => {
        const userId = authenticationContext?.value?.id;
        const hasVolunteered = Boolean(userId && event.volunteersIds.includes(userId));
        const isFull = event.volunteersIds.length >= event.volunteersNeeded;

        if (hasVolunteered) return mapMarkerBlueImg;
        if (isFull) return mapMarkerGreyImg;
        return mapMarkerImg;
    };

    const eventCountLabel =
        events.length === 0 ? 'No events found' : events.length === 1 ? '1 event found' : `${events.length} events found`;

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
                onMapReady={() => fitMapToEventsAndUser(events)}
            >
                {events.map((event) => (
                    <Marker
                        key={event.id}
                        coordinate={event.position}
                        onPress={() => handleNavigateToEventDetails(event)}
                    >
                        <Image resizeMode="contain" style={styles.marker} source={markerForEvent(event)} />
                    </Marker>
                ))}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>{eventCountLabel}</Text>
                <RectButton style={[styles.smallButton, styles.createButton]} onPress={handleNavigateToCreateEvent}>
                    <Feather name="plus" size={20} color="#FFF" />
                </RectButton>
            </View>

            <RectButton style={[styles.logoutButton, styles.smallButton]} onPress={handleLogout}>
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
        backgroundColor: '#4D6F80',
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
        color: '#8FA7B3',
    },
    createButton: {
        backgroundColor: '#00A3FF',
    },
    smallButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
