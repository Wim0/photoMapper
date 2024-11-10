import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#97572B",
        headerStyle: {
          backgroundColor: "#F5F5DC",
        },
        headerShadowVisible: false,
        headerTintColor: "#97572B",
        tabBarStyle: {
          backgroundColor: "#F5F5DC",
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home-sharp" : "home-outline"} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="takePhoto"
        options={{
          title: "Take Photo",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "camera-sharp" : "camera-outline"} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "information-circle" : "information-circle-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
