import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import BigButton from '../components/BigButton';
import { createEvent } from '../services/api'; // You'll need to create this function in your api.ts file

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
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter event description"
                multiline
            />

            <Text style={styles.label}>Date</Text>
            <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Volunteers Needed</Text>
            <TextInput
                style={styles.input}
                value={volunteersNeeded}
                onChangeText={setVolunteersNeeded}
                placeholder="Enter number of volunteers"
                keyboardType="numeric"
            />

            <BigButton label="Create Event" color="#FF8700" onPress={handleCreateEvent} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 20,
        borderRadius: 6,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
});