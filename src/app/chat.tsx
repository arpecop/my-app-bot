//import { Link } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text } from "../components/native";
import {
    ScrollView,
    KeyboardAvoidingView,
    Keyboard,
    Dimensions,
    Platform,
} from "react-native";

import ChatInput from "../components/ChatInput";

interface Message {
    id: string;
    text: string;
    isUser: boolean;
}

export default function Page() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Hello! How can I help you today?",
            isUser: false,
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [focused, setFocused] = useState(false);

    const handleSendMessage = async (text: string) => {
        // Add user message to the chat
        const userMessage: Message = {
            id: Date.now().toString(),
            text,
            isUser: true,
        };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setIsLoading(true);
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

    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            setFocused(true);
        });
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            setFocused(false);
        });
        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);
    //height
    return (
        <View className="flex-1">
            <StatusBar style="auto" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="flex flex-1 bg-gray-200 dark:bg-gray-900"
            >
                <Header />
                <Content messages={messages} />
                <Footer
                    handleSendMessage={handleSendMessage}
                    focused={focused}
                />
            </KeyboardAvoidingView>
        </View>
    );
}

function Content({ messages }: { messages: Message[] }) {
    const scrollViewRef = useRef<ScrollView>(null);
    const previousMessageCount = useRef(messages.length);
    const screenHeight = Dimensions.get("window").height;
    const maxMessageHeight = screenHeight * 0.8;
    const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
        new Set(),
    );

    // Scroll to bottom when new message arrives
    useEffect(() => {
        if (messages.length > previousMessageCount.current) {
            const newestMessage = messages[messages.length - 1];
            const isLongMessage = newestMessage.text.length > 200;
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });

                // After scrolling, expand long messages
                if (isLongMessage) {
                    setTimeout(() => {
                        setExpandedMessages((prev) =>
                            new Set(prev).add(newestMessage.id),
                        );
                    }, 600); // Wait for scroll animation to complete
                }
            }, 100);
        }
        previousMessageCount.current = messages.length;
    }, [messages]);

    return (
        <View className="flex-1">
            <ScrollView
                ref={scrollViewRef}
                className="flex-1 p-4"
                contentContainerStyle={{
                    paddingBottom: 10,
                    flexGrow: 1,
                    justifyContent:
                        messages.length === 1 ? "flex-start" : "flex-end",
                }}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((message) => {
                    const isLongMessage = message.text.length > 200;
                    const isExpanded = expandedMessages.has(message.id);

                    if (isLongMessage && !isExpanded) {
                        return (
                            <View
                                key={message.id}
                                className={`max-w-[80%] rounded-2xl ${
                                    message.isUser
                                        ? "bg-blue-500 self-end"
                                        : "bg-gray-100 self-start"
                                }`}
                                style={{ height: maxMessageHeight }}
                            >
                                <ScrollView
                                    showsVerticalScrollIndicator={true}
                                    nestedScrollEnabled={true}
                                >
                                    <Text
                                        className={`text-sm ${
                                            message.isUser
                                                ? "text-white"
                                                : "text-gray-800"
                                        }`}
                                    >
                                        {message.text}
                                    </Text>
                                </ScrollView>
                            </View>
                        );
                    }

                    return (
                        <View
                            key={message.id}
                            margin={[10, 0, 0, 10]}
                            className={`max-w-[80%] rounded-2xl ${
                                message.isUser
                                    ? "bg-blue-500 self-end"
                                    : "bg-gray-100 self-start"
                            }`}
                        >
                            {isLongMessage ? (
                                // Expanded long message - no height constraint
                                <View className="p-3">
                                    <Text
                                        fontSize={18}
                                        className={
                                            message.isUser
                                                ? "text-white dark:text-gray-100"
                                                : "text-gray-800 dark:text-gray-100"
                                        }
                                    >
                                        {message.text}
                                    </Text>
                                </View>
                            ) : (
                                // Short message
                                <Text
                                    fontSize={18}
                                    padding={[12, 12, 12, 12]}
                                    className={`text-sm ${
                                        message.isUser
                                            ? "text-white"
                                            : "text-gray-800"
                                    }`}
                                >
                                    {message.text}
                                </Text>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

function Header() {
    return <View height={42} />;
}

function Footer({
    handleSendMessage,
    focused,
}: {
    handleSendMessage: (message: string) => void;
    focused: boolean;
}) {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <View className="flex shrink-0 w-full">
            <ChatInput
                focused={focused}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                placeholder="Ask me anything..."
            />
        </View>
    );
}
