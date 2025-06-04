import React, { useState, useEffect, useRef } from "react";
import {
    View,
    TextInput,
    Text,
    Keyboard,
    TouchableWithoutFeedback,
    Platform,
    KeyboardAvoidingView, // Confirmed: Included and correctly used
} from "react-native";
import {
    SafeAreaProvider,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function App() {
    const [textInputValue, setTextInputValue] = useState("");
    const [inputFieldHeight, setInputFieldHeight] = useState(48); // Initial height for the TextInput
    const [isTextInputFocused, setIsTextInputFocused] = useState(false); // Tracks focus for conditional styles

    const textInputRef = useRef(null);
    const insets = useSafeAreaInsets(); // Safe Area insets for KeyboardAvoidingView offset

    const commonFontSize = 16;
    const commonLineHeight = 24;
    const inputVerticalPadding = 12; // Vertical padding inside the input field
    const commonHorizontalPadding = 16; // Horizontal padding inside the input field

    const placeholderText = "Type your message here...";

    // Effect to dismiss keyboard when tapping outside the input
    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener(
            "keyboardDidHide",
            () => {
                // A small timeout ensures focus state is correctly updated after keyboard dismisses
                setTimeout(() => {
                    setIsTextInputFocused(false);
                }, 0);
            },
        );

        return () => {
            keyboardDidHideListener.remove();
        };
    }, []);

    // Function to dismiss the keyboard manually
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    // Callback to update TextInput height based on its content (for multi-line)
    const handleContentSizeChange = (event) => {
        const newHeight = Math.max(
            48, // Minimum height for the input field (like h-12 in Tailwind)
            event.nativeEvent.contentSize.height + 2 * inputVerticalPadding,
        );
        setInputFieldHeight(newHeight);
    };

    // Conditional styles for the border radius based on focus state
    const dynamicBorderRadius = isTextInputFocused
        ? {
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderBottomLeftRadius: 0, // rounded-b-none on focus
              borderBottomRightRadius: 0, // rounded-b-none on focus
          }
        : {
              borderRadius: 8, // Fully rounded when unfocused
          };

    return (
        <SafeAreaProvider style={{ flex: 1 }}>
            <View className="flex-1 flex-col bg-white">
                {/* Top Flex Area: Main Content */}
                <TouchableWithoutFeedback
                    onPress={dismissKeyboard}
                    accessible={false}
                >
                    <View className="flex-1 items-center justify-center p-4">
                        <View className="w-full h-full bg-blue-200 items-center justify-center rounded-lg">
                            <Text className="text-xl font-bold text-blue-800">
                                Main Content Area (Flex-1)
                            </Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>

                {/* Bottom Flex Area: Input Container with KeyboardAvoidingView */}
                <View className="flex-none   bg-white border-t border-gray-200">
                    <KeyboardAvoidingView
                        // Behavior for KeyboardAvoidingView: 'padding' for iOS, default for Android
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                        // Offset for KeyboardAvoidingView to account for safe area insets (e.g., home indicator)
                        keyboardVerticalOffset={insets.bottom}
                        style={{ width: "100%" }} // Ensure KAV takes full width
                    >
                        {/* The TextInput is now the visible, primary input element */}
                        <TextInput
                            ref={textInputRef}
                            placeholder={placeholderText}
                            placeholderTextColor="#888" // Visible placeholder color
                            value={textInputValue}
                            onChangeText={setTextInputValue}
                            multiline={true} // Essential: TextInput always allows multi-line input
                            onContentSizeChange={handleContentSizeChange} // Dynamically adjusts height
                            onFocus={() => {
                                setIsTextInputFocused(true); // Set focus state to true
                                // Optional: clear text on focus if desired, as per previous instructions
                                // setTextInputValue("");
                            }}
                            onBlur={() => setIsTextInputFocused(false)} // Set focus state to false
                            style={[
                                {
                                    // Base styles for the TextInput
                                    borderWidth: 1,
                                    borderColor: "#ccc",
                                    backgroundColor: "#fff",
                                    paddingHorizontal: commonHorizontalPadding,
                                    paddingVertical: inputVerticalPadding,
                                    fontSize: commonFontSize,
                                    color: "#333",
                                    height: inputFieldHeight, // Dynamic height applied
                                    textAlignVertical: "top", // Ensures text starts from the top for multi-line
                                },
                                dynamicBorderRadius, // Apply conditional border radius styles
                            ]}
                        />
                    </KeyboardAvoidingView>
                </View>
            </View>
        </SafeAreaProvider>
    );
}
