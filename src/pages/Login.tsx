import { useIsFocused } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Spinner from "react-native-loading-spinner-overlay";
import BigButton from "../components/BigButton";
import Spacer from "../components/Spacer";
import { AuthenticationContext } from "../context/AuthenticationContext";
import logoImg from "../images/logo.png";
import axios from "axios";
import bcrypt from "bcryptjs";
import { getFromCache, setInCache } from "../services/caching";
import { User } from "../types/User";
import { sanitizeEmail, validateEmail } from "../utils";

const apiBase = "http://10.0.0.33:3333";

/* ---------------------------------------------------------
   API HELPERS — using bcrypt for secure login & registration
------------------------------------------------------------ */
const authenticateUser = async (email: string, password: string) => {
  const { data } = await axios.get(`${apiBase}/users`);
  const user = data.find((u: any) => u.email === email);

  if (!user) throw new Error("USER_NOT_FOUND");

  // Compare plaintext vs hashed password safely
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("INVALID_PASSWORD");

  return { user, accessToken: "dummy-token" };
};

const registerUser = async (email: string, password: string) => {
  const { data } = await axios.get(`${apiBase}/users`);
  const exists = data.some((u: any) => u.email === email);
  if (exists) throw new Error("USER_EXISTS");

  // Hash password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
    name: { first: "", last: "" },
    mobile: "584-000-999",
  };

  await axios.post(`${apiBase}/users`, newUser);
  return newUser;
};

/* ---------------------------------------------------------
   COMPONENT
------------------------------------------------------------ */
export default function LoginBlue({ navigation }: StackScreenProps<any>) {
  const authenticationContext = useContext(AuthenticationContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailIsInvalid, setEmailIsInvalid] = useState<boolean>();
  const [passwordIsInvalid, setPasswordIsInvalid] = useState<boolean>();
  const [authError, setAuthError] = useState<string>();
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const isFocused = useIsFocused();

  // Load cached user (if any)
  useEffect(() => {
    getFromCache("userInfo").then(
      (cachedUserInfo) =>
        authenticationContext?.setValue(cachedUserInfo as User),
      (error: any) => console.log(error)
    );
  }, []);

  // Show error dialogs
  useEffect(() => {
    if (authError) {
      Alert.alert("Authentication Error", authError, [
        { text: "Ok", onPress: () => setAuthError(undefined) },
      ]);
    }
  }, [authError]);

  const saveUserAndToken = async (user: User, token: string) => {
    await setInCache("userInfo", user);
    await setInCache("accessToken", token);
    authenticationContext?.setValue(user);
  };

  const handleAuthentication = async () => {
    if (!formIsValid()) return;
    setIsAuthenticating(true);
    const sanitizedEmail = sanitizeEmail(email);

    try {
      // Try login first
      const loginResponse = await authenticateUser(sanitizedEmail, password);
      await saveUserAndToken(loginResponse.user, loginResponse.accessToken);
      navigation.navigate("EventsMap");
    } catch (loginError: any) {
      if (loginError.message === "USER_NOT_FOUND") {
        try {
          // Register new user
          const newUser = await registerUser(sanitizedEmail, password);
          await saveUserAndToken(newUser, "dummy-token");
          navigation.navigate("EventsMap");
        } catch {
          setAuthError("Sign-up failed. Please try again.");
        }
      } else if (loginError.message === "INVALID_PASSWORD") {
        setAuthError("Incorrect password. Please try again.");
      } else {
        setAuthError("Something went wrong. Please try again later.");
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const formIsValid = () => !isEmailInvalid() && !isPasswordInvalid();

  const isPasswordInvalid = (): boolean => {
    const invalidCheck = password.length < 6;
    setPasswordIsInvalid(invalidCheck);
    return invalidCheck;
  };

  const isEmailInvalid = (): boolean => {
    const invalidCheck = !validateEmail(email);
    setEmailIsInvalid(invalidCheck);
    return invalidCheck;
  };

  /* ---------------------------------------------------------
     UI
  ------------------------------------------------------------ */
  return (
    <LinearGradient
      start={{ x: 0.0, y: 0.0 }}
      end={{ x: 1.0, y: 1.0 }}
      colors={["#031A62", "#00A3FF"]}
      style={styles.gradientContainer}
    >
      {isFocused && <StatusBar animated translucent style="light" />}
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={{
          padding: 24,
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "stretch",
        }}
      >
        <Image resizeMode="contain" style={styles.logo} source={logoImg} />
        <Spacer size={80} />

        {/* Email Input */}
        <View style={styles.inputLabelRow}>
          <Text style={styles.label}>Email</Text>
          {emailIsInvalid && <Text style={styles.error}>invalid email</Text>}
        </View>
        <TextInput
          style={[styles.input, emailIsInvalid && styles.invalid]}
          onChangeText={setEmail}
          onEndEditing={isEmailInvalid}
          autoCapitalize="none"
        />

        {/* Password Input */}
        <View style={styles.inputLabelRow}>
          <Text style={styles.label}>Password</Text>
          {passwordIsInvalid && (
            <Text style={styles.error}>invalid password</Text>
          )}
        </View>
        <TextInput
          style={[styles.input, passwordIsInvalid && styles.invalid]}
          secureTextEntry
          onChangeText={setPassword}
          onEndEditing={isPasswordInvalid}
        />

        <Spacer size={80} />
        <BigButton
          style={{ marginBottom: 8 }}
          onPress={handleAuthentication}
          label="Log in"
          color="#00A3FF"
        />
        <Spinner
          visible={isAuthenticating}
          textContent={"Authenticating..."}
          overlayColor="#031A62BF"
          textStyle={styles.spinnerText}
        />
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}

/* ---------------------------------------------------------
   STYLES
------------------------------------------------------------ */
const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  container: { flex: 1 },
  logo: { width: 240, height: 142, alignSelf: "center" },
  spinnerText: { fontSize: 16, fontFamily: "Nunito_700Bold", color: "#fff" },
  label: { color: "#fff", fontFamily: "Nunito_600SemiBold", fontSize: 15 },
  inputLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.4,
    borderColor: "#D3E2E5",
    borderRadius: 8,
    height: 56,
    paddingHorizontal: 24,
    marginBottom: 16,
    color: "#5C8599",
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
  },
  invalid: { borderColor: "red" },
  error: { color: "white", fontFamily: "Nunito_600SemiBold", fontSize: 12 },
});
