import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React, { useCallback, useContext, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import EventMapWebView from '../components/EventMapWebView';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { EventsContext } from '../context/EventsContext';
import { EventDetail } from '../types/Event';

const EMPTY_EVENTS: EventDetail[] = [];

export default function EventsMap(props: StackScreenProps<any>) {
    const { navigation } = props;
    const authenticationContext = useContext(AuthenticationContext);
    const eventsContext = useContext(EventsContext);
    const events = eventsContext ? eventsContext.events : EMPTY_EVENTS;
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number }>();

    const handleNavigateToCreateEvent = () => {};

    // ADDED: Updated handler to navigate to EventDetails and pass the event ID in route params
    const handleNavigateToEventDetails = (id: string) => {
        navigation.navigate('EventDetails', { id });
    };

    const handleLogout = async () => {
        AsyncStorage.multiRemove(['userInfo', 'accessToken']).then(() => {
            authenticationContext?.setValue(undefined);
            navigation.navigate('Login');
        });
    };

    const refreshLocation = useCallback(() => {
        let active = true;

        const loadLocation = async () => {
            try {
                const currentPermission = await Location.getForegroundPermissionsAsync();
                const permission = currentPermission.granted
                    ? currentPermission
                    : await Location.requestForegroundPermissionsAsync();
                if (!active) return;

                if (!permission.granted) {
                    setUserLocation(undefined);
                    return;
                }

                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                if (active) {
                    setUserLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                }
            } catch (error) {
                console.warn('Unable to load current location; showing all events instead.', error);
                if (active) {
                    setUserLocation(undefined);
                }
            }
        };

        void loadLocation();
        return () => {
            active = false;
        };
    }, []);

    useFocusEffect(refreshLocation);

    return (
        <View style={styles.container}>
            <EventMapWebView
                events={events}
                currentUserId={authenticationContext?.value?.id}
                userLocation={userLocation}
                onSelectEvent={handleNavigateToEventDetails}
            />

            <View style={styles.footer}>
                {/* ADDED: Dynamic event counter based on array length */}
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
        flex: 1,
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