import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';
import * as api from '../services/api';
import { getFromCache, setInCache } from '../services/caching';
import { Event } from '../types/Event';

export default function EventsMap({ navigation }: StackScreenProps<any>) {
    const authenticationContext = useContext(AuthenticationContext);
    const mapViewRef = useRef<MapView>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const futureEvents = useMemo(
        () => events.filter((event) => new Date(event.dateTime).getTime() > Date.now()),
        [events]
    );

    const fitMapToEvents = useCallback(() => {
        if (futureEvents.length === 0) return;
        mapViewRef.current?.fitToCoordinates(
            futureEvents.map(({ position }) => ({
                latitude: position.latitude,
                longitude: position.longitude,
            })),
            { edgePadding: MapSettings.EDGE_PADDING }
        );
    }, [futureEvents]);

    useEffect(() => {
        fitMapToEvents();
    }, [fitMapToEvents]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const loadEvents = async () => {
                setLoading(true);
                try {
                    const response = await api.getEvents();
                    if (!Array.isArray(response.data)) {
                        throw new Error('The events endpoint returned an invalid response.');
                    }
                    if (isActive) setEvents(response.data);
                    try {
                        await setInCache('events', response.data);
                    } catch {
                        if (isActive) {
                            Alert.alert(
                                'Events loaded',
                                'Events are available, but could not be saved for offline use.'
                            );
                        }
                    }
                } catch {
                    try {
                        const cachedEvents = await getFromCache<Event[]>('events');
                        if (!Array.isArray(cachedEvents)) {
                            throw new Error('Cached events are invalid.');
                        }
                        if (isActive) setEvents(cachedEvents);
                    } catch {
                        if (isActive) {
                            setEvents([]);
                            Alert.alert(
                                'Unable to load events',
                                'The event service is unavailable and there are no saved events to display.'
                            );
                        }
                    }
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            void loadEvents();
            return () => {
                isActive = false;
            };
        }, [])
    );

    const handleLogout = async () => {
        try {
            await AsyncStorage.multiRemove(['userInfo', 'accessToken']);
            authenticationContext?.setValue(undefined);
            navigation.navigate('Login');
        } catch {
            Alert.alert('Unable to log out', 'Your session could not be cleared. Please try again.');
        }
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
                onMapReady={fitMapToEvents}
            >
                {futureEvents.map((event) => (
                    <Marker
                        key={event.id}
                        coordinate={{
                            latitude: event.position.latitude,
                            longitude: event.position.longitude,
                        }}
                        onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
                    >
                        <Image resizeMode="contain" style={{ width: 48, height: 54 }} source={mapMarkerImg} />
                    </Marker>
                ))}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    {futureEvents.length} {futureEvents.length === 1 ? 'event' : 'events'} found
                </Text>
                <RectButton
                    style={[styles.smallButton, { backgroundColor: '#00A3FF' }]}
                    onPress={() => navigation.navigate('CreateEvent')}
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
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#00A3FF" />
                </View>
            )}
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
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF66',
    },
});
