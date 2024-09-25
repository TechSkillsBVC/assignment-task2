import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/Events'; // Adjust the import path as needed

const Stack = createStackNavigator<RootStackParamList>();

import Login from '../pages/Login';
import EventsMap from '../pages/EventsMap';
import EventDetails from '../pages/EventDetails';
import { AuthenticationContext, AuthenticationContextObject } from '../context/AuthenticationContext';
import { User } from '../types/User';

export default function Routes() {
    const [authenticatedUser, setAuthenticatedUser] = useState<User | undefined>();

    const authenticationContextObj: AuthenticationContextObject = {
        value: authenticatedUser as User,
        setValue: setAuthenticatedUser,
    };

    return (
        <AuthenticationContext.Provider value={authenticationContextObj}>
            <NavigationContainer>
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        cardStyle: { backgroundColor: '#F2F3F5' },
                    }}
                >
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen name="EventsMap" component={EventsMap} />
                    <Stack.Screen name="EventDetails" component={EventDetails} />
                </Stack.Navigator>
            </NavigationContainer>
        </AuthenticationContext.Provider>
    );
}