import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import BigButton from '../components/BigButton';
import { createEvent } from '../services/api';

type CreateEventProps = {
    navigation: StackNavigationProp<any>;
};

export default function CreateEvent({ navigation }: CreateEventProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [volunteersNeeded, setVolunteersNeeded] = useState('');

    const handleCreateEvent = async () => {
        try {
            await createEvent({ name, description, date, volunteersNeeded: parseInt(volunteersNeeded) });
            navigation.navigate('EventsMap');
        } catch (error) {
            console.error('Error creating event:', error);
            // Handle error (show an alert, etc.)
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Event Name</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter event name"
                placeholderTextColor="#888"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter event description"
                placeholderTextColor="#888"
                multiline
            />

            <Text style={styles.label}>Date</Text>
            <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#888"
            />

            <Text style={styles.label}>Volunteers Needed</Text>
            <TextInput
                style={styles.input}
                value={volunteersNeeded}
                onChangeText={setVolunteersNeeded}
                placeholder="Enter number of volunteers"
                placeholderTextColor="#888"
                keyboardType="numeric"
            />

            <BigButton label="Create Event" color="#1E90FF" onPress={handleCreateEvent} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa',  // Light background
    },
    label: {
        fontSize: 18,  // Increased font size
        fontWeight: '600',  // Slightly lighter than bold
        color: '#333',  // Darker text color
        marginBottom: 8,
    },
    input: {
        borderWidth: 2,  // Thicker border
        borderColor: '#1E90FF',  // Blue border color for more visual appeal
        padding: 12,  // Increased padding for inputs
        marginBottom: 25,
        borderRadius: 10,  // Increased border radius for rounded corners
        backgroundColor: '#fff',  // White input background
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        height: 120,  // Slightly increased height for text area
        textAlignVertical: 'top',
    },
});
