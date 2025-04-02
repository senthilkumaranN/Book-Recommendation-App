import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image, // ✅ Import Image
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker"; // ✅ Import ImagePicker
import styles from "../../assets/Styles/create.style";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../Constant/colors";
import { useDispatch, useSelector } from "react-redux";
import { addBook, uploadImage } from "../../Slice/BookSlice";
import { useNavigation } from "@react-navigation/native";

export default function Create() {
  // ✅ Capitalized function name
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ Fixed state setter

  const { token } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [imageUploading, setImageUploading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !caption || !rating) {
      Alert.alert("Missing Fields", "Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;

      // Upload Image First
      if (image) {
        setImageUploading(true);
        const response = await dispatch(uploadImage({ image, token })).unwrap();
        setImageUploading(false);

        if (!response) {
          throw new Error("Image upload failed.");
        }

        imageUrl = response; // Directly assign response (not response?.url)
      }

      // Now Add Book
      const bookResponse = await dispatch(
        addBook({ bookData: { title, caption, image: imageUrl,rating }, token })
      ).unwrap();

      if (!bookResponse.success) {
        throw new Error(bookResponse.message || "Failed to add book.");
      }

      Alert.alert("Success", "Book added successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setImageUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "We need camera roll permissions to upload an image"
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        console.log("Selected Image URI:", result.assets[0].uri);

      }
    } catch (error) {
      console.log("Error picking image", error);
      Alert.alert("Error", "There was a problem selecting your image");
    }
  };

  const renderRatingPicker = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "android" ? "height" : "padding"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollViewStyle}
      >
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Book Recommendation</Text>
            <Text style={styles.subtitle}>
              Share your favorite reads with others
            </Text>
          </View>

          <View style={styles.form}>
            {/* Book Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Title</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter book title"
                  placeholderTextColor={COLORS.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/* Rating */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Rating</Text>
              {renderRatingPicker()}
            </View>

            {/* Book Image Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Image</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons
                      name="image-outline"
                      size={40}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.placeholderText}>
                      Tap to select image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Caption */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Caption</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Write your review or thoughts about this book..."
                placeholderTextColor={COLORS.placeholderText}
                value={caption}
                onChangeText={setCaption}
                multiline
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.button,
                (loading || imageUploading) && { opacity: 0.5 },
              ]}
              onPress={handleSubmit}
              disabled={loading || imageUploading}
            >
              {loading || imageUploading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Share</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
