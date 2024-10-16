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
import AsyncStorage from "@react-native-async-storage/async-storage";

const Chat = ({ route, navigation, db, auth, isConnected }) => {
  const { name, backgroundColor } = route.params;
  const [messages, setMessages] = useState([]);

  const loadCachedMessages = async () => {
    const cachedMessages = (await AsyncStorage.getItem("messages")) || "[]";
    setMessages(JSON.parse(cachedMessages));
  };

  const cacheMessages = async (messagesToCache) => {
    try {
      await AsyncStorage.setItem("messages", JSON.stringify(messagesToCache));
    } catch (error) {
      console.log("Error caching messages:", error.message);
    }
  };

  useEffect(() => {
    navigation.setOptions({ title: name });
    let unsubMessages;
    if (isConnected === true) {
      // unregister current onSnapshot() listener to avoid registering multiple listeners when
      // useEffect code is re-executed.
      if (unsubMessages) unsubMessages();
      unsubMessages = null;

      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      unsubMessages = onSnapshot(q, (querySnapshot) => {
        const newMessages = querySnapshot.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
          createdAt: new Date(doc.data().createdAt.toMillis()),
        }));
        setMessages(newMessages);
        cacheMessages(newMessages);
      });
    } else {
      loadCachedMessages();
    }

    // Clean up code
    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, [isConnected]);

  const onSend = (newMessages = []) => {
    addDoc(collection(db, "messages"), {
      ...newMessages[0],
      createdAt: new Date(),
      user: {
        _id: auth.currentUser.uid,
        name: name,
      },
    });
  };

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
            color: "#707070",
          },
        }}
      />
    );
  };

  const renderInputToolbar = (props) => {
    if (isConnected) {
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
    } else {
      return null;
    }
  };

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
          user={{
            _id: auth.currentUser.uid,
            name: name,
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
