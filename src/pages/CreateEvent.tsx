import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import 'react-native-get-random-values';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';
import React, { useContext, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Region } from 'react-native-maps';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import * as api from '../services/api';
import { getFromCache, setInCache } from '../services/caching';
import { uploadImage } from '../services/imageApi';
import { Event } from '../types/Event';
import { formatBytes } from '../utils';

interface UploadedImage {
    uri: string;
    url: string;
    name: string;
    size: number;
}

type PickerMode = 'date' | 'time' | undefined;

export default function CreateEvent({ navigation }: StackScreenProps<any>) {
    const authenticationContext = useContext(AuthenticationContext);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [volunteersNeeded, setVolunteersNeeded] = useState('');
    const [dateTime, setDateTime] = useState<Date>();
    const [pickerMode, setPickerMode] = useState<PickerMode>();
    const [uploadedImage, setUploadedImage] = useState<UploadedImage>();
    const [createdEvent, setCreatedEvent] = useState<Event>();
    const [uploadingImage, setUploadingImage] = useState(false);
    const [savingEvent, setSavingEvent] = useState(false);
    const [selectingLocation, setSelectingLocation] = useState(false);
    const [location, setLocation] = useState<Region>(MapSettings.DEFAULT_REGION);

    const formIsValid =
        name.trim().length > 0 &&
        description.trim().length > 0 &&
        description.length <= 300 &&
        /^\d+$/.test(volunteersNeeded) &&
        Number(volunteersNeeded) > 0 &&
        !!dateTime &&
        dateTime.getTime() > Date.now() &&
        !!uploadedImage &&
        !uploadingImage;

    const closeScreen = () => {
        if (selectingLocation) {
            setSelectingLocation(false);
        } else {
            navigation.goBack();
        }
    };

    const chooseImage = () => {
        Alert.alert('Add a picture', 'Choose where to get the event picture from.', [
            { text: 'Take photo', onPress: () => void pickImage('camera') },
            { text: 'Choose from library', onPress: () => void pickImage('library') },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const pickImage = async (source: 'camera' | 'library') => {
        try {
            let permission = source === 'camera'
                ? await ImagePicker.getCameraPermissionsAsync()
                : await ImagePicker.getMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                permission = source === 'camera'
                    ? await ImagePicker.requestCameraPermissionsAsync()
                    : await ImagePicker.requestMediaLibraryPermissionsAsync();
            }
            if (!permission.granted) {
                Alert.alert(
                    'Permission required',
                    source === 'camera'
                        ? 'Allow camera access in your device settings to take an event picture.'
                        : 'Allow photo library access in your device settings to choose an event picture.'
                );
                return;
            }

            const result = source === 'camera'
                ? await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.8,
                    base64: true,
                })
                : await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.8,
                    base64: true,
                });

            const asset = result.assets?.[0];
            if (result.canceled || !asset) return;
            if (!asset.base64) {
                Alert.alert('Unable to upload image', 'The selected image could not be read. Please choose another.');
                return;
            }

            const imageSize = asset.fileSize ?? Math.ceil((asset.base64.length * 3) / 4);
            const imageName = asset.fileName || asset.uri.split('/').pop() || 'event-image.jpg';
            setUploadingImage(true);
            const imageUrl = await uploadImage(asset.base64);
            setUploadedImage({ uri: asset.uri, url: imageUrl, name: imageName, size: imageSize });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Please try again.';
            Alert.alert('Unable to add picture', message);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDateConfirm = (selectedDate: Date) => {
        const nextDate = new Date(dateTime ?? selectedDate);
        nextDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        setDateTime(nextDate);
        setPickerMode('time');
    };

    const handleTimeConfirm = (selectedTime: Date) => {
        const nextDate = new Date(dateTime ?? selectedTime);
        nextDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
        setDateTime(nextDate);
        setPickerMode(undefined);
    };

    const updateCachedEvent = async (event: Event) => {
        try {
            let cachedEvents: Event[] = [];
            try {
                cachedEvents = await getFromCache<Event[]>('events');
            } catch {
                cachedEvents = [];
            }
            await setInCache('events', [
                ...cachedEvents.filter((cachedEvent) => cachedEvent.id !== event.id),
                event,
            ]);
        } catch (cacheError) {
            console.warn('Event was saved, but the offline event cache could not be updated.', cacheError);
        }
    };

    const handleSaveDetails = async () => {
        Keyboard.dismiss();
        const organizerId = authenticationContext?.value?.id;
        if (!formIsValid || !dateTime || !uploadedImage || !organizerId || savingEvent) {
            if (!organizerId) {
                Alert.alert('Unable to save event', 'Your account details could not be loaded. Please sign in again.');
            }
            return;
        }

        setSavingEvent(true);
        try {
            const accessToken = await getFromCache<string>('accessToken');
            const event: Event = {
                id: createdEvent?.id ?? uuidv4(),
                dateTime: dateTime.toISOString(),
                description: description.trim(),
                imageUrl: uploadedImage.url,
                name: name.trim(),
                organizerId,
                position: createdEvent?.position ?? {
                    latitude: location.latitude,
                    longitude: location.longitude,
                },
                volunteersNeeded: Number(volunteersNeeded),
                volunteersIds: createdEvent?.volunteersIds ?? [],
            };
            const response = createdEvent
                ? await api.updateEvent(event, accessToken)
                : await api.createEvent(event, accessToken);
            setCreatedEvent(response.data);
            await updateCachedEvent(response.data);
            setSelectingLocation(true);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Please check your connection and try again.';
            Alert.alert('Unable to save event', message);
        } finally {
            setSavingEvent(false);
        }
    };

    const handleCreateEvent = async () => {
        if (!createdEvent || savingEvent) {
            Alert.alert('Unable to continue', 'Save the event details before choosing its location.');
            return;
        }

        setSavingEvent(true);
        try {
            const accessToken = await getFromCache<string>('accessToken');
            const response = await api.updateEvent(
                {
                    ...createdEvent,
                    position: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                    },
                },
                accessToken
            );
            setCreatedEvent(response.data);
            await updateCachedEvent(response.data);
            navigation.navigate('EventsMap');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Please check your connection and try again.';
            Alert.alert('Unable to save event location', message);
        } finally {
            setSavingEvent(false);
        }
    };

    const eventDateLabel = dateTime
        ? `${dateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${dateTime.toLocaleTimeString(
              'en-US',
              { hour: 'numeric', minute: '2-digit' }
          )}`
        : 'Select a date and time';

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <RectButton style={styles.headerIcon} onPress={closeScreen}>
                    <Feather name="arrow-left" size={22} color="#00A3FF" />
                </RectButton>
                <Text style={styles.headerTitle}>Add event</Text>
                <RectButton style={styles.headerIcon} onPress={() => navigation.goBack()}>
                    <Feather name="x" size={24} color="#FF1744" />
                </RectButton>
            </View>

            {selectingLocation ? (
                <View style={styles.locationPage}>
                    <MapView
                        style={styles.locationMap}
                        initialRegion={MapSettings.DEFAULT_REGION}
                        onRegionChangeComplete={setLocation}
                        showsUserLocation={true}
                        showsMyLocationButton={false}
                        rotateEnabled={false}
                    />
                    <View pointerEvents="none" style={styles.mapPin}>
                        <Feather name="map-pin" size={42} color="#FF8700" />
                    </View>
                    <View style={styles.locationHint}>
                        <Text style={styles.locationHintText}>Move the map to place the event location</Text>
                    </View>
                    <View style={styles.locationFooter}>
                        <RectButton
                            style={[styles.primaryButton, savingEvent && styles.disabledButton]}
                            onPress={() => void handleCreateEvent()}
                            enabled={!savingEvent}
                        >
                            {savingEvent ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Next</Text>
                            )}
                        </RectButton>
                    </View>
                </View>
            ) : (
                <>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.formContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.label}>Event Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            maxLength={100}
                            returnKeyType="next"
                            editable={!savingEvent}
                        />

                        <View style={styles.labelRow}>
                            <Text style={styles.label}>About</Text>
                            <Text style={styles.counter}>{description.length}/300 characters max.</Text>
                        </View>
                        <TextInput
                            style={[styles.input, styles.descriptionInput]}
                            value={description}
                            onChangeText={setDescription}
                            maxLength={300}
                            multiline
                            textAlignVertical="top"
                            editable={!savingEvent}
                        />

                        <Text style={styles.label}>Volunteers Needed</Text>
                        <TextInput
                            style={styles.input}
                            value={volunteersNeeded}
                            onChangeText={(value) => setVolunteersNeeded(value.replace(/[^0-9]/g, ''))}
                            keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                            maxLength={4}
                            editable={!savingEvent}
                        />

                        <Text style={styles.label}>Date and Time</Text>
                        <RectButton
                            style={styles.dateInput}
                            onPress={() => setPickerMode('date')}
                            enabled={!savingEvent}
                        >
                            <Text style={[styles.dateText, !dateTime && styles.placeholderText]}>{eventDateLabel}</Text>
                            <Feather name="calendar" size={18} color="#8FA7B3" />
                        </RectButton>
                        {dateTime && dateTime.getTime() <= Date.now() && (
                            <Text style={styles.validationText}>Choose a future date and time.</Text>
                        )}

                        <Text style={styles.label}>Picture</Text>
                        {uploadedImage ? (
                            <View style={styles.imageDetails}>
                                <Image source={{ uri: uploadedImage.uri }} style={styles.thumbnail} />
                                <View style={styles.imageMetadata}>
                                    <Text style={styles.imageName} numberOfLines={1}>
                                        {uploadedImage.name}
                                    </Text>
                                    <Text style={styles.imageSize}>{formatBytes(uploadedImage.size)}</Text>
                                </View>
                                <Feather name="check-circle" size={21} color="#00A3FF" />
                                <RectButton
                                    style={styles.removeImageButton}
                                    onPress={() => setUploadedImage(undefined)}
                                    enabled={!savingEvent}
                                >
                                    <Feather name="x" size={21} color="#FF1744" />
                                </RectButton>
                            </View>
                        ) : (
                            <RectButton
                                style={styles.addPictureButton}
                                onPress={chooseImage}
                                enabled={!uploadingImage && !savingEvent}
                            >
                                {uploadingImage ? (
                                    <ActivityIndicator color="#00A3FF" />
                                ) : (
                                    <Feather name="plus" size={22} color="#00A3FF" />
                                )}
                            </RectButton>
                        )}
                    </ScrollView>
                    <View style={styles.formFooter}>
                        <RectButton
                            style={[styles.primaryButton, (!formIsValid || savingEvent) && styles.disabledButton]}
                            onPress={() => void handleSaveDetails()}
                            enabled={formIsValid && !savingEvent}
                        >
                            {savingEvent ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Save</Text>
                            )}
                        </RectButton>
                    </View>
                </>
            )}

            <DateTimePickerModal
                isVisible={pickerMode !== undefined}
                mode={pickerMode === 'time' ? 'time' : 'date'}
                date={dateTime ?? new Date()}
                onConfirm={pickerMode === 'time' ? handleTimeConfirm : handleDateConfirm}
                onCancel={() => setPickerMode(undefined)}
                minimumDate={pickerMode === 'date' ? new Date() : undefined}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#EAF2F5',
    },
    header: {
        height: 56,
        marginTop: Platform.OS === 'ios' ? 44 : 24,
        paddingHorizontal: 16,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerIcon: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: '#8FA7B3',
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 16,
    },
    formContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
    },
    label: {
        color: '#8FA7B3',
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 13,
        marginBottom: 4,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
    },
    counter: {
        color: '#A4B8C1',
        fontFamily: 'Nunito_400Regular',
        fontSize: 10,
        marginBottom: 4,
    },
    input: {
        minHeight: 46,
        backgroundColor: '#FFF',
        borderColor: '#D3E2E5',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
        color: '#5C8599',
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
    },
    descriptionInput: {
        height: 96,
    },
    dateInput: {
        minHeight: 46,
        backgroundColor: '#FFF',
        borderColor: '#D3E2E5',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateText: {
        color: '#5C8599',
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 14,
    },
    placeholderText: {
        color: '#A4B8C1',
    },
    validationText: {
        color: '#D22',
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 12,
        marginTop: -8,
        marginBottom: 10,
    },
    addPictureButton: {
        height: 46,
        backgroundColor: '#F5F9FB',
        borderColor: '#88CFFF',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageDetails: {
        minHeight: 56,
        paddingHorizontal: 6,
        paddingVertical: 4,
        backgroundColor: '#F5F9FB',
        borderColor: '#00A3FF',
        borderWidth: 1,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    thumbnail: {
        height: 42,
        width: 48,
        borderRadius: 5,
        backgroundColor: '#D3E2E5',
    },
    imageMetadata: {
        flex: 1,
        paddingHorizontal: 8,
    },
    imageName: {
        color: '#5C8599',
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 12,
    },
    imageSize: {
        color: '#8FA7B3',
        fontFamily: 'Nunito_400Regular',
        fontSize: 11,
    },
    removeImageButton: {
        width: 30,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
    },
    formFooter: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 24,
        backgroundColor: '#EAF2F5',
    },
    primaryButton: {
        height: 52,
        borderRadius: 14,
        backgroundColor: '#00A3FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    primaryButtonText: {
        color: '#FFF',
        fontFamily: 'Nunito_800ExtraBold',
        fontSize: 15,
    },
    locationPage: {
        flex: 1,
    },
    locationMap: {
        ...StyleSheet.absoluteFillObject,
    },
    mapPin: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: -21,
        marginTop: -42,
    },
    locationHint: {
        position: 'absolute',
        top: 16,
        left: 20,
        right: 20,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#FFFFFFE8',
        alignItems: 'center',
    },
    locationHintText: {
        color: '#5C8599',
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 13,
    },
    locationFooter: {
        position: 'absolute',
        bottom: 28,
        left: 20,
        right: 20,
    },
});
