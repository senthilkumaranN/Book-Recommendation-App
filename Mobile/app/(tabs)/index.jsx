import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBooks } from "../../Slice/BookSlice";
import styles from "../../assets/Styles/home.style";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../Constant/colors";
import { formatPublishDate } from "../../lib/utils";

export default function BookList() {
  const dispatch = useDispatch();
  const { books, loading, error, page, hasMore } = useSelector(
    (state) => state.books
  );
  const [refreshing, setRefreshing] = useState(false);

  const renderRatingPicker = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          style={{ marginRight: 2 }}
          size={16}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
        />
      );
    }
    return stars;
  };

  // Pull-to-refresh handler
    const onRefresh = async () => {
      setRefreshing(true);
      await dispatch(fetchBooks({page: 1, limit: 3}));
      setRefreshing(false);
    };

  useEffect(() => {
    if (books.length === 0) {
      dispatch(fetchBooks({ page: 1, limit: 3 }));
    }
  }, [dispatch, books.length]);

  const renderItem = ({ item }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          {item?.user?.profileImage ? (
            <Image
              source={{ uri: item.user.profileImage }}
              style={styles.avatar}
            />
          ) : (
            <Text>No Profile Image</Text>
          )}
          <Text style={styles.username}>
            {item?.user?.username || "Unknown User"}
          </Text>
        </View>
      </View>

      <View style={styles.bookImageContainer}>
        {item?.image ? (
          <Image source={item.image} style={styles.bookImage} />
        ) : (
          <Text>No Image Available</Text>
        )}
      </View>

      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingPicker(item.rating)}
        </View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>
          Shared on {formatPublishDate(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  const loadMoreBooks = () => {
    if (!loading && hasMore) {
      dispatch(fetchBooks({ page: page + 1, limit: 3 }));
    }
  };

  return (
    <View style={styles.container}>
      {loading && books.length === 0 ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : books.length === 0 ? (
        <Text style={styles.emptyText}>No books available.</Text>
      ) : (
        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString() || item._id?.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreBooks}
          onEndReachedThreshold={0.1}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0000ff"]}
            />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>BookAddict</Text>
              <Text style={styles.headerSubtitle}>
                Discover great reads from the community
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="book-outline"
                size={100}
                color={COLORS.textSecondary}
              />
              <Text style={styles.emptyText}>No recommendations yet</Text>
              <Text style={styles.emptySubtext}>
                Be the first to share a book
              </Text>
            </View>
          }
          ListFooterComponent={
            loading &&
            hasMore && <ActivityIndicator size="small" color="#0000ff" />
          }
        />
      )}
    </View>
  );
}
