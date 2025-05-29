import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { ChatInputExample } from "../components";

export default function ChatScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "AI Chat",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#f8fafc",
          },
          headerShadowVisible: false,
        }}
      />
      <ChatInputExample />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
