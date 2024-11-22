/**
 * Login Component
 *
 * This component manages the login functionality for the Volunteam app. It provides an interface for users to enter their credentials, validates inputs, and authenticates users via the backend API. Upon successful authentication, the user is navigated to the EventsMap page.
 *
 * Props:
 * @prop {StackScreenProps<any>} navigation - Navigation object from React Navigation for handling screen transitions.
 *
 * State:
 * @state {string} email - User-entered email address.
 * @state {string} password - User-entered password.
 * @state {boolean} emailIsInvalid - Flag indicating if the email input is invalid.
 * @state {boolean} passwordIsInvalid - Flag indicating if the password input is invalid.
 * @state {string | undefined} authError - Error message from the authentication process.
 * @state {boolean} accessTokenIsValid - Indicates whether a cached access token is valid.
 * @state {boolean} isAuthenticating - Indicates whether the authentication process is in progress.
 *
 * Capabilities:
 * - Input validation for email and password fields.
 * - Integration with caching to retrieve and validate a cached user session and access token.
 * - Secure API calls for user authentication.
 * - Error handling and user feedback for authentication errors.
 * - Navigation to the EventsMap page upon successful authentication.
 *
 * Responsibilities:
 * 1. Retrieve and validate cached user and access token data during initial render.
 * 2. Validate user credentials on form submission.
 * 3. Display a loading spinner while authenticating.
 * 4. Provide error feedback for invalid inputs or authentication failures.
 * 5. Securely cache user and access token data upon successful login.
 */
import { useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Spinner from 'react-native-loading-spinner-overlay';
import BigButton from '../components/BigButton';
import Spacer from '../components/Spacer';
import { AuthenticationContext } from '../context/AuthenticationContext';
import logoImg from '../images/logo.png';
import * as api from '../services/api';
import { getFromCache, setInCache } from '../services/caching';
import { User } from '../types/User';
import { isTokenExpired, sanitizeEmail} from '../utils';
import { validateEmail } from '../utils/validateEmail';

/**
 * Login Component
 * - This component manages the login functionality for the Volunteam app. It provides an interface for users to enter their credentials, validates inputs, and authenticates users via the backend API. Upon successful authentication, the user is navigated to the EventsMap page.
 * @param {StackScreenProps<any>} navigation - Navigation object from React Navigation for handling screen transitions.
 * @returns {JSX.Element} - A JSX Element containing the login screen UI.
 */

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

    /**
     * Effect: Retrieve cached user info and access token on component mount.
     * Handles error alerts for authentication issues.
     */

    useEffect(() => {
        getFromCache('userInfo').then(
            (cachedUserInfo) => authenticationContext?.setValue(cachedUserInfo as User),
            (error: any) => console.log(error)
        );
        getFromCache('accessToken').then(
            (accessToken) => accessToken && !isTokenExpired(accessToken as string) && setAccessTokenIsValid(true),
            (error: any) => console.log(error)
        );
        if (authError)
            Alert.alert('Authentication Error', authError, [{ text: 'Ok', onPress: () => setAuthError(undefined) }]);
    }, [authError]);

    useEffect(() => {
        if (accessTokenIsValid && authenticationContext?.value) navigation.navigate('EventsMap');
    }, [accessTokenIsValid]);

    /**
     * Handles the authentication process:
     * - Validates form inputs.
     * - Sends API request for authentication.
     * - Caches user data and access token upon success.
     * - Handles errors from the API response.
     */

    const handleAuthentication = () => {
        if (formIsValid()) {
            setIsAuthenticating(true);
            api.authenticateUser(sanitizeEmail(email), password)
                .then((response) => {
                    setInCache('userInfo', response.data.user);
                    setInCache('accessToken', response.data.accessToken);
                    authenticationContext?.setValue(response.data.user);
                    setIsAuthenticating(false);
                    123;
                    navigation.navigate('EventsMap');
                })
                .catch((error) => {
                    if (error.response) {
                        setAuthError(error.response.data);
                    } else {
                        setAuthError('Something went wrong.');
                    }
                    setIsAuthenticating(false);
                });
        }
    };

    /**
     * Form validation functions:
     * - formIsValid: Checks if both email and password are valid.
     * - isPasswordInvalid: Checks if the password input is invalid.
     * - isEmailInvalid: Checks if the email input is invalid.
     */

    const formIsValid = () => {
        const emailIsValid = !isEmailInvalid();
        const passwordIsValid = !isPasswordInvalid();
        return emailIsValid && passwordIsValid;
    };

    /**
     * Checks if the password input is invalid.
     * @returns {boolean} - Returns true if the password is invalid, false otherwise.
     */

    const isPasswordInvalid = (): boolean => {
        const invalidCheck = password.length < 6;
        setPasswordIsInvalid(invalidCheck);
        return invalidCheck ? true : false;
    };

    /**
     * Checks if the email input is invalid.
     * @returns {boolean} - Returns true if the email is invalid, false otherwise.
     */

    const isEmailInvalid = (): boolean => {
        const invalidCheck = !validateEmail(email);
        setEmailIsInvalid(invalidCheck);
        return invalidCheck ? true : false;
    };

    /**
     * Renders the login screen UI:
     * - Linear gradient background.
     * - Logo image.
     * - Email and password input fields.
     * - Login button.
     */

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
