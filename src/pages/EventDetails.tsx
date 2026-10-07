import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Share, TouchableOpacity, Linking } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { getEventById, getUserById, volunteerForEvent } from '../services/api';
import { AuthenticationContext } from '../context/AuthenticationContext';
import customMapStyle from '../../map-style.json';

function ActionButton({ text, icon, color, onPress, style }: any) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: color }, style]}
      onPress={onPress}
    >
      <Feather name={icon} size={24} color="#FFFFFF" />
      <Text style={styles.actionText}>{text}</Text>
    </TouchableOpacity>
  );
}

export default function EventDetails(props: StackScreenProps<any>) {
  const { route, navigation } = props;
  const { eventId } = route.params as { eventId: string };

  const authenticationContext = useContext(AuthenticationContext);
  const currentUserId = authenticationContext?.value.id;

  const [event, setEvent] = useState<any>(null);
  const [organizer, setOrganizer] = useState<any>(null);

  useEffect(() => {
    getEventById(eventId).then((response) => {
      setEvent(response.data);

      getUserById(response.data.organizerId).then((userResponse) => {
        setOrganizer(userResponse.data);
      });
    });
  }, [eventId]);

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading event...</Text>
      </View>
    );
  }

  const hasVolunteered = event.volunteersIds.includes(currentUserId);
  const isFull = event.volunteersIds.length >= event.volunteersNeeded;

  const eventDate = new Date(event.dateTime);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const month = months[eventDate.getMonth()];
  const day = eventDate.getDate();
  const year = eventDate.getFullYear();

  let hour = eventDate.getHours();
  const minutes = eventDate.getMinutes().toString().padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';

  hour = hour % 12;
  hour = hour ? hour : 12;

  const formattedDate = `${month} ${day}, ${year}`;
  const formattedTime = `${hour}:${minutes} ${ampm}`;

  const handleShare = async () => {
    await Share.share({ message: `${event.name}\n${event.description}` });
  };

  const handleVolunteer = async () => {
    if (!currentUserId) return;

    const updatedVolunteers = [...event.volunteersIds, currentUserId];
    const response = await volunteerForEvent(event.id, updatedVolunteers);

    setEvent(response.data);
  };

  const handleCall = () => {
    if (organizer?.mobile) {
      Linking.openURL(`tel:${organizer.mobile}`);
    }
  };

  const handleText = () => {
    if (organizer?.mobile) {
      Linking.openURL(`sms:${organizer.mobile}`);
    }
  };

  const handleDirections = () => {
    if (event.position) {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${event.position.latitude},${event.position.longitude}`);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#00A3FF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Event</Text>

        <View style={styles.headerSpacer} />
      </View>

      {event.imageUrl && (
        <Image source={{ uri: event.imageUrl }} style={styles.image} />
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{event.name}</Text>

        <Text style={styles.organizer}>
          organized by {organizer?.name.first} {organizer?.name.last}
        </Text>

        <Text style={styles.description}>{event.description}</Text>

        <View style={styles.infoRow}>
          <View style={styles.dateCard}>
            <Feather name="calendar" size={48} color="#00A3FF" />

            <Text style={styles.dateText}>{formattedDate}</Text>
            <Text style={styles.dateText}>{formattedTime}</Text>
          </View>

          <View style={[
            styles.statusCard,
            hasVolunteered ? styles.statusCardBlue : isFull ? styles.statusCardFull : styles.statusCardOrange
          ]}>
            {hasVolunteered ? (
              <>
                <Feather name="check" size={48} color="#00A3FF" />
                <Text style={[styles.statusText, styles.blueText]}>Volunteered</Text>
              </>
            ) : isFull ? (
              <>
                <Feather name="slash" size={48} color="#8FA7B2" />
                <Text style={[styles.statusText, styles.fullText]}>Team is full</Text>
              </>
            ) : (
              <>
                <Text style={styles.statusNumber}>{event.volunteersIds.length} of {event.volunteersNeeded}</Text>
                <Text style={[styles.statusText, styles.orangeText]}>Volunteer(s){'\n'}needed</Text>
              </>
            )}
          </View>
        </View>

        {hasVolunteered ? (
          <View style={styles.actionRow}>
            <ActionButton text="Share" icon="share-2" color="#00A3FF" onPress={handleShare} />
            <ActionButton text="Call" icon="phone" color="#00A3FF" onPress={handleCall} style={styles.buttonGap} />
            <ActionButton text="Text" icon="message-circle" color="#00A3FF" onPress={handleText} style={styles.buttonGap} />
          </View>
        ) : !isFull ? (
          <View style={styles.actionRow}>
            <ActionButton text="Share" icon="share-2" color="#00A3FF" onPress={handleShare} />
            <ActionButton text="Volunteer" icon="plus" color="#FF8700" onPress={handleVolunteer} style={styles.buttonGap} />
          </View>
        ) : null}

        <View style={styles.divider} />

        {event.position && (
          <>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                customMapStyle={customMapStyle}
                initialRegion={{
                  latitude: event.position.latitude,
                  longitude: event.position.longitude,
                  latitudeDelta: 0.008,
                  longitudeDelta: 0.008,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                <Marker coordinate={{
                  latitude: event.position.latitude,
                  longitude: event.position.longitude,
                }} />
              </MapView>
            </View>

            <TouchableOpacity style={styles.directionsButton} onPress={handleDirections}>
              <Feather name="map-pin" size={24} color="#FFFFFF" />
              <Text style={styles.directionsText}>Get Directions to Event</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF2F5',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    height: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },

  headerTitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: '#8FA7B2',
  },

  headerSpacer: {
    width: 24,
  },

  image: {
    width: '100%',
    height: 210,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },

  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 24,
    lineHeight: 30,
    color: '#4D6F80',
    marginBottom: 2,
  },

  organizer: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#8FA7B2',
    marginBottom: 16,
  },

  description: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: '#5C8599',
  },

  infoRow: {
    flexDirection: 'row',
    marginTop: 24,
  },

  dateCard: {
    flex: 1,
    height: 128,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#00A3FF',
    borderRadius: 8,
    backgroundColor: '#E5F6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusCard: {
    flex: 1,
    height: 128,
    marginLeft: 4,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusCardBlue: {
    borderColor: '#00A3FF',
    backgroundColor: '#E5F6FF',
  },

  statusCardOrange: {
    borderColor: '#FF8700',
    backgroundColor: '#F2E6D9',
  },

  statusCardFull: {
    borderColor: '#8FA7B2',
    backgroundColor: '#DDE3F0',
  },

  dateText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    lineHeight: 19,
    color: '#00A3FF',
    textAlign: 'center',
  },

  statusNumber: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 32,
    lineHeight: 36,
    color: '#FF8700',
    textAlign: 'center',
  },

  statusText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },

  blueText: {
    color: '#00A3FF',
  },

  orangeText: {
    color: '#FF8700',
  },

  fullText: {
    color: '#8FA7B2',
  },

  actionRow: {
    flexDirection: 'row',
    marginTop: 24,
  },

  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },


  buttonGap: {
    marginLeft: 8,
  },

  actionText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    lineHeight: 25,
    color: '#FFFFFF',
    marginLeft: 8,
  },

  divider: {
    height: 1,
    backgroundColor: '#DDE3F0',
    marginTop: 24,
    marginBottom: 24,
  },

  mapContainer: {
    width: '100%',
    height: 328,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#DDE3F0',
  },

  map: {
    width: '100%',
    height: '100%',
  },

  directionsButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#4D6F80',
    borderRadius: 12,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  directionsText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});