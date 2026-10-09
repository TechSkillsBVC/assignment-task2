import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../pages/Login';
import EventsMap from '../pages/EventsMap';
import EventDetails from '../pages/EventDetails';
import { AuthenticationContext, AuthenticationContextObject } from '../context/AuthenticationContext';
import { EventsContext } from '../context/EventsContext';
import { INITIAL_EVENTS } from '../data/events';
import { EventDetail } from '../types/Event';
import { User } from '../types/User';

const { Navigator, Screen } = createStackNavigator();

export default function Routes() {
    const [authenticatedUser, setAuthenticatedUser] = useState<User>();
    const [events, setEvents] = useState<EventDetail[]>(INITIAL_EVENTS);

    const authenticationContextObj: AuthenticationContextObject = {
        value: authenticatedUser as User,
        setValue: setAuthenticatedUser,
    };

    return (
        <AuthenticationContext.Provider value={authenticationContextObj}>
            <EventsContext.Provider value={{ events, setEvents }}>
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
            </EventsContext.Provider>
        </AuthenticationContext.Provider>
    );
}