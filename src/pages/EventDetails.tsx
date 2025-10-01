// src/pages/EventDetails.tsx
import React, { useContext, useMemo, useState } from 'react';
import { Image, Linking, Share, StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import BigButton from '../components/BigButton';
import Spacer from '../components/Spacer';
import { AuthenticationContext } from '../context/AuthenticationContext';
import { USERS } from '../constants/mockData';
import { Event } from '../@types/Event';


type RouteParams = {
  event: Event;
  onUpdateEvent: (updated: Event) => void;
};

export default function EventDetails({ route, navigation }: StackScreenProps<any>) {
  const { event: initialEvent, onUpdateEvent } = route.params as RouteParams;
  const auth = useContext(AuthenticationContext);
  const currentUserId = auth?.value?.id;

  const [event, setEvent] = useState<Event>(initialEvent);

  const isFull = event.volunteersIds.length >= event.volunteersNeeded;
  const hasApplied = currentUserId ? event.volunteersIds.includes(currentUserId) : false;

  const organizer = useMemo(
    () => USERS.find(u => u.id === event.organizerId),
    [event.organizerId]
  );

  const statusText = useMemo(() => {
    if (hasApplied) return 'volunteered';
    if (isFull) return 'team is full';
    return `${event.volunteersIds.length}/${event.volunteersNeeded} volunteers`;
  }, [hasApplied, isFull, event.volunteersIds.length, event.volunteersNeeded]);

  const handleVolunteer = () => {
    if (!currentUserId) {
      Alert.alert('Not logged in', 'Please log in to volunteer.');
      return;
    }
    if (hasApplied || isFull) return;

    const updated: Event = {
      ...event,
      volunteersIds: [...event.volunteersIds, currentUserId],
    };
    setEvent(updated);
    onUpdateEvent(updated);
    Alert.alert('Thanks!', 'You have volunteered for this event.');
  };

  const handleCall = () => {
    if (!organizer?.mobile) return;
    Linking.openURL(`tel:${organizer.mobile}`);
  };

  const handleText = () => {
    if (!organizer?.mobile) return;
    Linking.openURL(`sms:${organizer.mobile}`);
  };

  const handleShare = () => {
    const when = new Date(event.dateTime).toLocaleString();
    Share.share({
      message: `Join me at "${event.name}" on ${when}!`,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{event.name}</Text>
      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={styles.image} />
      ) : null}
      <Text style={styles.description}>{event.description}</Text>

      <Spacer size={16} />
      <View style={[styles.statusBox, hasApplied ? styles.statusSuccess : isFull ? styles.statusFull : styles.statusOpen]}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>

      <Spacer size={24} />

      {/* Contact buttons only if user volunteered */}
      {hasApplied && organizer && (
        <View style={styles.row}>
          <BigButton color="#4CAF50" label="Call organizer" featherIconName="phone" onPress={handleCall} style={{ marginRight: 8 }} />
          <BigButton color="#2196F3" label="Text organizer" featherIconName="message-square" onPress={handleText} />
        </View>
      )}

      <Spacer size={12} />

      {/* Volunteer button only if not full and not applied */}
      {!isFull && !hasApplied && (
        <BigButton color="#FF8700" label="Volunteer" featherIconName="heart" onPress={handleVolunteer} />
      )}

      <Spacer size={12} />

      {/* Share button visible if event is not full OR user has applied */}
      {(!isFull || hasApplied) && (
        <BigButton color="#6C63FF" label="Share" featherIconName="share-2" onPress={handleShare} />
      )}

      <Spacer size={24} />
      <BigButton color="#4D6F80" label="Back to map" featherIconName="arrow-left" onPress={() => navigation.goBack()} />
      <Spacer size={24} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    marginBottom: 8,
    color: '#031A62',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: '#4D6F80',
  },
  statusBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFF',
    fontFamily: 'Nunito_700Bold',
  },
  statusOpen: { backgroundColor: '#00A3FF' },
  statusFull: { backgroundColor: '#8fa7b3' },
  statusSuccess: { backgroundColor: '#2ecc71' },
  row: {
    flexDirection: 'row',
  },
});
