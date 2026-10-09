import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View,Linking,Share } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';
import { Event } from '../types/event';
import { User } from '../types/User';
import * as api from '../services/api';
import BigButton from '../components/BigButton';

interface EventDetailsProps 
{
    eventDetails: Event;
}
const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    eventImage: {
        width: '100%',
        height: 240,
        resizeMode: 'cover',
    },
    mapStyle: {
        ...StyleSheet.absoluteFill,
    },

    logoutButton: {
        position: 'absolute',
        top: 70,
        right: 24,

        elevation: 3,
    },

    footer: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 40,

        backgroundColor: '#FFF',
        borderRadius: 16,
        height: 56,
        paddingLeft: 24,

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        elevation: 3,
    },

    footerText: {
        fontFamily: 'Nunito_700Bold',
        color: '#8fa7b3',
    },

    smallButton: {
        width: 56,
        height: 56,
        borderRadius: 16,

        justifyContent: 'center',
        alignItems: 'center',
    },
});



export default function EventDetails({navigation,route}: StackScreenProps<any>) 
{
    const getparamsevent = route.params as EventDetailsProps;
    const authenticationContext = useContext(AuthenticationContext);
    const [eventDetails, setEventDetails] = useState<Event>(getparamsevent.eventDetails);
    const [organizer, setOrganizerDetails] = useState<User>();
    const currentUser = authenticationContext?.value;
    const [volunteered, setVolunteered] = useState<Boolean>(Boolean(eventDetails.volunteersIds.includes(currentUser?.id as string)));
    const numberOfVolunteers = eventDetails.volunteersIds.length;
    const isteamfull = numberOfVolunteers >= eventDetails.volunteersNeeded;
    const canvolunteer = !volunteered && !isteamfull;
    const share = volunteered || !isteamfull;
    useEffect(() => {
        api.getuser(eventDetails.organizerId).then((response) => {
            setOrganizerDetails(response.data);
        }).catch((error) => {
            console.error('Error fetching organizer details:', error);
            setOrganizerDetails(undefined);
        });
    }, [eventDetails.organizerId]);
    const isorganizer = currentUser?.id === eventDetails.organizerId;
    const organizerName = organizer ? organizer.name.first + ' ' + organizer.name.last : null; //if no organizer go null
    const hasorganizer = Boolean(organizer);
    
    const openUrl = (url: string) => {
        Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
    }

    const shareEvent = async () => {
        try {
                await Share.share({title: 'Check out this event!', message: `Event: ${eventDetails.name}\nDescription: ${eventDetails.description}\nDate and Time: ${new Date(eventDetails.dateTime).toLocaleString()}\nOrganizer: ${organizerName || 'N/A'}`});
            }
        catch (error) 
            {
                console.error('Error sharing event:', error);
            }
        }

    const volunteer = () => {
        if (currentUser && !volunteered && !isteamfull) {
            const updatedEvent = {
                ...eventDetails,
                volunteersIds: [...eventDetails.volunteersIds, currentUser.id]
            };
            setEventDetails(updatedEvent);
            api.updateevent(eventDetails.id, updatedEvent).then((response) => {
                console.log('Successfully volunteered for the event:', response.data);
            }).catch((error) => {
                console.error('Error volunteering for the event:', error);
            });
            setVolunteered(true);
        }
    };

    const handlecall = () => {
        openUrl(`tel:${organizer?.mobile.replace(/[^0-9]/, '')}`);
    }
    const handletext = () => {
        openUrl(`sms:${organizer?.mobile.replace(/[^0-9]/, '')}`);
    }

    
    

    return(
        <View>
                <View>
                    <BigButton label="Back" onPress={() => navigation.goBack()} color="gray" featherIconName="arrow-left"/>
                    <Text>Event Details</Text>

                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {eventDetails.imageUrl? <Image source={{ uri: eventDetails.imageUrl }} style={styles.eventImage} /> : <Feather name="image" size={100} color="#ccc" />}
                    <View id="content">
                        <Text>{eventDetails.name}</Text>
                        <Text>{eventDetails.description}</Text>
                        <Text>{hasorganizer ? `Organizer: ${organizerName}` : 'Organizer details not available'}</Text>
                        <View>
                            <Text>Event Date and Time: {new Date(eventDetails.dateTime).toLocaleString()}</Text>
                            <View>
                                {isorganizer ? (
                                    <View>
                                        <Feather name="slash" size={24} color="#FF0000" />
                                        <Text>As the organizer, you cannot volunteer for your own event.</Text>
                                    </View>
                                ): isteamfull ? (
                                    <View>
                                        <Feather name="slash" size={24} color="#FF0000" />
                                        <Text>The volunteer team is full for this event.</Text>
                                    </View>
                                    
                                ) : volunteered ? (
                                    <View>
                                        <Feather name="check" size={24} color="#00FF00" />
                                        <Text>You are already volunteering for this event.</Text>
                                    </View>
                                ) : (
                                    <View>
                                        <Feather name="user-plus" size={24} color="#0000FF" />
                                        <Text>{numberOfVolunteers} of {eventDetails.volunteersNeeded}</Text>
                                        <Text>Volunteer needed</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        <View>
                            {canvolunteer && (
                                <BigButton label="Volunteer" onPress={() => {volunteer()}} color="orange" featherIconName="user-plus"/>
                            )}
                            {share && (
                                <BigButton label="Share" onPress={() => {shareEvent()}} color="blue" featherIconName="share-2"/>
                            )}
                            {volunteered && (
                                <>
                                    <BigButton label="Text Organizer" onPress={() => {handletext() }} color="green" featherIconName="mail"/>
                                    <BigButton label = "Call Organizer" onPress={() => {handlecall() }} color="green" featherIconName="phone"/>
                                </>
                            )}
                        </View>

                    </View>
                </ScrollView>
        </View>

    )

}