import Constants from 'expo-constants';
import * as JwtDecodeModule from 'jwt-decode';
import { Platform } from 'react-native';
import { LatLng } from 'react-native-maps';

// Safe resolver for jwtDecode across different package versions
const decodeToken = (token: string): any => {
    try {
        if (typeof JwtDecodeModule === 'function') {
            return (JwtDecodeModule as any)(token);
        }
        if ((JwtDecodeModule as any).jwtDecode) {
            return (JwtDecodeModule as any).jwtDecode(token);
        }
        if ((JwtDecodeModule as any).default) {
            return (JwtDecodeModule as any).default(token);
        }
        return {};
    } catch (e) {
        console.warn('JWT Decode Error:', e);
        return {};
    }
};

export const formatBytes = (bytes: number, decimals = 2): string => {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const formatAMPM = (date: Date): string => {
    const dateObj = new Date(date);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const newHours = hours % 12 ? hours : 12;
    const newMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${newHours}:${newMinutes} ${ampm}`;
};

export const addHours = (dateTime: Date, hoursToAdd: number) => {
    const milisecondsToAdd = hoursToAdd * 60 * 60 * 1000;
    const newDate = new Date(dateTime);
    return new Date(newDate.setTime(newDate.getTime() + milisecondsToAdd));
};

export const updateDateWithNewTime = (existingDate: Date, newTime: Date): Date => {
    return new Date(new Date(existingDate).setHours(newTime.getHours(), newTime.getMinutes(), 0, 0));
};

export const sanitizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
};

export const validateEmail = (email: string): boolean => {
    if (!email) return false;
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{3})+$/;
    const sanitizedEmail = email.trim().toLowerCase();
    const result = sanitizedEmail.match(regex);
    return !!result?.[0];
};

export const parseDateFieldFromJSONResponse = (array: [], fieldName: string): any[] => {
    return array.map((x: any) => {
        x[fieldName] = new Date(x[fieldName]);
        return x;
    });
};

export const castToNumber = (text: string) => {
    return Number(text);
};

export const getEnvironentVariable = (variableName: string) => {
    try {
        const value = Constants.expoConfig?.extra?.[variableName];
        if (value != null) {
            return value;
        } else {
            throw new Error(`${variableName} not found.`);
        }
    } catch (e) {
        console.warn(e);
    }
};

export const getMapsUrl = (coordinates: LatLng): string => {
    const { latitude, longitude } = coordinates;
    const latLng = `${latitude},${longitude}`;
    const label = 'Custom Label';
    return Platform.OS === 'ios' ? `maps:0,0?q=${label}@${latLng}` : `geo:0,0?q=${latLng}(${label})`;
};

export const isTokenExpired = (token: string): boolean => {
    if (!token) return true;
    const decodedToken = decodeToken(token);
    if (!decodedToken || !decodedToken.exp) return true;
    const currentDate = Date.now();
    return decodedToken.exp * 1000 < currentDate;
};