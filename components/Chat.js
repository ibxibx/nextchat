import React, { useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";

const Chat = ({ route, navigation }) => {
  const { name, backgroundColor } = route.params;

  const setNavigationOptions = useCallback(() => {
    navigation.setOptions({ title: name });
  }, [navigation, name]);

  useEffect(() => {
    setNavigationOptions();
  }, [setNavigationOptions]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: backgroundColor || "#FFFFFF" },
      ]}
    >
      {/* Chat components will be added here in future steps */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Chat;
