import { WebView } from 'react-native-webview';
import React, { useContext, useState } from 'react';
import {
    Alert,
    Image,
    Linking,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import { Event } from '../types/Event';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { volunteerForEvent } from '../services/api';

type EventDetailsRouteParams = {
    EventDetails: {
        event: Event;
    };
};

export default function EventDetails() {
    const route =
        useRoute<RouteProp<EventDetailsRouteParams, 'EventDetails'>>();

    const { event } = route.params;

    const authContext = useContext(AuthenticationContext);
    const currentUser = authContext?.value;

    const [isVolunteering, setIsVolunteering] = useState(
        event.volunteersIds.includes(currentUser?.id ?? '')
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [volunteerCount, setVolunteerCount] = useState(
        event.volunteersIds.length
    );

    const isFull = volunteerCount >= event.volunteersNeeded;

    const canVolunteer =
        !isFull && !isVolunteering && !isSubmitting;

    const handleVolunteer = async () => {
        if (!currentUser) {
            Alert.alert('Error', 'Please log in again.');
            return;
        }

        if (isFull) {
            Alert.alert(
                'Event Full',
                'This event has no available spots.'
            );
            return;
        }

        if (isVolunteering) {
            Alert.alert(
                'Already Registered',
                'You have already volunteered for this event.'
            );
            return;
        }

        try {
            setIsSubmitting(true);

            await volunteerForEvent(event.id, currentUser.id);

            setIsVolunteering(true);
            setVolunteerCount((count) => count + 1);

            Alert.alert(
                'Success',
                'You have volunteered for this event!'
            );
        } catch (error) {
            Alert.alert(
                'Registration Failed',
                error instanceof Error
                    ? error.message
                    : 'Could not register for this event.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGetDirections = async () => {
        const { latitude, longitude } = event.position;

        const url =
            `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

        try {
            await Linking.openURL(url);
        } catch {
            Alert.alert(
                'Error',
                'Could not open Google Maps.'
            );
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                title: event.name,
                message:
                    `${event.name}\n\n` +
                    `${event.description}\n\n` +
                    `Date: ${new Date(event.dateTime).toLocaleString()}\n\n` +
                    `Get Directions: https://www.google.com/maps/dir/?api=1&destination=${event.position.latitude},${event.position.longitude}`,
            });
        } catch {
            Alert.alert(
                'Error',
                'Could not share this event.'
            );
        }
    };

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.container}
        >
            <Text style={styles.title}>
                {event.name}
            </Text>

            {event.imageUrl ? (
                <Image
                    source={{ uri: event.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
            ) : null}

            <Text style={styles.description}>
                {event.description}
            </Text>

            <Text style={styles.date}>
                Date: {new Date(event.dateTime).toLocaleString()}
            </Text>
            <Text style={styles.mapTitle}>Event Location</Text>

<WebView
    source={{
        uri:
            `https://www.openstreetmap.org/export/embed.html?` +
            `bbox=${event.position.longitude - 0.01},` +
            `${event.position.latitude - 0.01},` +
            `${event.position.longitude + 0.01},` +
            `${event.position.latitude + 0.01}` +
            `&layer=mapnik` +
            `&marker=${event.position.latitude},${event.position.longitude}`,
    }}
    style={styles.miniMap}
    javaScriptEnabled={true}
    scrollEnabled={false}
/>

            <Text style={styles.volunteers}>
                Volunteers: {volunteerCount} / {event.volunteersNeeded}
            </Text>

            <Text style={styles.status}>
                {isFull
                    ? 'Event is Full'
                    : 'Volunteers Needed'}
            </Text>

            {canVolunteer ? (
                <TouchableOpacity
                    style={styles.volunteerButton}
                    onPress={handleVolunteer}
                    disabled={isSubmitting}
                >
                    <Text style={styles.volunteerButtonText}>
                        {isSubmitting
                            ? 'Registering...'
                            : 'Volunteer'}
                    </Text>
                </TouchableOpacity>
            ) : null}

            {isVolunteering ? (
                <Text style={styles.successMessage}>
                    You are volunteering for this event!
                </Text>
            ) : null}

            <TouchableOpacity
                style={styles.volunteerButton}
                onPress={handleGetDirections}
            >
                <Text style={styles.volunteerButtonText}>
                    Get Directions
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.volunteerButton}
                onPress={handleShare}
            >
                <Text style={styles.volunteerButtonText}>
                    Share Event
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#F2F3F5',
    },
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    mapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#031A62',
    marginBottom: 10,
},

miniMap: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 20,
},
    image: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#031A62',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333333',
        marginBottom: 20,
    },
    date: {
        fontSize: 16,
        marginBottom: 12,
    },
    volunteers: {
        fontSize: 16,
        marginBottom: 12,
    },
    status: {
        fontSize: 18,
        fontWeight: '700',
        color: '#031A62',
        marginBottom: 20,
    },
    volunteerButton: {
        backgroundColor: '#031A62',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 12,
    },
    volunteerButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    successMessage: {
        color: 'green',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
});