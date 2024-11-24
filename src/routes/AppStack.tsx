// Polyfill for ReadableStream
if (typeof global.ReadableStream === 'undefined') {
    global.ReadableStream = require('readable-stream').Readable;
}

// Gesture Handler Initialization
import 'react-native-gesture-handler';

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from '../pages/Login';
import EventsMap from '../pages/EventsMap';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { User } from '../types/User';

const { Navigator, Screen } = createStackNavigator();

export default function Routes() {
    // Initialize state for authenticated user with null representing unauthenticated
    const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);

    return (
        <AuthenticationContext.Provider
            value={{
                value: authenticatedUser, // Current user
                setValue: setAuthenticatedUser, // Function to update user
            }}
        >
            <NavigationContainer>
                <Navigator
                    screenOptions={{
                        headerShown: false,
                        cardStyle: { backgroundColor: '#F2F3F5' },
                    }}
                >
                    <Screen name="Login" component={Login} />
                    <Screen name="EventsMap" component={EventsMap} />
                </Navigator>
            </NavigationContainer>
        </AuthenticationContext.Provider>
    );
}
