import { TouchableOpacity, Text, View, StyleSheet, Alert } from "react-native";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CustomActions = ({
  wrapperStyle,
  iconTextStyle,
  onSend,
  storage,
  userID,
}) => {
  const actionSheet = useActionSheet();

  // Show action sheet with 4 button options
  const onActionPress = () => {
    const options = [
      "Choose From Library",
      "Take Picture",
      "Send Location",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;
    actionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            pickImage();
            return;
          case 1:
            takePhoto();
            return;
          case 2:
            getLocation();
          default:
        }
      }
    );
  };

  // Generate unique filename for uploaded images
  // Uses userID and timestamp to ensure uniqueness
  const generateReference = (uri) => {
    // This will get the file name from the uri
    const imageName = uri.split("/")[uri.split("/").length - 1];
    const timeStamp = new Date().getTime();
    return `${userID}-${timeStamp}-${imageName}`;
  };

  // Device location picker
  const getLocation = async () => {
    let permissions = await Location.requestForegroundPermissionsAsync();
    if (permissions?.granted) {
      const location = await Location.getCurrentPositionAsync({});
      if (location) {
        onSend({
          location: {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
          },
        });
      } else Alert.alert("Error occurred while fetching location");
    } else Alert.alert("Permissions haven't been granted.");
  };

  // Handle image upload process and send message with image URL
  const uploadAndSendImage = async (imageURI) => {
    try {
      const uniqueRefString = generateReference(imageURI);
      const newUploadRef = ref(storage, uniqueRefString);
      const response = await fetch(imageURI);
      const blob = await response.blob();
      const snapshot = await uploadBytes(newUploadRef, blob);
      const imageURL = await getDownloadURL(snapshot.ref);

      onSend({
        _id: uniqueRefString,
        createdAt: new Date(),
        user: {
          _id: userID,
          name: "User",
        },
        image: imageURL,
      });
    } catch (error) {
      console.error("Error uploading image", error);
      Alert.alert("Error uploading image", error.message);
    }
  };

  // Function to choose an image from the gallery
  const pickImage = async () => {
    let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissions?.granted) {
      let result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) {
        await uploadAndSendImage(result.assets[0].uri);
      } else Alert.alert("Permissions haven't been granted.");
    }
  };

  // Function to take a selfy or front camera photo
  const takePhoto = async () => {
    let permissions = await ImagePicker.requestCameraPermissionsAsync();
    if (permissions?.granted) {
      let result = await ImagePicker.launchCameraAsync();
      if (!result.canceled) {
        await uploadAndSendImage(result.assets[0].uri);
      }
    } else {
      Alert.alert("Permissions haven't been granted.");
    }
  };

  // Button wrapper
  return (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel="Select optional actions"
      accessibilityHint="Choose to send an image or your location."
      accessibilityRole="button"
      style={styles.container}
      onPress={onActionPress}
    >
      <View style={[styles.wrapper, wrapperStyle]}>
        <Text style={[styles.iconText, iconTextStyle]}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 10,
    backgroundColor: "transparent",
    textAlign: "center",
  },
});

export default CustomActions;
