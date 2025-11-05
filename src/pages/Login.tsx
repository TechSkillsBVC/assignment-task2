import { useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BigButton from '../components/BigButton';
import Spacer from '../components/Spacer';
import { AuthenticationContext } from '../context/AuthenticationContext';
import logoImg from '../images/logo.png';
import * as api from '../services/api';
import { getFromCache, setInCache } from '../services/caching';
import { User } from '../types/User';
import { isTokenExpired, sanitizeEmail, validateEmail } from '../utils';
import { StackNavigationProp } from '@react-navigation/stack';

export default function Login({ navigation }: StackScreenProps<any>) {
    const authenticationContext = useContext(AuthenticationContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailIsInvalid, setEmailIsInvalid] = useState<boolean>();
    const [passwordIsInvalid, setPasswordIsInvalid] = useState<boolean>();
    const [authError, setAuthError] = useState<string>();

    const [accessTokenIsValid, setAccessTokenIsValid] = useState<boolean>(false);
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        getFromCache('userInfo').then(
            (cachedUserInfo) => {
                if (cachedUserInfo) {
                    authenticationContext?.setValue(cachedUserInfo as User);
                }
            },
            (error: any) => {
                console.log('Error loading cached user:', error);
                // Clear invalid cache
                AsyncStorage.multiRemove(['userInfo', 'accessToken']);
            }
        );
        
        getFromCache('accessToken').then(
            (accessToken) => {
                if (accessToken && !isTokenExpired(accessToken as string)) {
                    setAccessTokenIsValid(true);
                } else {
                    // Clear expired token
                    AsyncStorage.multiRemove(['userInfo', 'accessToken']);
                }
            },
            (error: any) => {
                console.log('Error loading token:', error);
                AsyncStorage.multiRemove(['userInfo', 'accessToken']);
            }
        );
        
        if (authError) {
            Alert.alert('Authentication Error', authError, [
                { text: 'Ok', onPress: () => setAuthError(undefined) }
            ]);
        }
    }, [authError]);

    useEffect(() => {
        if (accessTokenIsValid && authenticationContext?.value) {
            navigation.navigate('EventsMap');
        }
    }, [accessTokenIsValid]);

    const handleAuthentication = async () => {
        if (formIsValid()) {
            setIsAuthenticating(true);
           try {
                console.log('=== LOGIN ATTEMPT ===');
                console.log('Email:', sanitizeEmail(email));
                console.log('API Base URL:', api.defaults?.baseURL);
                
                const response = await api.authenticateUser(sanitizeEmail(email), password);
                
                console.log('=== LOGIN SUCCESS ===');
                console.log('Response:', response.data);
                
                await setInCache('userInfo', response.data.user);
                await setInCache('accessToken', response.data.accessToken);
                authenticationContext?.setValue(response.data.user);
                setIsAuthenticating(false);
                navigation.navigate('EventsMap');
                
            } catch (error: any) {
                console.log('=== LOGIN FAILED ===');
                console.log('Error object:', error);
                console.log('Error response:', error.response);
                console.log('Error request:', error.request);
                console.log('Error message:', error.message);
                
                setIsAuthenticating(false);
                
                // Clear any existing cache on login error
                await AsyncStorage.multiRemove(['userInfo', 'accessToken']);
                
                let errorMessage = 'Authentication failed';
                
                if (error.response) {
                    console.log('Response status:', error.response.status);
                    console.log('Response data:', error.response.data);
                    
                    if (typeof error.response.data === 'string') {
                        errorMessage = error.response.data;
                    } else if (error.response.data?.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response.status === 400) {
                        errorMessage = 'Invalid email or password';
                    } else if (error.response.status === 401) {
                        errorMessage = 'Incorrect email or password';
                    }
                } else if (error.request) {
                    errorMessage = 'Cannot connect to server. Please check your network connection.';
                } else {
                    errorMessage = error.message || 'Something went wrong';
                }
                
                setAuthError(errorMessage);
            }
        }
    };

    const formIsValid = () => {
        const emailIsValid = !isEmailInvalid();
        const passwordIsValid = !isPasswordInvalid();
        return emailIsValid && passwordIsValid;
    };

    const isPasswordInvalid = (): boolean => {
        const invalidCheck = password.length < 6;
        setPasswordIsInvalid(invalidCheck);
        return invalidCheck ? true : false;
    };

    const isEmailInvalid = (): boolean => {
        const invalidCheck = !validateEmail(email);
        setEmailIsInvalid(invalidCheck);
        return invalidCheck ? true : false;
    };

    return (
        <LinearGradient
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1.0, y: 1.0 }}
            colors={['#031A62', '#00A3FF']}
            style={styles.gradientContainer}
        >
            {isFocused && <StatusBar animated translucent style="light" />}
            <KeyboardAwareScrollView
                style={styles.container}
                contentContainerStyle={{
                    padding: 24,
                    flexGrow: 1,
                    justifyContent: 'center',
                    alignItems: 'stretch',
                }}
            >
                <Image
                    resizeMode="contain"
                    style={{
                        width: 240,
                        height: 142,
                        alignSelf: 'center',
                    }}
                    source={logoImg}
                />
                <Spacer size={80} />
                <View style={styles.inputLabelRow}>
                    <Text style={styles.label}>Email</Text>
                    {emailIsInvalid && <Text style={styles.error}>invalid email</Text>}
                </View>
                <TextInput
                    style={[styles.input, emailIsInvalid && styles.invalid]}
                    onChangeText={(value) => setEmail(value)}
                    onEndEditing={isEmailInvalid}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <View style={styles.inputLabelRow}>
                    <Text style={styles.label}>Password</Text>
                    {passwordIsInvalid && <Text style={styles.error}>invalid password</Text>}
                </View>
                <TextInput
                    style={[styles.input, passwordIsInvalid && styles.invalid]}
                    secureTextEntry={true}
                    onChangeText={(value) => setPassword(value)}
                    onEndEditing={isPasswordInvalid}
                />
                <Spacer size={80} />
                <BigButton style={{ marginBottom: 8 }} onPress={handleAuthentication} label="Log in" color="#FF8700" />
                <Spinner
                    visible={isAuthenticating}
                    textContent={'Authenticating...'}
                    overlayColor="#031A62BF"
                    textStyle={styles.spinnerText}
                />
            </KeyboardAwareScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
    },

    container: {
        flex: 1,
    },

    spinnerText: {
        fontSize: 16,
        fontFamily: 'Nunito_700Bold',
        color: '#fff',
    },

    label: {
        color: '#fff',
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
    },

    inputLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 4,
    },

    input: {
        backgroundColor: '#fff',
        borderWidth: 1.4,
        borderColor: '#D3E2E5',
        borderRadius: 8,
        height: 56,
        paddingTop: 16,
        paddingBottom: 16,
        paddingHorizontal: 24,
        marginBottom: 16,
        color: '#5C8599',
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
    },

    invalid: {
        borderColor: 'red',
    },

    error: {
        color: 'white',
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 12,
    },
});