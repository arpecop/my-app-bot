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
  StyleSheet, // Import StyleSheet for absolute positioning
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

// Function to generate a random ID for state parameter
const generateRandomId = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  // State for popup error handling
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // State for SSO Debug Log (dev only)
  const [ssoDebugLog, setSsoDebugLog] = useState("");

  // Refs for both horizontal and vertical ScrollViews
  const horizontalScrollViewRef = useRef<ScrollView>(null);
  const verticalScrollViewRef = useRef<ScrollView>(null);

  const router = useRouter();

  // --- Single line boolean for controlling initial behavior ---
  const productionLogin = false; // Set to `false` for development
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

  // Function to display the error popup
  const displayErrorPopup = (message: string) => {
    setPopupMessage(message);
    setShowErrorPopup(true);
  };

  // Horizontal Scroll Functions (for Login/Register pages)
  const scrollToSplashHorizontal = () => {
    horizontalScrollViewRef.current?.scrollTo({ x: 0, animated: false }); // No animation for initial load
  };

  const scrollToLoginHorizontal = () => {
    horizontalScrollViewRef.current?.scrollTo({
      x: deviceWidth,
      animated: true,
    });
    setIsLogin(true);
    // Reset inputs and error message when navigating
    setEmail("");
    setPassword("");
    setUsername("");
    setPopupMessage(""); // Clear popup message
    setShowErrorPopup(false); // Hide popup
  };

  const scrollToRegisterHorizontal = () => {
    horizontalScrollViewRef.current?.scrollTo({
      x: deviceWidth * 2,
      animated: true,
    });
    setIsLogin(false);
    // Reset inputs and error message when navigating
    setEmail("");
    setPassword("");
    setUsername("");
    setPopupMessage(""); // Clear popup message
    setShowErrorPopup(false); // Hide popup
  };

  // Vertical Scroll Functions (for rows/sections)
  const scrollToAuthSection = () => {
    verticalScrollViewRef.current?.scrollTo({ y: 0, animated: true });
    // Optionally, reset horizontal scroll to login when returning to auth section
    scrollToLoginHorizontal();
  };

  const scrollToPrivacyPolicy = () => {
    verticalScrollViewRef.current?.scrollTo({
      y: deviceHeight,
      animated: true,
    });
  };

  // --- useEffect for initial screen logic ---
  useEffect(() => {
    const checkAndNavigate = async () => {
      // Ensure horizontal ScrollView is ready and initially on splash
      scrollToSplashHorizontal();

      // Small delay to ensure layout is ready before checking state and scrolling
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
            scrollToRegisterHorizontal(); // Scroll to the register page
          }
        } else {
          // Dev behavior: Always scroll to login
          console.log("Development Login: Always scrolling to Login.");
          scrollToLoginHorizontal(); // Scroll to the login page
        }
      }, 500); // Increased delay slightly for better visual on initial load
    };

    checkAndNavigate();
  }, []); // Empty dependency array means this runs only once on component mount

  const handleAuth = async () => {
    // No longer using setErrorMessage directly, use displayErrorPopup
    setPopupMessage("");
    setShowErrorPopup(false);

    const storedUsers = await getRegisteredUsers();

    if (isLogin) {
      const foundUser = storedUsers.find(
        (u: any) => u.email === email && u.password === password,
      );

      if (foundUser) {
        console.log("Logged in with:", email);
        router.push("/chat");
      } else {
        displayErrorPopup("Входът е неуспешен. Невалиден имейл или парола.");
      }
    } else {
      if (!username || !password) {
        displayErrorPopup("Потребителско име и парола са задължителни.");
        return;
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        displayErrorPopup(
          `Паролата е твърде къса. Трябва да е поне ${MIN_PASSWORD_LENGTH} символа.`,
        );
        return;
      }

      const usernameExists = storedUsers.some(
        (u: any) => u.username === username,
      );
      if (usernameExists) {
        displayErrorPopup(
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
        displayErrorPopup("Регистрацията е неуспешна. Моля, опитайте отново.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    setPopupMessage("");
    setShowErrorPopup(false);
    setSsoDebugLog("Иницииране на SSO вход с Google...");

    const authUrl = "https://userz.net/auth/google";
    const redirectUrl = "bitpazar://auth/callback"; // Make sure your app.json scheme matches this
    const stateParam = generateRandomId(); // Generate a random ID for state

    let result;
    try {
      setSsoDebugLog(
        (prev) =>
          prev +
          `\nИзпращане на заявка до Google... (state: ${stateParam.substring(0, 5)}...)`,
      );
      result = await WebBrowser.openAuthSessionAsync(
        `${authUrl}?state=${stateParam}`, // Append state parameter
        redirectUrl,
      );
    } catch (error: any) {
      console.error("WebBrowser error:", error);
      displayErrorPopup(
        "Не може да се отвори браузър за вход с Google. Моля, опитайте отново.",
      );
      setSsoDebugLog((prev) => prev + `\nГрешка: ${error.message}`);
      return;
    }

    if (result.type === "success") {
      const urlParams = parseUrlParams(result.url);
      const token = urlParams.token || "FAKE_TOKEN";
      const receivedState = urlParams.state; // Get the state returned from the URL

      if (receivedState !== stateParam) {
        displayErrorPopup(
          "SSO Грешка: Несъответствие на 'state' параметъра. Възможна атака.",
        );
        setSsoDebugLog(
          (prev) => prev + "\nГрешка: Несъответствие на 'state' параметъра.",
        );
        return;
      }

      if (token) {
        setSsoDebugLog(
          (prev) =>
            prev +
            "\nCallback URL получен. Симулация на извличане на данни (1 сек)...",
        );
        // Simulate 1-second iteration fetching "callback"
        setTimeout(() => {
          Alert.alert(
            "Успешен вход с Google (симулиран)",
            "Данните са получени успешно и пренасочени!",
          );
          console.log("Google Auth Token (Simulated):", token);
          setSsoDebugLog(
            (prev) =>
              prev + "\nДанните са извлечени успешно. Пренасочване към чат.",
          );
          router.push("/chat");
        }, 1000);
      } else {
        displayErrorPopup(
          "Входът с Google е неуспешен: Не е получен токен в URL адреса за пренасочване.",
        );
        setSsoDebugLog((prev) => prev + "\nГрешка: Не е получен токен.");
      }
    } else if (result.type === "cancel") {
      displayErrorPopup("Входът с Google е анулиран от потребителя.");
      setSsoDebugLog((prev) => prev + "\nSSO анулиран от потребителя.");
    } else if (result.type === "dismiss") {
      displayErrorPopup(
        "Браузърът за вход с Google е затворен от потребителя.",
      );
      setSsoDebugLog((prev) => prev + "\nSSO браузър затворен от потребителя.");
    } else {
      displayErrorPopup(
        "Входът с Google е неуспешен поради неочаквана грешка.",
      );
      setSsoDebugLog(
        (prev) => prev + "\nSSO неуспешен поради неочаквана грешка.",
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

      {/* Main Vertical ScrollView for rows/sections */}
      <ScrollView
        ref={verticalScrollViewRef}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // Disable manual user vertical scrolling
        contentContainerStyle={{ flexDirection: "column" }}
        className="flex-1"
      >
        {/* Container for Auth Screens (Splash, Login, Register) - First Vertical Row */}
        <View
          className="flex-1"
          style={{ height: deviceHeight, width: deviceWidth }} // Ensure it takes full screen height vertically
        >
          <ScrollView
            ref={horizontalScrollViewRef}
            horizontal={true}
            pagingEnabled={true}
            scrollEnabled={false} // Disable manual user horizontal scrolling
            showsHorizontalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ flexDirection: "row" }}
          >
            {/* Splash Screen Section (first horizontal page) */}
            <View
              className="flex-1 items-center justify-start py-10"
              style={{ height: deviceHeight, width: deviceWidth }}
            >
              <ActivityIndicator size="large" color="#0000ff" />
              <Text className="mt-4 text-gray-800 dark:text-gray-200 text-lg">
                Проверка на състоянието за вход...
              </Text>
            </View>

            {/* Login Section (second horizontal page) */}
            <View
              className="flex-1 items-center justify-start py-10"
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

                {/* Navigation to Register */}
                <TouchableOpacity onPress={scrollToRegisterHorizontal}>
                  <Text className="text-blue-600 text-center text-base mb-2">
                    Нямате профил? Регистрирайте се
                  </Text>
                </TouchableOpacity>
                {/* Navigation to Privacy Policy */}
                <TouchableOpacity onPress={scrollToPrivacyPolicy}>
                  <Text className="text-blue-600 text-center text-base">
                    Политика за поверителност
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Section (third horizontal page) */}
            <View
              className="flex-1 items-center justify-start py-10"
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

                <TouchableOpacity
                  className="w-full bg-blue-600 p-3 rounded-md mb-4"
                  onPress={handleAuth}
                >
                  <Text className="text-white text-center font-bold">
                    Регистриране
                  </Text>
                </TouchableOpacity>

                {/* Navigation to Login */}
                <TouchableOpacity onPress={scrollToLoginHorizontal}>
                  <Text className="text-blue-600 text-center text-base mb-2">
                    Вече имате профил? Вход
                  </Text>
                </TouchableOpacity>
                {/* Navigation to Privacy Policy */}
                <TouchableOpacity onPress={scrollToPrivacyPolicy}>
                  <Text className="text-blue-600 text-center text-base">
                    Политика за поверителност
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Privacy Policy Section - Second Vertical Row */}
        <View
          className="flex-1 items-center justify-start py-10" // Removed background colors
          style={{ height: deviceHeight, width: deviceWidth }}
        >
          <View className="w-full max-w-sm p-6 rounded-lg shadow-md">
            {" "}
            {/* Removed bg-white dark:bg-gray-700 */}
            <Text className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
              Политика за поверителност
            </Text>
            <Text className="text-gray-700 dark:text-gray-300 mb-4 text-base">
              Тази политика за поверителност описва как събираме, използваме и
              защитаваме личната информация, която ни предоставяте при
              използването на нашето приложение.
            </Text>
            <Text className="text-gray-700 dark:text-gray-300 mb-4 text-base">
              Ние се ангажираме да защитаваме вашата поверителност. Вашите данни
              няма да бъдат продавани или споделяни с трети страни без вашето
              изрично съгласие. Използваме стандартни мерки за сигурност, за да
              защитим информацията ви от неоторизиран достъп, промяна или
              унищожаване.
            </Text>
            <Text className="text-gray-700 dark:text-gray-300 mb-6 text-base">
              С използването на приложението вие се съгласявате със събирането и
              използването на информация в съответствие с тази политика.
            </Text>
            {/* Navigation back to Auth Section */}
            <TouchableOpacity
              className="w-full bg-blue-600 p-3 rounded-md"
              onPress={scrollToAuthSection}
            >
              <Text className="text-white text-center font-bold">
                Обратно към Вход/Регистрация
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* SSO Debug Log (Visible only when productionLogin is false) */}
      {!productionLogin && ssoDebugLog.length > 0 && (
        <View className="p-4 bg-gray-700 dark:bg-gray-200 rounded-md mt-4 mx-4 mb-4">
          <Text className="text-white dark:text-gray-900 font-bold mb-2">
            SSO Дневник за отстраняване на грешки:
          </Text>
          <ScrollView className="max-h-24">
            <Text className="text-white dark:text-gray-900 text-sm">
              {ssoDebugLog} x
            </Text>
          </ScrollView>
        </View>
      )}

      {/* Error Popup Modal */}
      {showErrorPopup && (
        <View style={styles.popupOverlay}>
          <View className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-11/12 items-center border-2 border-red-500">
            <Text className="text-red-700 dark:text-red-400 text-center text-lg font-bold mb-4">
              Грешка!
            </Text>
            <Text className="text-gray-800 dark:text-gray-200 text-center text-base mb-6">
              {popupMessage}
            </Text>
            <TouchableOpacity
              className="bg-red-500 px-8 py-3 rounded-md"
              onPress={() => setShowErrorPopup(false)}
            >
              <Text className="text-white font-semibold text-lg">Затвори</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  popupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent black background
    justifyContent: "center", // Center the popup vertically
    alignItems: "center", // Center the popup horizontally
    zIndex: 1000, // Ensure it's on top of other content
  },
});
