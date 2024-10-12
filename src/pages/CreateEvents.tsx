import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker'; // For selecting images from the gallery
import { RectButton } from 'react-native-gesture-handler';
import { StackScreenProps } from '@react-navigation/stack';
import { createEvent} from '../services/api'; // Assuming you have this service for uploading images
import { uploadImage } from '../services/imageApi';
import MapView, { Marker } from 'react-native-maps'; // For map and pin drop functionality
import DateTimePicker from '@react-native-community/datetimepicker'; // For date and time picker

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

    const handleCreateEvent = async () => {
        if (!eventName || !eventDescription || !eventDateTime || !eventImage || !volunteersNeeded || !selectedLocation || !organizerId) {
            Alert.alert('Validation Error', 'Please fill in all fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const newEvent = {
                id: '', 
                name: eventName,
                description: eventDescription,
                dateTime: eventDateTime.toISOString(),
                imageUrl: eventImage,
                organizerId: organizerId,
                volunteersNeeded: parseInt(volunteersNeeded),
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

    const handleReturnToMap = () => {
        navigation.goBack();
    };
    const handleImageUpload = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });

        if (result.didCancel) return;
        if (result.assets && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;

            // Convert the image URI to Base64 format
            const base64 = await getBase64FromUri(imageUri);
            try {
                const response = await uploadImage(base64);
                setEventImage(response.data.data.display_url); // Update with the image URL returned by imgbb
            } catch (error) {
                Alert.alert('Error', 'Failed to upload the image. Please try again.');
                console.error('Image upload error:', error);
            }
        }
    };

    const getBase64FromUri = async (uri: string): Promise<string> => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = () => {
                reject(new Error('Failed to convert image to Base64'));
            };
            reader.readAsDataURL(blob);
        });
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

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Add Event</Text>

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
            <TouchableOpacity style={styles.imageUploadContainer} onPress={handleImageUpload}>
                <View style={styles.imagePreview}>
                    {eventImage ? (
                        <Image source={{ uri: eventImage }} style={styles.image} />
                    ) : (
                        <Text>Upload Image</Text>
                    )}
                </View>
                {imageInfo && (
                    <Text style={styles.imageInfo}>{imageInfo}</Text>
                )}
            </TouchableOpacity>

            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 51.0447, // Default to Calgary or any other region
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
                <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleReturnToMap} disabled={isSubmitting}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

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
        height: 200,
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
        height: 200,
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
});
