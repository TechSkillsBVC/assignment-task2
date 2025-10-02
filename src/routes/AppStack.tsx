import React, { useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const { Navigator, Screen } = createStackNavigator();

import Login from '../pages/Login';
import EventsMap from '../pages/EventsMap';
import EventDetails from '../pages/EventDetails';
import { AuthenticationContext, AuthenticationContextObject } from '../context/AuthenticationContext';
import { User } from '../types/User';

export default function Routes() {

    // hard coding user from db so i dont have to login to view code
     const defaultUser: User = {
        id: "gpFfX6e",
        name: { first: "Luigi", last: "Carluccio" },
        email: "luigi@carluccio.it",
        mobile: "(171) 946-2538",
    };

    const [authenticatedUser, setAuthenticatedUser] = useState<User | undefined>(defaultUser);

    const authenticationContextObj: AuthenticationContextObject = {
        value: authenticatedUser as User,
        setValue: setAuthenticatedUser,
    };

    return (
        <AuthenticationContext.Provider value={authenticationContextObj}>
            <NavigationContainer>
                <Navigator
                    // changed inital route so i can view map right away
                    initialRouteName="EventsMap"  
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
        </AuthenticationContext.Provider>
    );
}
