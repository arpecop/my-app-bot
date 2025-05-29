import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  isFirstMessage?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = 'Type a message...',
  isFirstMessage = true,
}) => {
  const [message, setMessage] = useState('');
  const animatedValue = useRef(new Animated.Value(100)).current;
  
  useEffect(() => {
    // Animate the input sliding up when component mounts
    Animated.spring(animatedValue, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

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
        })
      ]).start();
      
      onSendMessage(message.trim());
      setMessage('');
      Keyboard.dismiss();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="w-full"
    >
      <Animated.View
        style={{
          transform: [{ translateY: animatedValue }],
        }}
        className="border-t border-gray-200 bg-white px-4 py-2"
      >
        <View className="flex-row items-center rounded-full bg-gray-100 px-4">
          <TextInput
            className="flex-1 py-2 text-base text-gray-900"
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={1000}
            editable={!isLoading}
          />
          
          <TouchableOpacity
            onPress={handleSend}
            disabled={isLoading || !message.trim()}
            className={`ml-2 rounded-full p-2 ${
              message.trim() && !isLoading ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            activeOpacity={0.5}
            style={{ elevation: 2 }}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons 
                name="send" 
                size={20} 
                color={message.trim() ? '#FFFFFF' : '#9CA3AF'} 
              />
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default ChatInput;