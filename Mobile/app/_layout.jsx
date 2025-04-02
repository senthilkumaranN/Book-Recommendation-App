import { Stack, useRouter, useSegments, Slot, SplashScreen } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../component/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "../Store/AuthStore";
import { useEffect, useState } from "react";
import { loadUser } from "@/Slice/AuthSlice";
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AuthHandler />
        <SafeScreen>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
          </Stack>
        </SafeScreen>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </Provider>
  );
}

// ✅ Handle authentication and navigation properly
function AuthHandler() {
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [isAppMounted, setIsAppMounted] = useState(false); // ✅ Prevent premature navigation

  useEffect(() => {
    dispatch(loadUser())
      .unwrap()
      .finally(() => {
        setIsAppMounted(true); // ✅ Mark app as mounted after user data is loaded
      });
  }, []);

  useEffect(() => {
    if (!isAppMounted) return; // ✅ Wait until the app is fully mounted

    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;

    if (!isSignedIn && !inAuthScreen) {
      router.replace("/(auth)/Login"); // ✅ Redirect to login only after mount
    } else if (isSignedIn && inAuthScreen) {
      router.replace("/(tabs)/profile"); // ✅ Redirect to home after login
    }
  }, [isAppMounted, user, token, segments]);

  return <></>; // ✅ Prevents navigation before mounting
}
