import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Linking, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthenticationContext } from '../context/AuthenticationContext';
import BigButton from '../components/BigButton';
import { getEvent, applyForEvent } from '../services/api'; 
import { formatAMPM } from '../utils';
import { Share } from 'react-native';
import { colors } from '../constants/colors';

// Define route and navigation types for EventDetails
type EventDetailsRouteProp = RouteProp<{ EventDetails: { eventId: string } }, 'EventDetails'>;
type EventDetailsNavigationProp = StackNavigationProp<{ EventDetails: undefined }, 'EventDetails'>;

type Props = {
  route: EventDetailsRouteProp;
  navigation: EventDetailsNavigationProp;
};

export default function EventDetails({ route, navigation }: Props) {
  const { eventId } = route.params;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthenticationContext);
  const currentUser = authContext?.value;

  const PAST_EVENT_ID = 'e3c95682-870f-4080-a0d7-ae8e23e2534f'; // Placeholder for a past event

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await getEvent(eventId);
      setEvent(response.data);
    } catch (err) {
      setError('Failed to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <BigButton label="Retry" color={colors.primary} onPress={fetchEventDetails} />
      </View>
    );
  }

  if (!event) return null;

  const isPastEvent = eventId === PAST_EVENT_ID;
  const isVolunteered = currentUser && event.volunteersIds.includes(currentUser.id);
  const isFull = event.volunteersIds.length >= event.volunteersNeeded;

  const getStatusText = () => {
    if (isPastEvent) return 'Volunteered';
    if (isVolunteered) return 'You have already volunteered';
    if (isFull) return 'Team is full';
    return `${event.volunteersIds.length}/${event.volunteersNeeded} volunteers`;
  };

  const handleVolunteer = async () => {
    if (!currentUser || !currentUser.id) {
      Alert.alert('Error', 'You must be logged in to volunteer.');
      return;
    }
    try {
      await applyForEvent(eventId, currentUser.id);
      fetchEventDetails();
      Alert.alert('Success', 'You have successfully volunteered for this event!');
    } catch (err) {
      Alert.alert('Error', 'Failed to volunteer for the event. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this event: ${event.name}\n${event.description}\nDate: ${formatAMPM(new Date(event.dateTime))}`,
        title: event.name,
      });
      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while sharing');
    }
  };

  const handleContact = (type: 'call' | 'text') => {
    const phoneNumber = event.organizerPhone || '1234567890';
    const phoneUrl = type === 'call' ? `tel:${phoneNumber}` : `sms:${phoneNumber}`;

    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Error', `Your device doesn't support ${type === 'call' ? 'calling' : 'texting'}.`);
        } else {
          return Linking.openURL(phoneUrl);
        }
      })
      .catch((err) => Alert.alert('Error', `Failed to ${type} the organizer. Please try again.`));
  };

  const handleShowRoute = () => {
    const { latitude, longitude } = event.position;
    const label = encodeURI(event.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });

    if (url) {
      Linking.canOpenURL(url)
        .then((supported) => {
          if (!supported) {
            Alert.alert('Error', "Can't open the map on your device");
          } else {
            return Linking.openURL(url);
          }
        })
        .catch((err) => Alert.alert('Error', 'Failed to open the map. Please try again.'));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <BigButton
          label=""
          color="transparent"
          featherIconName="arrow-left"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
      <Image source={{ uri: event.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{event.name}</Text>
        <Text style={styles.date}>{formatAMPM(new Date(event.dateTime))}</Text>
        <Text style={styles.description}>{event.description}</Text>
        
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        {(isVolunteered || isPastEvent) && (
          <View style={styles.buttonRow}>
            <BigButton 
              label="Call"
              color={colors.secondary}
              onPress={() => handleContact('call')}
              featherIconName="phone"
            />
            <BigButton 
              label="Text"
              color={colors.secondary}
              onPress={() => handleContact('text')}
              featherIconName="message-square"
            />
          </View>
        )}

        {!isVolunteered && !isFull && !isPastEvent && (
          <BigButton 
            label="Volunteer"
            color={colors.primary}
            onPress={handleVolunteer}
            featherIconName="user-plus"
          />
        )}

        {(!isFull || isVolunteered || isPastEvent) && (
          <BigButton 
            label="Share"
            color={colors.secondary}
            onPress={handleShare}
            featherIconName="share-2"
          />
        )}

        <BigButton 
          label="Show route on map"
          color={colors.secondary}
          onPress={handleShowRoute}
          featherIconName="map"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',  // Light gray background for a cleaner look
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,  // Round button for a modern feel
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Dark background with transparency
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,  // Add rounded corners to the image
  },
  content: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,  // Rounded corner for the content section
    borderTopRightRadius: 20,
    marginTop: -30,  // Overlapping with the image for a dynamic look
  },
  title: {
    fontSize: 26,  // Slightly larger font size
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    color: '#888',  // Lighter gray for the date
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  statusBox: {
    padding: 15,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    color: colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
  },
});
