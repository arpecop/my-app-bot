import { Link } from "expo-router";
import React, { useState } from "react";
import { Text, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatInput from "../components/ChatInput";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

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

  const handleSendMessage = async (text: string) => {
    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

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
  let colorScheme = useColorScheme();

  return (
    <View
      className="flex flex-1"
      style={{
        backgroundColor: colorScheme === "dark" ? "#121212" : "#fff",
      }}
    >
      <Header />
      <Content messages={messages} colorScheme={colorScheme} />
      <Footer handleSendMessage={handleSendMessage} />
    </View>
  );
}

function Content({
  messages,
  colorScheme,
}: {
  messages: Message[];
  colorScheme: string;
}) {
  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{
          paddingBottom: 20,
          backgroundColor: colorScheme === "dark" ? "#121212" : "#fff",
        }}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            className={`mb-4 max-w-[80%] rounded-2xl p-3 ${
              message.isUser ? "bg-blue-500 self-end" : "bg-gray-200 self-start"
            }`}
          >
            <Text
              className={`text-base ${
                message.isUser ? "text-white" : "text-gray-800"
              }`}
            >
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View className="py-12 md:py-24 lg:py-32 xl:py-48 absolute">
        <View className="px-4 md:px-6">
          <View className="flex flex-col items-center gap-4 text-center">
            <Text
              role="heading"
              className="text-3xl text-center native:text-5xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Welcome to Project ACME {colorScheme}
            </Text>
            <Text className="mx-auto max-w-[700px] text-lg text-center text-gray-500 md:text-xl dark:text-gray-400">
              Discover and collaborate on acme. Explore our services now.
            </Text>
            <Link
              suppressHighlighting
              className="flex h-9 items-center justify-center overflow-hidden rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 web:shadow ios:shadow transition-colors hover:bg-gray-900/90 active:bg-gray-400/90 web:focus-visible:outline-none web:focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
              href="/chat"
            >
              Explore
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}

function Header() {
  const { top } = useSafeAreaInsets();
  return <View style={{ paddingTop: top }}></View>;
}

function Footer({
  handleSendMessage,
}: {
  handleSendMessage: (message: string) => void;
}) {
  const { bottom } = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <View
      className="flex shrink-0 bg-gray-100"
      //style={{ paddingBottom: bottom }}
    >
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder="Ask me anything..."
      />
    </View>
  );
}
