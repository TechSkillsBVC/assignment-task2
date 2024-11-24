import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import BigButton from '../components/BigButton';
import { createEvent } from '../services/api';

type CreateEventProps = {
    navigation: StackNavigationProp<any>;
};

const CreateEvent: React.FC<CreateEventProps> = ({ navigation }) => {
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
        }
    };

    return (
        <ScrollView style={styles.container}>
            <InputField label="Event Name" value={name} onChangeText={setName} placeholder="Enter event name" />
            <InputField label="Description" value={description} onChangeText={setDescription} placeholder="Enter event description" multiline />
            <InputField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
            <InputField label="Volunteers Needed" value={volunteersNeeded} onChangeText={setVolunteersNeeded} placeholder="Enter number of volunteers" keyboardType="numeric" />
            <BigButton label="Create Event" color="#FF8700" onPress={handleCreateEvent} />
        </ScrollView>
    );
};

type InputFieldProps = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
};

const InputField: React.FC<InputFieldProps> = ({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }) => (
    <>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={[styles.input, multiline && styles.textArea]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            multiline={multiline}
            keyboardType={keyboardType}
        />
    </>
);

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

export default CreateEvent;

  