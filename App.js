import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import {
  getFirestore,
  disableNetwork,
  enableNetwork,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox, Alert } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { getStorage } from "firebase/storage";

import Start from "./components/Start";
import Chat from "./components/Chat";

// Ignore specific LogBox warnings
LogBox.ignoreLogs(["AsyncStorage has been extracted from"]);
LogBox.ignoreLogs(["@firebase/auth"]);

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvONhbriPLGztGhdVW6FnUTxJPoEIKa6s",
  authDomain: "nextchat-89c47.firebaseapp.com",
  projectId: "nextchat-89c47",
  storageBucket: "nextchat-89c47.appspot.com",
  messagingSenderId: "303424599896",
  appId: "1:303424599896:web:07cd9b8c55c07bc208d72d",
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth only if not already initialized
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Create stack navigator
const Stack = createNativeStackNavigator();

const App = () => {
  const connectionStatus = useNetInfo();

  // Monitor and handle connection status
  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert("Connection Lost!");
      disableNetwork(db);
    } else if (connectionStatus.isConnected === true) {
      enableNetwork(db);
    }
  }, [connectionStatus.isConnected]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen
          name="Start"
          component={Start}
          options={{
            title: "Welcome",
          }}
        />
        <Stack.Screen
          name="Chat"
          options={{
            title: "Chat Room",
          }}
        >
          {(props) => (
            <Chat
              isConnected={connectionStatus.isConnected}
              db={db}
              storage={storage}
              auth={auth}
              {...props}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
