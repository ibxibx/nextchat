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

  // Console logs to debug props
  console.log("CustomActions Props:", { onSend, storage, userID });
  // Show action sheet with options for sending media
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

  // Generate unique filename for uploaded images
  // Uses userID and timestamp to ensure uniqueness
  const generateReference = (uri) => {
    // this will get the file name from the uri
    const imageName = uri.split("/")[uri.split("/").length - 1];
    const timeStamp = new Date().getTime();
    return `${userID}-${timeStamp}-${imageName}`;
  };

  // Handle image upload process and send message with image URL
  const uploadAndSendImage = async (imageURI) => {
    try {
      console.log("Starting image upload...");
      console.log("Image URI:", imageURI);

      const uniqueRefString = generateReference(imageURI);
      console.log("Generated reference:", uniqueRefString);

      const newUploadRef = ref(storage, uniqueRefString);
      console.log("Created storage reference");

      const response = await fetch(imageURI);
      console.log("Fetched image");

      const blob = await response.blob();
      console.log("Created blob");

      // Convert image URI to blob for Firebase Storage
      await uploadBytes(newUploadRef, blob);
      console.log("Uploaded bytes");

      const imageURL = await getDownloadURL(newUploadRef);
      console.log("Got download URL:", imageURL);

      if (typeof onSend !== "function") {
        console.error("onSend is not a function:", onSend);
        Alert.alert("Error", "Cannot send message at this time");
        return;
      }

      onSend({ image: imageURL });
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error in uploadAndSendImage:", error);
      Alert.alert("Error", "Failed to upload and send image: " + error.message);
    }
  };

  const pickImage = async () => {
    try {
      let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissions?.granted) {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });

        if (!result.canceled) {
          console.log("Image picked:", result.assets[0].uri);
          await uploadAndSendImage(result.assets[0].uri);
        }
      } else {
        Alert.alert("Permissions haven't been granted.");
      }
    } catch (error) {
      console.error("Error in pickImage:", error);
      Alert.alert("Error", "Failed to pick image: " + error.message);
    }
  };

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

  return (
    <TouchableOpacity style={styles.container} onPress={onActionPress}>
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
