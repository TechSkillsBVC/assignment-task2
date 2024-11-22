/**
 * EventDetail Component
 * 
 * Props:
 * @prop {EventDetails} event - The event details object to display.
 * @prop {Function} onVolunteer - Callback function invoked when the user volunteers for the event.
 * @prop {Function} onNavigateToMap - Callback function to navigate to the map with the event's location.
 * Capabilities:
 * This component displays detailed information about a specific event.
 * It shows the event image, title, organizer, description, and other key details.
 * The user can:
 * - Share the event using the "Share" button.
 * - Volunteer for the event by clicking "Volunteer".
 * - Open the event location on a map via the "Map" button.
*/

import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,ScrollView } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { StackScreenProps } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { fetchEvent } from '../services/api';
import { EventDetails } from '../types/Event'; // Importing EventDetails interface
import { useIsFocused } from '@react-navigation/native';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { updateEvent } from '../services/api';
import { User } from '../types/User';
import { fetchUser } from '../services/api';

interface RouteParams {
    eventId: string;
}

/**
 *  EventDetail Component
 *  - Displays detailed information about a specific event.
 *  - Allows users to share the event, volunteer, and view the event location on a map.
 */

export default function EventsDetail({ route, navigation }: StackScreenProps<{ EventsDetail: RouteParams }, 'EventsDetail'>) {
    const { eventId } = route.params; // Extract eventId from params
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true); // For showing the loading spinner
    const [apiError, setApiError] = useState<string | null>(null); // For handling API errors
    const isFocused = useIsFocused();
    const authenticationContext = useContext(AuthenticationContext);
    const userId = authenticationContext?.value?.id;
    const [organizer, setOrganizer] = useState<User | null>(null);

    useEffect(() => {
        if (isFocused) {
            async function loadEvent() {
                setIsLoading(true); // Start spinner
                setApiError(null); // Reset errors
                if (typeof eventId === 'string') {
                    try {
                        const response = await fetchEvent(eventId); // Fetch event data
                        setEvent(response.data);

                        if (response.data.organizerId) {
                            const organizerResponse = await fetchUser(response.data.organizerId);
                            setOrganizer(organizerResponse.data);
                        }
                    } catch (error) {
                        console.error('Failed to load event details:', error);
                        setApiError('Unable to load event details. Please try again.');
                    } finally {
                        setIsLoading(false); // Stop spinner
                    }
                } else {
                    console.error('Invalid eventId:', eventId);
                    setApiError('Invalid event ID.');
                    setIsLoading(false); // Stop spinner
                }
            }
            loadEvent();
        }
    }, [eventId, isFocused]);

    const handleVolunteer = async () => {
        if (event && userId && !event.volunteersIds.includes(userId)) {
            try {
                const updatedEvent = {
                    ...event,
                    volunteersIds: [...event.volunteersIds, userId], // Add user to volunteer list
                };
            const response = await updateEvent(event.id, updatedEvent);
            setEvent(response.data); // Update state with new volunteers
            } catch (error) {
                console.error('Error volunteering:', error);
            }
        }
    };
    // If there's an API error, show an alert
    useEffect(() => {
        if (apiError) {
            Alert.alert('Error', apiError, [{ text: 'Ok', onPress: () => setApiError(null) }]);
        }
    }, [apiError]);

    if (isLoading) {
        // Show a loading spinner while the event is being fetched
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00A3FF" />
                <Text>Loading event details...</Text>
            </View>
        );
    }

    if (!event) {
        return (
            <View style={styles.container}>
                <Text>No event data available.</Text>
            </View>
        );
    }

    const handleShare = () => {
        Alert.alert('Share', 'Sharing event details...');
    };

    const handleReturnToMap = () => {
        navigation.navigate('EventsMap' as never);
    };

    /**
     * Check if the user has already volunteered for the event.
     * Check if the event is full.
     * Get the number of volunteers signed up.
     */
    const userHasVolunteered = userId ? event.volunteersIds.includes(userId) : false;
    const isEventFull = event.volunteersIds.length >= event.volunteersNeeded;
    const volunteersCount = event.volunteersIds.length;

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />

            <View style={styles.detailsContainer}>
                <Text style={styles.title}>{event.name}</Text>
                <Text style={styles.organizer}> organized by {organizer ? `${organizer.name.first} ${organizer.name.last}` : 'Loading...'}</Text>
                <Text style={styles.description}>{event.description}</Text>
            </View>

            <View style={styles.infoCard}>
                <View style={styles.dateContainer}>
                    <Feather name="calendar" size={24} color="#00A3FF" />
                    <Text style={styles.dateText}>{new Date(event.dateTime).toLocaleString()}</Text>
                </View>
                <View style={styles.volunteerInfo}>
                    <Text style={styles.volunteerCount}>
                         {event.volunteersNeeded} Volunteer(s) needed </Text>
                         <Text style={styles.volunteerCount}>
                         {volunteersCount} Volunteer(s) signed up
                    </Text>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <RectButton style={[styles.button, styles.shareButton]} onPress={handleShare}>
                    <Text style={styles.buttonText}>Share</Text>
                </RectButton>

                {userHasVolunteered ? (
                <RectButton style={[styles.button, styles.shareButton]}>
                    <Text style={styles.buttonText}>You have already volunteered for this event.</Text>
                </RectButton>
            ) : isEventFull ? (
                <RectButton style={[styles.button, styles.fullButton]}>
                    <Text style={styles.buttonText}> Sorry, this event is full.</Text>
                </RectButton>
            ) : (
                <RectButton style={[styles.button, styles.volunteerButton]} onPress={handleVolunteer}>
                    <Text style={styles.buttonText}>Volunteer</Text>
                </RectButton>
            )}
            </View>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: event.position.latitude,
                    longitude: event.position.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}>
                <Marker
                    coordinate={{
                        latitude: event.position.latitude,
                        longitude: event.position.longitude,
                    }}
                    title={event.name}
                />
            </MapView>
            <TouchableOpacity style={styles.directionsButton} onPress={handleReturnToMap}>
                <Text style={styles.directionsButtonText}>Return to Map</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

/**
 * EventDetail Styles
 *  - Styles for the EventDetail component.
 *  - Uses StyleSheet for styling.
 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    eventImage: {
        width: '100%',
        height: 200,
    },
    detailsContainer: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    organizer: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    description: {
        fontSize: 14,
        color: '#777',
        marginTop: 10,
    },
    infoCard: {
        backgroundColor: '#F9F9F9',
        padding: 20,
        marginVertical: 20,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
    },
    volunteerInfo: {
        justifyContent: 'center',
    },
    volunteerCount: {
        fontSize: 16,
        color: '#FF7A00',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    button: {
        flex: 1,
        padding: 15,
        marginHorizontal: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullButton: {
        flex: 1,
        padding: 15,
        margin: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#7C0A02',
    },
    shareButton: {
        flex: 1,
        padding: 15,
        margin: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00A3FF',
    },
    volunteerButton: {
        flex: 1,
        padding: 15,
        margin: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF7A00',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    map: {
        height: 200,
        width: '100%',
    },
    directionsButton: {
        backgroundColor: '#007BFF',
        padding: 15,
        margin: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    directionsButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
}); 