import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Animated, Dimensions, StyleSheet } from 'react-native';
import ChatInput from './ChatInput';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function ChatInputExample() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      isUser: false,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const { height } = Dimensions.get('window');

  useEffect(() => {
    // Initial animation to show the welcome screen
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSendMessage = async (text: string) => {
    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    // If this is the first user message, animate the welcome section out
    if (messages.length === 1) {
      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: -height,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start(() => {
        setWelcomeVisible(false);
      });
    }
    
    // Simulate AI response with loading state
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I received your message: "${text}"`,
        isUser: false,
      };
      
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 relative">
        {welcomeVisible && (
          <Animated.View
            style={[
              styles.welcomeContainer,
              {
                transform: [{ translateY: animatedValue }],
                opacity: opacityValue
              }
            ]}
          >
            <Text className="text-3xl font-bold text-center mb-4 text-blue-500">
              Welcome to AI Chat
            </Text>
            <Text className="text-lg text-center text-gray-700 mb-8">
              Ask me anything and I'll try to help you!
            </Text>
            <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-8">
              <Text className="text-2xl">🤖</Text>
            </View>
            <Text className="text-base text-gray-500 text-center">
              Type your first message below to get started
            </Text>
          </Animated.View>
        )}
        
        <ScrollView 
          className="flex-1 p-4" 
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {messages.map((message) => (
            <View 
              key={message.id}
              className={`mb-4 max-w-[80%] rounded-2xl p-3 ${
                message.isUser 
                  ? 'bg-blue-500 self-end' 
                  : 'bg-gray-200 self-start'
              }`}
            >
              <Text 
                className={`text-base ${
                  message.isUser ? 'text-white' : 'text-gray-800'
                }`}
              >
                {message.text}
              </Text>
            </View>
          ))}
        </ScrollView>
        
        <ChatInput 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder="Ask me anything..."
          isFirstMessage={messages.length <= 1}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  welcomeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  }
});