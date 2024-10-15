import React, { useState, useEffect } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const Chat = ({ route, navigation, db, auth }) => {
  const { userID, name, backgroundColor } = route.params;
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    navigation.setOptions({ title: name });

    // Set up the user object
    if (auth.currentUser) {
      setUser({
        _id: auth.currentUser.uid,
        name: name,
      });
    }

    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          user: doc.data().user || { _id: "unknown", name: "Unknown" },
        }))
      );
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  // Function to handle sending messages
  const onSend = (newMessages = []) => {
    const message = newMessages[0];
    if (user) {
      addDoc(collection(db, "messages"), {
        ...message,
        createdAt: new Date(),
        user: user,
      });
    }
  };

  // Custom rendering for chat bubbles
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#c1f6f7",
          },
          left: {
            backgroundColor: "#FFF",
          },
        }}
        textStyle={{
          right: {
            color: "#000",
          },
        }}
        timeTextStyle={{
          right: {
            color: "#55555",
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

  if (!user) {
    return null; // or a loading indicator
  }

  // iOS keyboard appearance handling, android = default
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <GiftedChat
          messages={messages}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          onSend={(messages) => onSend(messages)}
          user={user}
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
