import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Alert, Share, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Event } from '../types/Events';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';  

type EventDetailsNavigationProp = StackNavigationProp<any, 'EventDetails'>;

export default function EventDetails() {
    const route = useRoute();
    const navigation = useNavigation<EventDetailsNavigationProp>();
    const { event } = route.params as { event: Event };

    if (!event) {
        return <Text>No event data available</Text>;
    }

    const [volunteersIds, setVolunteersIds] = useState<string[]>(event.volunteersIds);
    const [remainingSpots, setRemainingSpots] = useState(event.volunteersNeeded - event.volunteersIds.length);

    const getEventStatus = () => {
        if (remainingSpots <= 0) {
            return 'Team is full';
        } else {
            return `${volunteersIds.length} of ${event.volunteersNeeded} Volunteer(s) needed`;
        }
    };

    const handleVolunteer = () => {
        const userId = 'ibgyDDd'; 
        if (remainingSpots > 0 && !volunteersIds.includes(userId)) {
            const updatedVolunteersIds = [...volunteersIds, userId];
            setVolunteersIds(updatedVolunteersIds);
            setRemainingSpots(remainingSpots - 1);
            Alert.alert('Thank you for volunteering!', `You have successfully volunteered for "${event.name}".`);
        } else if (volunteersIds.includes(userId)) {
            Alert.alert('Already volunteered', 'You have already volunteered for this event.');
        } else {
            Alert.alert('Event is full', 'Sorry, this event is already full.');
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
         
            <TouchableOpacity 
                style={styles.backButton}
                activeOpacity={0.7}  
                onPress={handleBackToMap}
            >
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>

         
            <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />

            
            <View style={styles.detailsContainer}>
                <Text style={styles.title}>{event.name}</Text>
                <Text style={styles.organizer}>organized by Robert Last</Text>
                <Text style={styles.description}>{event.description}</Text>

             
                <View style={styles.infoRow}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>📅</Text>
                        <Text style={styles.infoText}>{new Date(event.dateTime).toLocaleDateString()} {new Date(event.dateTime).toLocaleTimeString()}</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>{getEventStatus()}</Text>
                    </View>
                </View>


                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                        <Text style={styles.buttonText}>Share</Text>
                    </TouchableOpacity>
                    
                    {remainingSpots > 0 ? (
                        <TouchableOpacity style={styles.volunteerButton} onPress={handleVolunteer}>
                            <Text style={styles.buttonText}>Volunteer</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.teamFullBox}>
                            <Text style={styles.teamFullText}>Team is full</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    backButton: {
        position: 'absolute',
        top: 40,  
        left: 20,
        zIndex: 1,
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.1)', 
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 5,  
        transform: [{ scale: 1 }],
        transition: 'transform 0.2s ease', 
    },
    backButtonPressed: {
        transform: [{ scale: 1.1 }],
    },
    eventImage: {
        width: '100%',
        height: 200,
    },
    detailsContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    organizer: {
        fontSize: 16,
        color: '#888',
        marginVertical: 5,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginVertical: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    infoBox: {
        alignItems: 'center',
        backgroundColor: '#E5F6FF',
        padding: 10,
        borderRadius: 10,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    shareButton: {
        backgroundColor: '#008CFF',
        padding: 15,
        borderRadius: 10,
        width: '45%',
        alignItems: 'center',
    },
    volunteerButton: {
        backgroundColor: '#FFA500',
        padding: 15,
        borderRadius: 10,
        width: '45%',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    teamFullBox: {
        backgroundColor: '#FFC1C1',
        padding: 15,
        borderRadius: 10,
        width: '45%',
        alignItems: 'center',
    },
    teamFullText: {
        fontSize: 16,
        color: '#B22222',
        fontWeight: 'bold',
    },
});
