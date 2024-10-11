import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";

const Chat = ({ route, navigation }) => {
  const { name, backgroundColor } = route.params;
  const [messages, setMessages] = useState([]);

  // Function to handle sending messages
  const onSend = (newMessages) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  };

  useEffect(() => {
    // Set initial messages
    setMessages([
      {
        _id: 1,
        text: "Hello developer",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "React Native",
          avatar: "https://placeimg.com/140/140/any",
        },
      },
      {
        _id: 2,
        text: `Welcome to the chat, ${name}!`,
        createdAt: new Date(),
        system: true,
      },
    ]);

    // Set the navigation title
    navigation.setOptions({ title: name });
  }, []);

  // Custom rendering for chat bubbles
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#008ac2",
          },
          left: {
            backgroundColor: "#FFF",
          },
        }}
      />
    );
  };

  // Render the input field
  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        textInputStyle={styles.textInput}
        textInputProps={{
          placeholder: "Type a message...",
        }}
      />
    );
  };

  // iOS keyboard appearance handling, android = default
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        {/* GiftedChat component for rendering the chat interface */}
        <GiftedChat
          messages={messages}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: 1,
          }}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputToolbar: {
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    backgroundColor: "#FFFFFF",
  },
  textInput: {
    color: "#000000",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 16,
  },
});

export default Chat;
