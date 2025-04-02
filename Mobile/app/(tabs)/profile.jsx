import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteBook, fetchUserBooks } from "../../Slice/BookSlice";
import styles from "../../assets/Styles/profile.style";
import ProfileHeader from "../../component/ProfileHeader";
import LogoutButton from "../../component/LogoutButton";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../Constant/colors";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import Loader from "../../component/loader";

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { books, loading: booksLoading } = useSelector((state) => state.books);
  const [deleteBookId, setDeleteBookId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchUserBooks());
    setRefreshing(false);
  };

  const renderRatingPicker = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Ionicons
        key={i}
        name={i < rating ? "star" : "star-outline"}
        style={{ marginRight: 2 }}
        size={16}
        color={i < rating ? "#f4b400" : COLORS.textSecondary}
      />
    ));
  };

  const handleDeleteBook = async (bookId) => {
    if (!bookId) {
      console.error("Error: bookId is undefined");
      return;
    }
    setDeleteBookId(bookId); // Set ID to disable delete button
    await dispatch(deleteBook(bookId));
    dispatch(fetchUserBooks()); // Refresh list after deletion
    setDeleteBookId(null); // Reset after deletion
  };

  const confirmDelete = (bookId) => {
    Alert.alert(
      "Delete Recommendation",
      "Are you sure you want to delete this recommendation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => handleDeleteBook(bookId),
          style: "destructive",
        },
      ]
    );
  };

  useEffect(() => {
    dispatch(fetchUserBooks());
  }, [dispatch]);

  const renderBookItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/150" }}
        style={styles.bookImage}
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingPicker(item.rating)}
        </View>
      </View>
      <Text style={styles.bookCaption} numberOfLines={2}>
        {item.caption}
      </Text>
      <Text style={styles.bookDate}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>

      {/* Show Loader or Trash Icon */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item._id)}
        disabled={deleteBookId === item._id} // Disable button while deleting
      >
        {deleteBookId === item._id ? (
          <ActivityIndicator size="small" color={COLORS.primary} /> // Show loader during deletion
        ) : (
          <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    </View>
  );

  // Show Loader when books are loading
  if (booksLoading && !refreshing) return <Loader visible={true} text="Loading books..." />;

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />

      <View style={styles.booksHeader}>
        <Text style={styles.booksTitle}>Your Recommendations</Text>
        <Text style={styles.booksCount}>
          {Array.isArray(books) ? books.length : 0} books
        </Text>
      </View>

      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id?.toString() || item.id?.toString()}
        contentContainerStyle={styles.booksList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0000ff"]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={100} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No recommendations yet</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/create")}>
              <Text style={styles.addButtonText}>Add your First Book</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
