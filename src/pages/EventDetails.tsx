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

type EventDetailsRouteProp = RouteProp<{ EventDetails: { eventId: string } }, 'EventDetails'>;

type Props = {
  route: EventDetailsRouteProp;
};

export default function EventDetails({ route }: Props) {
  const { eventId } = route.params;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthenticationContext);
  const currentUser = authContext?.value;
  const navigation = useNavigation<StackNavigationProp<any>>();

  const PAST_EVENT_ID = 'e3c95682-870f-4080-a0d7-ae8e23e2534f';

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
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <BigButton label="Retry" color={colors.secondary} onPress={fetchEventDetails} />
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
          iconColor={colors.primary}
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
    backgroundColor: colors.white,
  },
  header: {
    position: 'absolute',
    top: 44,
    left: 24,
    zIndex: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 24,
    lineHeight: 24,
  },
  statusBox: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.secondary,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
});
