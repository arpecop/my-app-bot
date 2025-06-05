import { StatusBar } from "expo-status-bar";
import { useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    Dimensions,
    Linking,
} from "react-native"; // <-- Add Linking
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";

const { height: deviceHeight, width: deviceWidth } = Dimensions.get("window");
const MIN_PASSWORD_LENGTH = 6;

// Helper to parse URL query parameters (for demonstration)
const parseUrlParams = (url) => {
    const queryString = url.split("?")[1];
    if (!queryString) return {};
    return queryString.split("&").reduce((acc, pair) => {
        const [key, value] = pair.split("=");
        acc[key] = decodeURIComponent(value || "");
        return acc;
    }, {});
};

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const scrollViewRef = useRef(null);
    const router = useRouter();

    // --- AsyncStorage Helper Functions ---
    const getRegisteredUsers = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("@registered_users");
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error("Error reading users from storage:", e);
            return [];
        }
    };

    const saveUser = async (newUser) => {
        try {
            const existingUsers = await getRegisteredUsers();
            const updatedUsers = [...existingUsers, newUser];
            const jsonValue = JSON.stringify(updatedUsers);
            await AsyncStorage.setItem("@registered_users", jsonValue);
            return true;
        } catch (e) {
            console.error("Error saving user to storage:", e);
            return false;
        }
    };
    // --- End AsyncStorage Helper Functions ---

    const scrollToLogin = () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        setIsLogin(true);
        setErrorMessage("");
        setUsername("");
        setPassword("");
    };

    const scrollToRegister = () => {
        scrollViewRef.current?.scrollTo({ y: deviceHeight, animated: true });
        setIsLogin(false);
        setErrorMessage("");
        setEmail("");
        setPassword("");
    };

    const handleAuth = async () => {
        setErrorMessage("");

        const storedUsers = await getRegisteredUsers();

        if (isLogin) {
            const foundUser = storedUsers.find(
                (u) => u.email === email && u.password === password,
            );

            if (foundUser) {
                console.log("Logged in with:", email);
                router.push("/chat");
            } else {
                setErrorMessage("Login failed. Invalid email or password.");
            }
        } else {
            if (!username || !password) {
                setErrorMessage("Username and password are required.");
                return;
            }
            if (password.length < MIN_PASSWORD_LENGTH) {
                setErrorMessage(
                    `Password is too short. It must be at least ${MIN_PASSWORD_LENGTH} characters.`,
                );
                return;
            }

            const usernameExists = storedUsers.some(
                (u) => u.username === username,
            );
            if (usernameExists) {
                setErrorMessage(
                    "Username already taken. Please choose another.",
                );
                return;
            }

            const newEmail = `${username.toLowerCase()}@app.com`;
            const newUser = { username, password, email: newEmail };

            const success = await saveUser(newUser);
            if (success) {
                Alert.alert(
                    "Registration Success",
                    `Welcome ${username}! You can now log in using your email '${newEmail}' with your password.`,
                );
                console.log("Registered and redirected:", newUser);
                router.push("/chat");
            } else {
                setErrorMessage("Registration failed. Please try again.");
            }
        }
    };

    const handleGoogleLogin = async () => {
        setErrorMessage("");

        const authUrl = "https://userz.net/auth/google";
        const redirectUrl = "myapp://auth/callback";

        let result;
        try {
            result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                redirectUrl,
            );
        } catch (error) {
            console.error("WebBrowser error:", error);
            setErrorMessage(
                "Could not open browser for Google login. Please try again.",
            );
            return;
        }

        if (result.type === "success") {
            const urlParams = parseUrlParams(result.url);
            const token = urlParams.token || "FAKE_TOKEN";

            if (token) {
                Alert.alert(
                    "Google Login Success (Simulated)",
                    "Successfully received data and redirected!",
                );
                console.log("Google Auth Token (Simulated):", token);
                router.push("/chat");
            } else {
                setErrorMessage(
                    "Google Login failed: No token received in redirect URL.",
                );
            }
        } else if (result.type === "cancel") {
            setErrorMessage("Google Login cancelled by user.");
        } else if (result.type === "dismiss") {
            setErrorMessage("Google Login browser dismissed by user.");
        } else {
            setErrorMessage("Google Login failed due to an unexpected error.");
        }
    };

    // --- NEW BUTTON HANDLERS ---
    const handleDirectChatRedirect = () => {
        console.log(
            "Attempting direct internal redirect to /chat using router.push",
        );
        router.push("/chat");
    };

    const handleDeepLinkChat = async () => {
        const deepLinkUrl = "myapp://chat";
        console.log("Attempting to open deep link:", deepLinkUrl);
        try {
            const supported = await Linking.canOpenURL(deepLinkUrl);
            if (supported) {
                await Linking.openURL(deepLinkUrl);
                Alert.alert(
                    "Deep Link Initiated",
                    `Attempted to open: ${deepLinkUrl}`,
                );
            } else {
                Alert.alert(
                    "Deep Link Not Supported",
                    `Cannot open URL: ${deepLinkUrl}. Ensure 'myapp' scheme is configured in app.json and app is rebuilt.`,
                );
                console.error(
                    "Deep link not supported or scheme not configured:",
                    deepLinkUrl,
                );
            }
        } catch (error) {
            Alert.alert(
                "Deep Link Error",
                `Failed to open deep link: ${error.message}`,
            );
            console.error("Error opening deep link:", error);
        }
    };
    // --- END NEW BUTTON HANDLERS ---

    return (
        <View className="flex-1 bg-gray-100">
            <StatusBar style="auto" />
            <ScrollView
                ref={scrollViewRef}
                scrollEnabled={false}
                pagingEnabled={true}
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >
                {/* Login Section */}
                <View
                    className="flex-1 items-center justify-center p-4 bg-gray-100"
                    style={{ height: deviceHeight, width: deviceWidth }}
                >
                    <View className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
                        <Text className="text-3xl font-bold text-center mb-6 text-gray-800">
                            Login
                        </Text>

                        <TextInput
                            className="w-full p-3 mb-4 border border-gray-300 rounded-md text-base"
                            placeholder="Email (e.g., your_username@app.com)"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="off"
                            textContentType="none"
                        />

                        <TextInput
                            className="w-full p-3 mb-6 border border-gray-300 rounded-md text-base"
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="off"
                            textContentType="none"
                        />

                        {errorMessage && isLogin ? (
                            <Text className="text-red-600 text-center text-base mb-4">
                                {errorMessage}
                            </Text>
                        ) : null}

                        <TouchableOpacity
                            className="w-full bg-blue-600 p-3 rounded-md mb-4"
                            onPress={handleAuth}
                        >
                            <Text className="text-white text-center font-semibold text-lg">
                                Login
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-full bg-red-500 p-3 rounded-md flex-row items-center justify-center mb-4"
                            onPress={handleGoogleLogin}
                        >
                            <Image
                                source={{
                                    uri: "https://img.icons8.com/color/48/000000/google-logo.png",
                                }}
                                className="w-6 h-6 mr-2"
                            />
                            <Text className="text-white text-center font-semibold text-lg">
                                Login with Google
                            </Text>
                        </TouchableOpacity>

                        {/* --- NEW BUTTONS ADDED HERE --- */}
                        <TouchableOpacity
                            className="w-full bg-green-500 p-3 rounded-md mb-4"
                            onPress={handleDirectChatRedirect}
                        >
                            <Text className="text-white text-center font-semibold text-lg">
                                Redirect to /chat (Internal)
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-full bg-purple-500 p-3 rounded-md mb-4"
                            onPress={handleDeepLinkChat}
                        >
                            <Text className="text-white text-center font-semibold text-lg">
                                Open myapp://chat (Deep Link)
                            </Text>
                        </TouchableOpacity>
                        {/* --- END NEW BUTTONS --- */}

                        <TouchableOpacity onPress={scrollToRegister}>
                            <Text className="text-blue-600 text-center text-base">
                                Need an account? Register
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Register Section */}
                <View
                    className="flex-1 items-center justify-center p-4 bg-gray-100"
                    style={{ height: deviceHeight, width: deviceWidth }}
                >
                    <View className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
                        <Text className="text-3xl font-bold text-center mb-6 text-gray-800">
                            Register
                        </Text>

                        <TextInput
                            className="w-full p-3 mb-4 border border-gray-300 rounded-md text-base"
                            placeholder="Username"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoComplete="off"
                            textContentType="none"
                        />

                        <TextInput
                            className="w-full p-3 mb-6 border border-gray-300 rounded-md text-base"
                            placeholder={`Password (min ${MIN_PASSWORD_LENGTH} characters)`}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="off"
                            textContentType="none"
                        />

                        {errorMessage && !isLogin ? (
                            <Text className="text-red-600 text-center text-base mb-4">
                                {errorMessage}
                            </Text>
                        ) : null}

                        <TouchableOpacity
                            className="w-full bg-blue-600 p-3 rounded-md mb-4"
                            onPress={handleAuth}
                        >
                            <Text className="text-white text-center font-semibold text-lg">
                                Register
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={scrollToLogin}>
                            <Text className="text-blue-600 text-center text-base">
                                Already have an account? Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
