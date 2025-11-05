import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View, Alert } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarker from '../images/map-marker.png';
import mapMarkerBlue from '../images/map-marker-blue.png';
import mapMarkerGrey from '../images/map-marker-grey.png';
import { getEvents } from '../services/api';
import { Event } from '../types/Event';

export default function EventsMap(props: StackScreenProps<any>) {
    const { navigation } = props;
    const authenticationContext = useContext(AuthenticationContext);
    const currentUserId = authenticationContext?.value?.id;
    const mapViewRef = useRef<MapView>(null);

    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        loadEvents();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadEvents();
        });
        return unsubscribe;
    }, [navigation]);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const response = await getEvents();
            
            const now = new Date();
            const futureEvents = response.data.filter((event) => {
                const eventDate = new Date(event.dateTime);
                return eventDate > now;
            });

            setEvents(futureEvents);

            if (futureEvents.length > 0 && mapReady) {
                fitMapToEvents(futureEvents);
            }
        } catch (error) {
            console.error('Error loading events:', error);
            Alert.alert('Error', 'Failed to load events. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fitMapToEvents = (eventsToFit: Event[]) => {
        if (mapViewRef.current && eventsToFit.length > 0) {
            const coordinates = eventsToFit.map(({ position }) => ({
                latitude: position.latitude,
                longitude: position.longitude,
            }));

            setTimeout(() => {
                mapViewRef.current?.fitToCoordinates(coordinates, {
                    edgePadding: { 
                        top: 100, 
                        right: 60, 
                        bottom: 180, 
                        left: 60 
                    }, 
                    animated: true 
                });
            }, 500);

            setTimeout(() => {
                mapViewRef.current?.fitToCoordinates(coordinates, {
                    edgePadding: { 
                        top: 100, 
                        right: 60, 
                        bottom: 180, 
                        left: 60 
                    }, 
                    animated: true 
                });
            }, 1500);
        }
    };

    const handleMapReady = () => {
        setMapReady(true);
        if (events.length > 0) {
            setTimeout(() => fitMapToEvents(events), 1000);
        }
    };

    const getMarkerImage = useCallback(
        (event: Event) => {
            const isUserVolunteered = event.volunteersIds.includes(currentUserId || '');
            const isEventFull = event.volunteersIds.length >= event.volunteersNeeded;

            if (isUserVolunteered) {
                return mapMarkerBlue;  // Blue - user volunteered
            } else if (isEventFull) {
                return mapMarkerGrey;  // Grey - event full
            } else {
                return mapMarker;      // Orange - available
            }
        },
        [currentUserId]
    );

    const handleNavigateToEventDetails = (eventId: string) => {
        navigation.navigate('EventDetails', { eventId });
    };

    const handleNavigateToCreateEvent = () => {
        console.log('Navigate to create event');
    };

    const handleLogout = async () => {
        AsyncStorage.multiRemove(['userInfo', 'accessToken']).then(() => {
            authenticationContext?.setValue(undefined);
            navigation.navigate('Login');
        });
    };

    const handleFitMap = () => {
        if (events.length > 0) {
            fitMapToEvents(events);
        }
    };

    const getEventsCountText = () => {
        const count = events.length;
        return `${count} event${count !== 1 ? 's' : ''} found`;
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapViewRef}
                provider={PROVIDER_GOOGLE}
                style={styles.mapStyle}
                initialRegion={{
                    latitude: 51.0447,
                    longitude: -114.0719,
                    latitudeDelta: 0.15,
                    longitudeDelta: 0.15,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                onMapReady={handleMapReady}
            >
               {events.map((event) => {
                    const isUserVolunteered = event.volunteersIds.includes(currentUserId || '');
                    const isEventFull = event.volunteersIds.length >= event.volunteersNeeded;
                    
                    let markerSource = mapMarker;  // Orange by default
                    if (isUserVolunteered) {
                        markerSource = mapMarkerBlue;  // Blue if volunteered
                    } else if (isEventFull) {
                        markerSource = mapMarkerGrey;  // Grey if full
                    }
                    
                    return (
                        <Marker
                            key={event.id}
                            coordinate={{
                                latitude: event.position.latitude,
                                longitude: event.position.longitude,
                            }}
                            onPress={() => handleNavigateToEventDetails(event.id)}
                        >
                            <Image
                                source={markerSource}
                                style={{ width: 48, height: 54 }}
                                resizeMode="contain"
                            />
                        </Marker>
                    );
                })}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>{getEventsCountText()}</Text>
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

            <RectButton
                style={[styles.smallButton, { 
                    position: 'absolute', 
                    top: 140, 
                    right: 24, 
                    backgroundColor: '#FF8700' 
                }]}
                onPress={handleFitMap}
            >
                <Feather name="maximize" size={20} color="#FFF" />
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
    markerImage: {
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
        elevation: 5,
    },
    footerText: {
        fontFamily: 'Nunito_700Bold',
        color: '#8fa7b3',
        fontSize: 16,
    },
    smallButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
});