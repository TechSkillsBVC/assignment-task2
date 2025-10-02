import React, { useEffect, useState, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Share, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// nav helpers
import { useNavigation, useRoute } from '@react-navigation/native';
// axios 
import api from '../services/api';
// auth
import { AuthenticationContext } from '../context/AuthenticationContext';
// header comp
import Header from '../components/Header';


// event + user types
type EventItem = {
  id: string;
  name: string;
  description: string;
  dateTime: string;
  imageUrl?: string;
  organizerId: string;
  volunteersNeeded: number;
  volunteersIds: string[];
  position: { latitude: number; longitude: number };
};
type UserItem = { id: string; mobile?: string; name?: any };

export default function EventDetails() {
  // nav + route first (hooks must be at top)
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // event id passed from map
  const { eventId } = route.params || {}; 

  // read logged in user
  const auth = useContext(AuthenticationContext);
  const currentUserId: string | undefined = auth?.value?.id;

  // even + organizer + loading + errors
  const [event, setEvent] = useState<EventItem | null>(null);
  const [organizer, setOrganizer] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const userJoined = useMemo(
    () => !!(currentUserId && event && event.volunteersIds?.includes(currentUserId)),
    [event, currentUserId]
  );
  const isFull = useMemo(
    () => !!(event && event.volunteersIds?.length >= event.volunteersNeeded),
    [event]
  );

  // load data once id is recieved
  useEffect(() => {
    if (!eventId) {
      setErr('no eventId was provided');
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        // fetch event
        const eRes = await api.get<EventItem>(`/events/${eventId}`);
        const e = eRes.data;
        setEvent(e);

        // fetch organizer (for call/text)
        try {
          const uRes = await api.get<UserItem[]>(`/users?id=${e.organizerId}`);
          setOrganizer(uRes.data?.[0] ?? null);
        } catch {
          setOrganizer(null);
        }
      } catch (e: any) {
        setErr('could not loadevent');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

 
  const handleVolunteer = async () => {
    if (!event) return;
    if (!currentUserId) {
      Alert.alert('login needed', 'please login to volunteer');
      return;
    }
    // if already joined do nothing 
    if (event.volunteersIds.includes(currentUserId)) {
      Alert.alert('already joined', 'you are already on this team');
      return;
    }
    try {
      const updated = { ...event, volunteersIds: [...event.volunteersIds, currentUserId] };
      await api.patch(`/events/${event.id}`, updated);
      setEvent(updated);
      Alert.alert('volunteer', 'you joined the team!');
    } catch {
      Alert.alert('error', 'could not update event');
    }
  };

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({ message: `${event.name} — ${new Date(event.dateTime).toLocaleString()}` });
    } catch {
      Alert.alert('share failed');
    }
  };
 
  // opens to call or text organizer
  const handleCall = () => { if (organizer?.mobile) Linking.openURL(`tel:${organizer.mobile}`); };
  const handleText = () => { if (organizer?.mobile) Linking.openURL(`sms:${organizer.mobile}`); };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={() => navigation.goBack()} />
        <View style={styles.center}><Text>loading event…</Text></View>
      </SafeAreaView>
    );
  }

  if (err || !event) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={{ marginTop: 8 }}>event not found</Text>
          {err ? <Text style={{ marginTop: 6, color: '#ef4444' }}>{err}</Text> : null}
        </View>
      </SafeAreaView>
    );
  }

 // user status title
  const statusTitle = userJoined
    ? 'volunteered'
    : isFull
    ? 'team is full'
    : `${event.volunteersIds.length} of ${event.volunteersNeeded}`;

  // show volenteer, shar and contact info
  const showVolunteer = !isFull && !userJoined;
  const showShare = !isFull || userJoined;
  const showContact = userJoined && !!organizer?.mobile;

  return (
    <SafeAreaView style={styles.safe}>
      {/* header with back arrow nav */}
      <Header onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* main card*/}
        <View style={styles.card}>

          {/* img banner*/}
          {event.imageUrl ? (
            <Image
              source={{ uri: event.imageUrl }}
              style={styles.banner}
            />
          ) : null}

          {/* title + info */}
          <Text style={styles.title}>{event.name}</Text>
          <Text style={styles.dim}>{new Date(event.dateTime).toLocaleString()}</Text>

          {/* thin divider to separate header from body */}
          <View style={styles.hr} />

          {/* description text */}
          <Text style={[styles.body]}>{event.description}</Text>

          {/* status box*/}
          <View
            style={[
              styles.statusBox,
              isFull ? styles.statusFull : userJoined ? styles.statusJoined : styles.statusOpen,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isFull ? styles.fullText : userJoined ? styles.joinedText : styles.openText,
              ]}
            >
              {statusTitle}
            </Text>
            <Text style={styles.statusSub}>
              {userJoined ? 'you are signed up' : isFull ? 'no spots left' : 'volunteers joined'}
            </Text>
          </View>

          {/* action buttons*/}
          <View style={styles.btnRow}>
            {showShare && (
              <Pressable onPress={handleShare} style={[styles.btn, styles.btnShare]} accessibilityRole="button">
                <Text style={styles.btnText}>Share</Text>
              </Pressable>
            )}
            {showVolunteer && (
              <Pressable onPress={handleVolunteer} style={[styles.btn, styles.btnPrimary]} accessibilityRole="button">
                <Text style={styles.btnText}>Volunteer</Text>
              </Pressable>
            )}
          </View>

          {/* contact buttons only when joined */}
          {showContact && (
            <View style={styles.btnRow}>
              <Pressable onPress={handleCall} style={[styles.btn, styles.btnGrey]} accessibilityRole="button">
                <Text style={styles.btnText}>Call</Text>
              </Pressable>
              <Pressable onPress={handleText} style={[styles.btn, styles.btnGrey]} accessibilityRole="button">
                <Text style={styles.btnText}>Text</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  /* screen background */
  safe: { flex: 1, backgroundColor: '#f1f5f9' },

  /* centered on device */
  scroll: { padding: 16, alignItems: 'center' },

  /* wide, centered card like the mock */
  card: {
    width: '100%',               
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },

  /* banner image */
  banner: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },


  /* title/date/description text */
  title: { fontSize: 30, fontWeight: '800', color: '#111827' },
  dim: { color: '#6b7280', marginTop: 4 },
  body: { color: '#374151', lineHeight: 20, marginTop: 8 },

  /* divider line */
  hr: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
    width: '100%',
  },

  /* status box centered + styles for all states */
  statusBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignSelf: 'center',
    width: '100%',
  },
  statusOpen: { borderColor: '#f59e0b', backgroundColor: '#fff8ed' },
  statusJoined: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  statusFull: { borderColor: '#94a3b8', backgroundColor: '#f8fafc' },

  statusText: { fontWeight: '800', fontSize: 20 },
  openText: { color: '#f59e0b' },
  joinedText: { color: '#16a34a' },
  fullText: { color: '#64748b' },
  statusSub: { color: '#64748b', marginTop: 2 },

  /* actions*/
  btnRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  btn: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, minWidth: 120, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800' },
  btnShare: { backgroundColor: '#6fb7cf' },
  btnPrimary: { backgroundColor: '#f59e0b' },
  btnGrey: { backgroundColor: '#94a3b8' },

  center: { alignItems: 'center', justifyContent: 'center', padding: 16 },
});
