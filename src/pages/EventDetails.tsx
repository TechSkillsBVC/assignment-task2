import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';

// Define the props for the EventDetails component
type EventDetailsProps = {
    route: RouteProp<{ params: { eventId: string; currentUserId: string } }, 'params'>;
};

const events = [
    {
        id: "e3c95682-870f-4080-a0d7-ae8e23e2534f",
        dateTime: "2022-01-11T21:30:00.000Z",
        description: "Past events should not be displayed in the map",
        "imageUrl": "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=max&w=1080&q=80", 
        name: "!!!Past Event!!!",
        position: {
            latitude: 51.105761,
            longitude: -114.106943
        },
        volunteersNeeded: 1,
        volunteersIds: []
    },
    {
        id: "98301b22-2b76-44f1-a8da-8c86c56b0367",
        dateTime: "2023-01-11T23:30:00.000Z",
        description: "The Memorial Park Library is looking for volunteers to help setting up the stage for our talented local artists.",
        "imageUrl": "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=max&w=1080&q=80",
        name: "Downtown Vibe Live Music",
        position: {
            latitude: 51.04112,
            longitude: -114.069325
        },
        volunteersNeeded: 4,
        volunteersIds: ["3UN3-2L", "gpFfX6e", "tRHltUh", "ajY8pM2"]
    },
    {
        id: "d7b8ea73-ba2c-4fc3-9348-9814076124bd",
        dateTime: "2023-02-04T16:30:00.000Z",
        description: "At the Flames Community Arena, we are offering free skating lessons with volunteer instructors.",
        "imageUrl": "https://images.unsplash.com/photo-1528828465856-0ac27ee2aeb3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=max&w=1080&q=80",
        name: "Free Skating Lessons Day",
        position: {
            latitude: 51.01222958257112,
            longitude: -114.11677222698927
        },
        volunteersNeeded: 10,
        volunteersIds: ["EF-BZ00", "gpFfX6e", "Hr-40KW", "elKKrm3"]
    },
    {
        id: "d1a6b9ea-877d-4711-b8d7-af8f1bce4d29",
        dateTime: "2023-01-06T15:30:00.000Z",
        description: "The Elboya School is looking for volunteers to teach computer programming to kids.",
        "imageUrl": "https://images.unsplash.com/photo-1584697964328-b1e7f63dca95?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=max&w=1080&q=80",
        name: "Kids Programming Day",
        position: {
            latitude: 51.010801915407036,
            longitude: -114.07823592424393
        },
        volunteersNeeded: 2,
        volunteersIds: ["EF-BZ00", "Q5bVHgP"]
    }
];

const EventDetails: React.FC<EventDetailsProps> = ({ route }) => {
    const { eventId, currentUserId } = route.params;

    // Find the event by ID
    const event = events.find(event => event.id === eventId);

    if (!event) {
        return <Text style={styles.errorText}>Event not found</Text>;
    }

    const isUserVolunteered = event.volunteersIds.includes(currentUserId);
    const isEventFull = event.volunteersNeeded <= event.volunteersIds.length;

    const handleJoinEvent = () => {
        alert('User has joined the event!'); 
    };

    const handleCall = () => {
        alert('Calling the organizer...'); 
    };

    const handleText = () => {
        alert('Texting the organizer...'); 
    };


    return (
        <View style={styles.container}>
            <Image source={{ uri: event.imageUrl }} style={styles.image} />
            <Text style={styles.title}>{event.name}</Text>
            <Text style={styles.date}>{new Date(event.dateTime).toLocaleString()}</Text>
            <Text style={styles.description}>{event.description}</Text>
            <View style={styles.detailsContainer}>
                <Text style={styles.details}>Volunteers Needed: {event.volunteersNeeded}</Text>
                <Text style={styles.details}>Current Volunteers: {event.volunteersIds.length}</Text>
            </View>


           {/* Event Status Box */}
           <View style={styles.statusBox}>
                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>{new Date(event.dateTime).toLocaleString()}</Text>
                </View>
                <View style={styles.statusContainer}>
                    {isUserVolunteered ? (
                        <Text style={styles.volunteeredText}>Volunteered</Text>
                    ) : isEventFull ? (
                        <Text style={styles.fullText}>Team is Full</Text>
                    ) : (
                        <Text style={styles.availableText}>Available</Text>
                    )}
                </View>
            </View>


           {/* Dynamic status display */}
           {isUserVolunteered ? (
                <View style={styles.joined}>
                    <Text style={styles.statusText}>You have volunteered for this event!</Text>
                    <TouchableOpacity style={styles.button} onPress={handleCall}>
                        <Text style={styles.buttonText}>Call Organizer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleText}>
                        <Text style={styles.buttonText}>Text Organizer</Text>
                    </TouchableOpacity>
                </View>
            ) : isEventFull ? (
                <View style={styles.full}>
                    <Text style={styles.statusText}>This event is currently full!</Text>
                </View>
            ) : (
                <View style={styles.available}>
                    <Text style={styles.statusText}>You can volunteer for this event!</Text>
                    <TouchableOpacity style={styles.joinButton} onPress={handleJoinEvent}>
                        <Text style={styles.joinButtonText}>Join Event</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Conditional rendering for share button */}
            {(isUserVolunteered || !isEventFull) && (
                <TouchableOpacity style={styles.shareButton}>
                    <Text style={styles.shareButtonText}>Share Event</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    date: {
        fontSize: 16,
        color: '#888',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        marginBottom: 10,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    details: {
        fontSize: 14,
        marginBottom: 5,
    },
    statusBox: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#E6F7FF', // Light blue background
        borderRadius: 10,
        marginBottom: 20,
    },
    dateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateText: {
        color: '#0080FF', // Color for date text
        fontSize: 16,
    },
    volunteeredText: {
        color: '#00A300', // Green color for volunteered
        fontSize: 16,
    },
    fullText: {
        color: '#FF0000', // Red color for full
        fontSize: 16,
    },
    availableText: {
        color: '#FFA500', // Orange color for available
        fontSize: 16,
    },
    detailsContainer: {
        marginBottom: 10,
    },
    
    available: {
        backgroundColor: '#FFA500', // Orange
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
    },
    joined: {
        backgroundColor: '#1E90FF', // Blue
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
    },
    full: {
        backgroundColor: '#808080', // Grey
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
    },
    statusText: {
        color: '#fff',
        textAlign: 'center',
    },
    joinButton: {
        backgroundColor: '#007bff', // Bootstrap primary color
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    joinButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007bff', // Button color for call/text
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    shareButton: {
        backgroundColor: '#FFC107', // Yellow for share button
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    shareButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        fontSize: 18,
        textAlign: 'center',
        marginVertical: 20,
    },
});
export default EventDetails;
