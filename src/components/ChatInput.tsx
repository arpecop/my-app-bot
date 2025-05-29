import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  isFirstMessage?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Type a message...",
}) => {
  const [message, setMessage] = useState("");
  const [hasNewlines, setHasNewlines] = useState(false);
  const animatedValue = useRef(new Animated.Value(100)).current;

  // Approximate height for 5 lines (base font size * line height * lines + padding)
  const maxInputHeight = 16 * 1.2 * 5 + 16; // ~112px

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
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateY: animatedValue }],
      }}
      className="dark:bg-zinc-900 bg-white px-4 py-2"
    >
      <View
        className={`flex-row items-center bg-gray-100 dark:bg-slate-900 px-4 ${
          hasNewlines ? "rounded-md" : "rounded-full"
        }`}
      >
        <TextInput
          className="flex-1 py-2 text-base text-gray-900 dark:text-white dark:bg-slate-900"
          value={message}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={1000}
          editable={!isLoading}
          style={{
            maxHeight: maxInputHeight,
            textAlignVertical: "top", // Align text to top for multiline
          }}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={isLoading || !message.trim()}
          className={`rounded-full p-2 absolute right-0 ${
            message.trim() && !isLoading
              ? "bg-blue-500"
              : "bg-gray-300 dark:bg-slate-800"
          }`}
          activeOpacity={0.5}
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
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default ChatInput;
