import React, { useState, useRef, useEffect } from "react";
import { View, getScaledValue } from "./native";
import {
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  focused: boolean;
  isLoading?: boolean;
  placeholder?: string;
  isFirstMessage?: boolean;
}
const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  focused,
  isLoading = false,
  placeholder = "Type a message...",
}) => {
  const [message, setMessage] = useState("");
  const [hasNewlines, setHasNewlines] = useState(false);
  const animatedValue = useRef(new Animated.Value(100)).current;
  const maxInputHeight = getScaledValue(15) * 1.2 * 5 + getScaledValue(15); // ~112px

  useEffect(() => {
    // Animate the input sliding up when component mounts
    Animated.spring(animatedValue, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTextChange = (text: string) => {
    setMessage(text);

    // Check for actual newlines OR artificial newlines based on length
    const hasActualNewlines = text.includes("\n");
    const charactersPerLine = 35; // Approximate characters that fit in one line
    const hasLongText = text.length > charactersPerLine;
    setHasNewlines(hasActualNewlines || hasLongText);
  };

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      // Create a slight bounce animation when sending
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(animatedValue, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
      onSendMessage(message.trim());
      setMessage("");
      setHasNewlines(false); // Reset state
      Keyboard.dismiss();
    }
    setMessage("");
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateY: animatedValue }],
      }}
    >
      <View
        margin={focused ? [0, 0, 0, 0] : [0, 30, 20, 30]}
        className={[
          "dark:bg-apple-dark-grouped  bg-gray-100",
          focused
            ? "rounded-none overflow-hidden"
            : "overflow-hidden rounded-full",
        ].join(" ")}
      >
        <View
          className={["flex-row items-center  relative"].join(" ")}
          style={{
            padding: focused ? 0 : 0,
          }}
        >
          <TextInput
            className={[
              `flex-1 text-gray-900 dark:text-gray-100  bg-gray-100 dark:bg-apple-dark-grouped`,
            ].join(" ")}
            value={message}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={1000}
            editable={!isLoading}
            style={{
              fontSize: getScaledValue(14),
              padding: getScaledValue(14),
              maxHeight: maxInputHeight,
              textAlignVertical: "top", // Align text to top for multiline
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={isLoading || !message.trim()}
            activeOpacity={0.5}
          >
            <View
              padding={[10, 10, 10, 10]}
              className={`rounded-full  ${
                message.trim() && !isLoading
                  ? `${hasNewlines ? "rounded-md" : "rounded-full bg-blue-500"}`
                  : ""
              }`}
              style={{
                elevation: 2,
                alignSelf: hasNewlines ? "flex-end" : "center", // Position button appropriately
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons
                  name="send"
                  size={20}
                  color={message.trim() ? "#FFFFFF" : "#9CA3AF"}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default ChatInput;
