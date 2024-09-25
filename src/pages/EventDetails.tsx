import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Share } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Event } from '../types/Events';
import { StackNavigationProp } from '@react-navigation/stack';

type EventDetailsNavigationProp = StackNavigationProp<any, 'EventDetails'>;

export default function EventDetails() {
    const route = useRoute();
    const navigation = useNavigation<EventDetailsNavigationProp>();
    const { event } = route.params as { event: Event };

    if (!event) {
        return <Text>No event data available</Text>;
    }

    const [volunteersIds, setVolunteersIds] = useState<string[]>(event.volunteersIds);

    const getEventStatus = () => {
        if (event.volunteersNeeded <= 0) {
            return 'Team is full';
        } else {
            return `${volunteersIds.length} / ${event.volunteersNeeded} volunteers applied`;
        }
    };

    const handleVolunteer = () => {
        if (event.volunteersNeeded > 0 && !volunteersIds.includes('ibgyDDd')) {
            const updatedVolunteersIds = [...volunteersIds, 'yourUserId'];
            setVolunteersIds(updatedVolunteersIds);
            Alert.alert('Thank you for volunteering!', `You have successfully volunteered for "${event.name}".`);
        } else {
            Alert.alert('Event is full', 'Sorry, this event is already full or you have already volunteered.');
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this event: ${event.name}\n${event.description}\nDate & Time: ${event.dateTime}`,
                title: event.name,
            });
        } catch (error) {
            Alert.alert('Error', 'Unable to share the event.');
        }
    };

    const handleBackToMap = () => {
        navigation.navigate('EventsMap');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{event.name}</Text>
            <Text>{event.description}</Text>
            <Text>{`Date & Time: ${event.dateTime}`}</Text>
            <Text>{`Status: ${getEventStatus()}`}</Text>

            {event.volunteersNeeded > 0 && (
                <Button title="Volunteer" onPress={handleVolunteer} />
            )}

            {event.volunteersNeeded > 0 && (
                <Button title="Share Event" onPress={handleShare} />
            )}

            <Button title="Back to Map" onPress={handleBackToMap} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});