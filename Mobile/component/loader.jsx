import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import COLORS from "../Constant/colors";
import styles from "../assets/Styles/profile.style";

const Loader = ({ visible = false, text = "Loading..." }) => {
  if (!visible) return null;

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};



export default Loader;
