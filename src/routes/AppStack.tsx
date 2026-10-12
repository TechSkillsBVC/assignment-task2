import React, { useState } from 'react';
import { Platform } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppStackParamList } from '../types/Navigation';
import * as Colors from '../constants/Colors';

const { Navigator, Screen } = createStackNavigator<AppStackParamList>();

import Login from '../pages/Login';
import EventsMap from '../pages/EventsMap';
import EventDetails from '../pages/EventDetails';
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
            <NavigationContainer>
                <Navigator
                    screenOptions={{
                        headerShown: false,
                        cardStyle: { backgroundColor: Colors.CARD_BACKGROUND },
                    }}
                >
                    <Screen name="Login" component={Login} />

                    <Screen name="EventsMap" component={EventsMap} />

                    <Screen
                        name="EventDetails"
                        component={EventDetails}
                        options={{
                            headerShown: true,
                            title: 'Event',
                            headerTitleAlign: 'center',
                            headerTintColor: Colors.CYAN,
                            headerBackTitleVisible: false,
                            headerBackImage: ({ tintColor }) => (
                                <Feather name="arrow-left" size={24} color={tintColor} />
                            ),
                            headerLeftContainerStyle: { paddingLeft: Platform.select({ ios: 28, default: 17 }) },
                            headerStyle: {
                                backgroundColor: Colors.HEADER,
                                elevation: 0,
                                shadowOpacity: 0,
                                borderBottomWidth: 1,
                                borderBottomColor: Colors.HEADER_BORDER,
                            },
                            headerTitleStyle: {
                                fontFamily: 'Nunito_600SemiBold',
                                fontSize: 15,
                                color: Colors.GREY,
                            },
                        }}
                    />
                </Navigator>
            </NavigationContainer>
        </AuthenticationContext.Provider>
    );
}
