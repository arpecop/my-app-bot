import { StatusBar } from "expo-status-bar";
import { useState, useRef, useEffect } from "react";
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
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";

const { height: deviceHeight, width: deviceWidth } = Dimensions.get("window");
const MIN_PASSWORD_LENGTH = 6;

// Helper to parse URL query parameters (for demonstration)
const parseUrlParams = (url: string): Record<string, string> => {
    const queryString = url.split("?")[1];

    if (!queryString) {
        return {};
    }

    return queryString.split("&").reduce(
        (acc, pair) => {
            const [key, value] = pair.split("=");

            if (key) {
                acc[key] = decodeURIComponent(value || "");
            }

            return acc;
        },
        {} as Record<string, string>,
    );
};

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const scrollViewRef = useRef<ScrollView>(null);
    const router = useRouter();

    // --- Single line boolean for controlling initial behavior ---
    const productionLogin = false; // Set to `true` for production behavior, `false` for dev behavior
    // -------------------------------------------------------------

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

    const saveUser = async (newUser: {
        username: string;
        password: string;
        email: string;
    }) => {
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

    // Scroll functions now refer to the correct page index (0 for splash, 1 for login, 2 for register)
    const scrollToSplash = () => {
        scrollViewRef.current?.scrollTo({ x: 0, animated: false }); // No animation for initial load
    };

    const scrollToLogin = () => {
        scrollViewRef.current?.scrollTo({ x: deviceWidth, animated: true });
        setIsLogin(true);
        setErrorMessage("");
        setUsername("");
        setPassword("");
    };

    const scrollToRegister = () => {
        scrollViewRef.current?.scrollTo({ x: deviceWidth * 2, animated: true });
        setIsLogin(false);
        setErrorMessage("");
        setEmail("");
        setPassword("");
    };

    // --- useEffect for initial screen logic ---
    useEffect(() => {
        const checkAndNavigate = async () => {
            // Ensure ScrollView is ready by using a timeout and initially scroll to splash
            scrollToSplash(); // Ensure we are on the splash screen initially

            setTimeout(async () => {
                const storedUsers = await getRegisteredUsers();

                if (productionLogin) {
                    // Production behavior: Check registration
                    if (storedUsers && storedUsers.length > 0) {
                        console.log(
                            "Production Login: User(s) already registered. Redirecting to /chat.",
                        );
                        router.replace("/chat");
                    } else {
                        console.log(
                            "Production Login: No users registered. Scrolling to Register.",
                        );
                        scrollToRegister(); // Scroll to the register page
                    }
                } else {
                    // Dev behavior: Always scroll to login
                    console.log(
                        "Development Login: Always scrolling to Login.",
                    );
                    scrollToLogin(); // Scroll to the login page
                }
            }, 500); // Increased delay slightly for better visual on initial load
        };

        checkAndNavigate();
    }, []); // Empty dependency array means this runs only once on component mount

    const handleAuth = async () => {
        setErrorMessage("");

        const storedUsers = await getRegisteredUsers();

        if (isLogin) {
            const foundUser = storedUsers.find(
                (u: any) => u.email === email && u.password === password,
            );

            if (foundUser) {
                console.log("Logged in with:", email);
                router.push("/chat");
            } else {
                setErrorMessage(
                    "Входът е неуспешен. Невалиден имейл или парола.",
                );
            }
        } else {
            if (!username || !password) {
                setErrorMessage("Потребителско име и парола са задължителни.");
                return;
            }
            if (password.length < MIN_PASSWORD_LENGTH) {
                setErrorMessage(
                    `Паролата е твърде къса. Трябва да е поне ${MIN_PASSWORD_LENGTH} символа.`,
                );
                return;
            }

            const usernameExists = storedUsers.some(
                (u: any) => u.username === username,
            );
            if (usernameExists) {
                setErrorMessage(
                    "Потребителското име вече е заето. Моля, изберете друго.",
                );
                return;
            }

            const newEmail = `${username.toLowerCase()}@app.com`;
            const newUser = { username, password, email: newEmail };

            const success = await saveUser(newUser);
            if (success) {
                Alert.alert(
                    "Успешна регистрация",
                    `Добре дошли, ${username}! Вече можете да влезете с вашия имейл '${newEmail}' и парола.`,
                );
                console.log("Registered and redirected:", newUser);
                router.push("/chat");
            } else {
                setErrorMessage(
                    "Регистрацията е неуспешна. Моля, опитайте отново.",
                );
            }
        }
    };

    const handleGoogleLogin = async () => {
        setErrorMessage("");

        const authUrl = "https://userz.net/auth/google";
        const redirectUrl = "bitpazar://auth/callback"; // Make sure your app.json scheme matches this

        let result;
        try {
            result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                redirectUrl,
            );
        } catch (error: any) {
            console.error("WebBrowser error:", error);
            setErrorMessage(
                "Не може да се отвори браузър за вход с Google. Моля, опитайте отново.",
            );
            return;
        }

        if (result.type === "success") {
            const urlParams = parseUrlParams(result.url);
            const token = urlParams.token || "FAKE_TOKEN";

            if (token) {
                Alert.alert(
                    "Успешен вход с Google (симулиран)",
                    "Данните са получени успешно и пренасочени!",
                );
                console.log("Google Auth Token (Simulated):", token);
                router.push("/chat");
            } else {
                setErrorMessage(
                    "Входът с Google е неуспешен: Не е получен токен в URL адреса за пренасочване.",
                );
            }
        } else if (result.type === "cancel") {
            setErrorMessage("Входът с Google е анулиран от потребителя.");
        } else if (result.type === "dismiss") {
            setErrorMessage(
                "Браузърът за вход с Google е затворен от потребителя.",
            );
        } else {
            setErrorMessage(
                "Входът с Google е неуспешен поради неочаквана грешка.",
            );
        }
    };

    const handleDirectChatRedirect = () => {
        console.log(
            "Attempting direct internal redirect to /chat using router.push",
        );
        router.push("/chat");
    };

    const handleDeepLinkChat = async () => {
        const deepLinkUrl = "bitpazar://chat"; // Make sure your app.json scheme matches this
        console.log("Attempting to open deep link:", deepLinkUrl);
        try {
            const supported = await Linking.canOpenURL(deepLinkUrl);
            if (supported) {
                await Linking.openURL(deepLinkUrl);
            } else {
                Alert.alert(
                    "Deep Link не се поддържа",
                    `Не може да се отвори URL: ${deepLinkUrl}. Уверете се, че схемата 'bitpazar' е конфигурирана в app.json и приложението е самостоятелна компилация.`,
                );
                console.error(
                    "Deep link not supported or scheme not configured:",
                    deepLinkUrl,
                );
            }
        } catch (error: any) {
            Alert.alert(
                "Грешка при Deep Link",
                `Неуспешно отваряне на Deep Link: ${error.message}`,
            );
            console.error("Error opening deep link:", error);
        }
    };
    const textInputStyle =
        "w-full p-3 mb-4 border border-gray-900 dark:border-gray-100 dark:text-white rounded-md text-base";
    return (
        <View className="flex-1 bg-gray-200 dark:bg-gray-900">
            <StatusBar style="auto" />

            {/* Static Image at the top */}
            <View className="flex flex-col items-center justify-center pt-20">
                <Image
                    style={{ width: 150, height: 150 }}
                    source={require("../../assets/icon.png")}
                    resizeMode="cover"
                />
            </View>

            <ScrollView
                ref={scrollViewRef}
                horizontal={true}
                pagingEnabled={true}
                scrollEnabled={false} // Disable manual user scrolling
                showsHorizontalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ flexDirection: "row" }}
            >
                {/* Splash Screen Section (first page) */}
                <View
                    className="flex-1 items-center justify-start py-10" // Adjusted padding to fit below static image
                    style={{ height: deviceHeight, width: deviceWidth }}
                >
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text className="mt-4 text-gray-800 dark:text-gray-200 text-lg">
                        Проверка на състоянието за вход...
                    </Text>
                </View>

                {/* Login Section (second page) */}
                <View
                    className="flex-1 items-center justify-start py-10" // Adjusted padding
                    style={{ height: deviceHeight, width: deviceWidth }}
                >
                    <View className="w-full max-w-sm  p-6 rounded-lg shadow-md">
                        <Text className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
                            Вход
                        </Text>
                        <TextInput
                            className={textInputStyle}
                            placeholder="Имейл (напр. вашето_потребителско_име@app.com)"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="off"
                            textContentType="none"
                        />
                        <TextInput
                            className={textInputStyle}
                            placeholder="Парола"
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
                                Вход
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
                                Вход с Google
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-full bg-green-500 p-3 rounded-md mb-4"
                            onPress={handleDirectChatRedirect}
                        >
                            <Text className="text-white text-center font-semibold text-lg">
                                Пренасочване към /chat (вътрешно)
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-full bg-purple-500 p-3 rounded-md mb-4"
                            onPress={handleDeepLinkChat}
                        >
                            <Text className="text-white text-center font-semibold text-lg">
                                Отваряне bitpazar://chat (Deep Link)
                            </Text>
                        </TouchableOpacity>

                        {/* Bidirectional navigation - to Register */}
                        <TouchableOpacity onPress={scrollToRegister}>
                            <Text className="text-blue-600 text-center text-base">
                                Нямате профил? Регистрирайте се
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Register Section (third page) */}
                <View
                    className="flex-1 items-center justify-start py-10" // Adjusted padding
                    style={{ height: deviceHeight, width: deviceWidth }}
                >
                    <View className="w-full max-w-sm  p-6 rounded-lg shadow-md">
                        <Text className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
                            Регистрация
                        </Text>

                        <TextInput
                            className={textInputStyle}
                            placeholder="Потребителско име"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoComplete="off"
                            textContentType="none"
                        />

                        <TextInput
                            className={textInputStyle}
                            placeholder={`Парола (мин. ${MIN_PASSWORD_LENGTH} символа)`}
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
                            <Text className="text-white text-center font-bold">
                                Регистриране
                            </Text>
                        </TouchableOpacity>

                        {/* Bidirectional navigation - to Login */}
                        <TouchableOpacity onPress={scrollToLogin}>
                            <Text className="text-blue-600 text-center text-base">
                                Вече имате профил? Вход
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
