/**
 * EventsMap Component
 * 
 * This component displays a map with pins representing event locations. 
 * Users can interact with the map to view events or select locations.
 * 
 * Props:
 * @prop {EventDetails[]} events - Array of event objects to display on the map.
 * @prop {string} loggedInUser - The name of the logged-in user, displayed in the top left corner.
 * @prop {Function} onEventSelect - Callback function invoked when an event pin is selected.
 * @prop {Function} onMapPress - Callback function triggered when the map is pressed (e.g., to drop a pin for creating an event).
 * 
 * Capabilities:
 * - Displays all events as pins on the map.
 * - Shows the logged-in user’s name in the top-left corner.
 * - Allows users to tap on a pin to view event details.
 * - Supports adding a new event location by tapping on the map.
 * - Offers smooth navigation and interaction for both viewing and creating events.
 */

import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import { useIsFocused } from '@react-navigation/native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';
import mapMarkerImgBlue from '../images/map-marker-blue.png';
import mapMarkerImgGrey from '../images/map-marker-grey.png';
import { fetchEvents } from '../services/api'; 
import { EventDetails } from '../types/Event';

export default function EventsMap(props: StackScreenProps<any>) {
    const { navigation } = props;
    const authenticationContext = useContext(AuthenticationContext);
    const mapViewRef = useRef<MapView>(null);
    const [events, setEvents] = useState<EventDetails[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const isFocused = useIsFocused();

    const loggedInUser = authenticationContext?.value?.name.first || 'Guest'; // Get logged in user’s name

    useEffect(() => {
        async function loadEvents() {
            setIsLoading(true);
            setApiError(null); // Reset any previous errors
            try {
                const response = await fetchEvents(); // Fetch events from the API
                setEvents(response.data); // Update state with API data
            } catch (error) {
                console.error('Error fetching events:', error);
                setApiError('Failed to load events. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }

        loadEvents();
    }, [isFocused]);

    const handleNavigateToCreateEvent = () => {
    navigation.navigate('CreateEvents')
    };

    const handleNavigateToEventDetails = (eventId: string) => {
        navigation.navigate('EventsDetail',{eventId});
    };

    const getMarkerImage = (event: EventDetails) => {
        const userId = authenticationContext?.value?.id;
        const userHasVolunteered = userId ? event.volunteersIds.includes(userId) : false;
        const isEventFull = event.volunteersIds.length >= event.volunteersNeeded;

        if (userHasVolunteered) {
            return mapMarkerImgBlue; // Blue for already volunteered
        } else if (isEventFull) {
            return mapMarkerImgGrey; // Grey for event full
        } else {
            return mapMarkerImg; // Default for available spots
        }
    };
/**
 * Logs out the user by removing the user info and access token from AsyncStorage.
 * Navigates to the Login screen.
 * @returns {Promise<void>}
 * @throws {Error} Throws an error if the AsyncStorage operation fails.
 */
    const handleLogout = async () => {
        AsyncStorage.multiRemove(['userInfo', 'accessToken']).then(() => {
            authenticationContext?.setValue(undefined);
            navigation.navigate('Login');
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome: {loggedInUser}</Text>
            </View>

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
                onLayout={() =>
                    mapViewRef.current?.fitToCoordinates(
                        events.map(({ position }) => ({
                            latitude: position.latitude,
                            longitude: position.longitude,
                        })),
                        { edgePadding: MapSettings.EDGE_PADDING }
                    )
                }
            >
                {events.map((event) => {
                    return (
                        <Marker
                            key={event.id}
                            coordinate={{
                                latitude: event.position.latitude,
                                longitude: event.position.longitude,
                            }}
                            onPress={() => handleNavigateToEventDetails(event.id)}
                        >
                            <Image resizeMode="contain" style={{ width: 48, height: 54 }} source={getMarkerImage(event)} />
                        </Marker>
                    );
                })}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>{events.length} found</Text>
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

/**
 * Styles for the EventsMap component.
 * @type {Object}
 * @property {ViewStyle} container - Style for the main container.
 */

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
    welcomeContainer: {
        position: 'absolute',
        top: 40,
        left: 24,
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 8,
        elevation: 3,
    },
    welcomeText: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 16,
        color: '#333',
    },
});

interface event {
    id: string;
    position: {
        latitude: number;
        longitude: number;
    };
}