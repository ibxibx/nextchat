import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { initializeApp } from "firebase/app";
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

LogBox.ignoreLogs(["AsyncStorage has been extracted from"]);
LogBox.ignoreLogs(["@firebase/auth"]);

const Stack = createNativeStackNavigator();

const App = () => {
  const netInfo = useNetInfo();
  const [isConnected, setIsConnected] = useState(null);
  const app = useRef(null);
  const auth = useRef(null);
  const db = useRef(null);
  const storage = useRef(null);

  const firebaseConfig = {
    apiKey: "AIzaSyDvONhbriPLGztGhdVW6FnUTxJPoEIKa6s",
    authDomain: "nextchat-89c47.firebaseapp.com",
    projectId: "nextchat-89c47",
    storageBucket: "nextchat-89c47.appspot.com",
    messagingSenderId: "303424599896",
    appId: "1:303424599896:web:07cd9b8c55c07bc208d72d",
  };

  useEffect(() => {
    // Initialize Firebase only once
    if (!app.current) {
      app.current = initializeApp(firebaseConfig);

      // Initialize Firebase Auth with AsyncStorage
      if (!auth.current) {
        try {
          auth.current = initializeAuth(app.current, {
            persistence: getReactNativePersistence(AsyncStorage),
          });
        } catch (error) {
          // If auth is already initialized, just get the instance
          if (error.code === "auth/already-initialized") {
            auth.current = getAuth(app.current);
          } else {
            console.error("Error initializing auth:", error);
          }
        }
      }

      // Initialize Cloud Firestore
      if (!db.current) {
        db.current = getFirestore(app.current);
      }

      // Initialize Firebase Storage
      if (!storage.current) {
        storage.current = getStorage(app.current);
      }
    }
  }, []);

  useEffect(() => {
    console.log("NetInfo state: ", netInfo);
    setIsConnected(netInfo.isConnected);

    if (netInfo.isConnected === false) {
      Alert.alert("Connection Lost!");
      if (db.current) {
        disableNetwork(db.current).catch((error) =>
          console.log("Error disabling Firestore network:", error)
        );
      }
    } else if (netInfo.isConnected === true) {
      if (db.current) {
        enableNetwork(db.current).catch((error) =>
          console.log("Error enabling Firestore network:", error)
        );
      }
    }
  }, [netInfo.isConnected]);

  if (
    isConnected === null ||
    !auth.current ||
    !db.current ||
    !storage.current
  ) {
    return null; // or a loading spinner
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start">
          {(props) => <Start auth={auth.current} {...props} />}
        </Stack.Screen>
        <Stack.Screen name="Chat">
          {(props) => (
            <Chat
              isConnected={isConnected}
              db={db.current}
              storage={storage.current}
              auth={auth.current}
              {...props}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
