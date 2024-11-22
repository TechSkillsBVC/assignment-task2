/**
 * CreateEvents Component
 * 
 * This component provides a form for users to create new events.
 * Users can:
 * - Enter event details (name, description, date/time, volunteers needed).
 * - Select an organizer from a dropdown list.
 * - Choose a location by dropping a pin on a map.
 * - Submit the form to save the event.
 * 
 * Props:
 * @prop {Function} onEventCreated - Callback function triggered when a new event is successfully created.
 * @prop {User[]} organizers - Array of organizer objects available for selection.
 * @prop {Function} fetchCoordinates - Callback function to retrieve coordinates when a pin is dropped on the map.
 * 
 * Capabilities:
 * - Validates user inputs (e.g., required fields, numeric validation for volunteers needed).
 * - Fetches a list of organizers from the `/users` endpoint for selection.
 * - Allows users to select a location on a map.
 * - Submits event data via an API call and provides success or error feedback.
 */

import React, { useState,useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker'; // For dropdown picker
import { createEvent, fetchUsers} from '../services/api'; // Assuming you have this service for uploading images
import MapView, { Marker } from 'react-native-maps'; // For map and pin drop functionality
import DateTimePicker from '@react-native-community/datetimepicker'; // For date and time picker
import { EventDetails } from '../types/Event'; // Import the EventDetails interface

/**
 *  CreateEvents Component
 *  - This component provides a form for users to create new events.
 *  - Users can enter event details, select an organizer, choose a location on a map, and submit the form.
 */
export default function CreateEvents({ navigation }: StackScreenProps<any>) {
    const [eventName, setEventName] = useState<string>('');
    const [eventDescription, setEventDescription] = useState<string>('');
    const [eventDateTime, setEventDateTime] = useState<Date>(new Date()); // Change to Date object for DatePicker
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false); 
    const [eventImage, setEventImage] = useState<string>(''); // Stores image URL after upload
    const [imageInfo, setImageInfo] = useState<string>(''); // Stores image name and size for display
    const [organizerId, setOrganizerId] = useState<string>(''); 
    const [volunteersNeeded, setVolunteersNeeded] = useState<string>(''); 
    const [selectedLocation, setSelectedLocation] = useState<{latitude: number, longitude: number} | null>(null); // For pin drop location
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [users, setUsers] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const usersData = await fetchUsers(); // API call to fetch users
                setUsers(usersData);
            } catch (error) {
                console.error('Failed to load users:', error);
            }
        };
        loadUsers();
    }, []);

    const handleCreateEvent = async () => {
        if (!eventName || !eventDescription || !eventDateTime || !eventImage || !volunteersNeeded || !selectedLocation || !organizerId) {
            Alert.alert('Validation Error', 'Please fill in all fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const newEvent: EventDetails = {
                id: '', 
                name: eventName,
                description: eventDescription,
                dateTime: eventDateTime.toISOString(),
                imageUrl: eventImage,  // Use the image URL provided by the user
                organizerId: organizerId,
                volunteersNeeded: parseInt(volunteersNeeded),
                volunteersIds: [], 
                position: {
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                },
            };

            await createEvent(newEvent); // API call to create event
            Alert.alert('Success', 'Event created successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error('Error creating event:', error);
            Alert.alert('Error', 'Failed to create the event. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMapPress = (e: any) => {
        setSelectedLocation(e.nativeEvent.coordinate);
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false); // Hide the DatePicker after selection
        if (selectedDate) {
            setEventDateTime(selectedDate);
        }
    };

    /**
     * Render the CreateEvents component.
     * - Displays a form for users to create new events.
     * - Includes input fields for event details, a dropdown for organizers, and a map for location selection.
     */
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Add Event</Text>

            <View style={styles.pickerContainer}>
                <Text style={styles.label}>Organizer</Text>
                <Picker
                    selectedValue={organizerId}
                    onValueChange={(itemValue) => setOrganizerId(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select Organizer" value="" />
                    {users.map((user) => (
                        <Picker.Item key={user.id} label={user.name} value={user.id} />
                    ))}
                </Picker>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Event Name"
                value={eventName}
                onChangeText={setEventName}
            />

            <TextInput
                style={styles.input}
                placeholder="About"
                value={eventDescription}
                onChangeText={setEventDescription}
                maxLength={300}
                multiline
            />

            <TextInput
                style={styles.input}
                placeholder="Volunteers Needed"
                value={volunteersNeeded}
                onChangeText={setVolunteersNeeded}
                keyboardType="numeric"
            />

            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text>{eventDateTime.toLocaleString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={eventDateTime}
                    mode="datetime"
                    display="default"
                    onChange={handleDateChange}
                />
            )}

            {/* TextInput for Image URL */}
            <TextInput
                style={styles.input}
                placeholder="Image URL"
                value={eventImage}
                onChangeText={setEventImage}
            />

            {/* Optional: Display a preview of the image if a URL is entered */}
            {eventImage ? (
                <Image source={{ uri: eventImage }} style={styles.imagePreview} />
            ) : null}

            {/* Organizer Picker Dropdown */}

            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 51.0447, 
                    longitude: -114.0719,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}
            >
                {selectedLocation && (
                    <Marker coordinate={selectedLocation} />
                )}
            </MapView>

            <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleCreateEvent} disabled={isSubmitting}>
                    <Text style={styles.buttonText}>{isSubmitting ? 'Submitting...' : 'Save'}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={() => navigation.navigate('EventsMap',{refresh:true})} disabled={isSubmitting}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

/**
 * CreateEvents Styles
 * - Styles for the CreateEvents component.
 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#F9F9F9',
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        fontSize: 16,
        color: '#333',
    },
    imageUploadContainer: {
        marginVertical: 10,
        alignItems: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 100,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    imageInfo: {
        marginTop: 10,
        fontSize: 12,
        color: '#888',
    },
    map: {
        width: '100%',
        height: 100,
        marginVertical: 10,
        borderRadius: 10,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    button: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    submitButton: {
        backgroundColor: '#00A3FF',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    pickerContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    picker: {
        height: 50,
        borderRadius: 10,
    },
});