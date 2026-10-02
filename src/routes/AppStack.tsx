import React, { useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const { Navigator, Screen } = createStackNavigator<RootStackParamList>();

import { RootStackParamList } from './types';
import EventDetails from '../pages/EventDetails';
import { EventsProvider } from '../context/EventsContext';

import Login from '../pages/Login';
import EventsMap from '../pages/EventsMap';
import { AuthenticationContext, AuthenticationContextObject } from '../context/AuthenticationContext';
import { User } from '../types/User';

export default function Routes() {
    const [authenticatedUser, setAuthenticatedUser] = useState<User>();

    const authenticationContextObj: AuthenticationContextObject = {
        value: authenticatedUser as User,
        setValue: setAuthenticatedUser,
    };

    return (
        <AuthenticationContext.Provider value={authenticationContextObj}>
            <EventsProvider>
            <NavigationContainer>
                <Navigator
                    screenOptions={{
                        headerShown: false,
                        cardStyle: { backgroundColor: '#F2F3F5' },
                    }}
                >
                    <Screen name="Login" component={Login} />

                    <Screen name="EventsMap" component={EventsMap} />
                    <Screen name="EventDetails" component={EventDetails} />
                </Navigator>
            </NavigationContainer>
            </EventsProvider>
        </AuthenticationContext.Provider>
    );
}
