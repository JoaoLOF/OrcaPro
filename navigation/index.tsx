import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useAuthStore } from "../stores/authStores";
import { UserService } from "../services/userService";
import ProfileSettingsScreen from "../screens/ProfileSettingsScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import CreateBudgetScreen from "../screens/CreateBudgetScreen";
import CreateClientScreen from "../screens/CreateClientScreen";
import BudgetDetailsScreen from "../screens/BudgetDetailsScreen";
import ClientsListScreen from "../screens/ClientsListScreen";
import ClientDetailScreen from "../screens/ClientDetailScreen";

const userService = new UserService();

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateBudget: undefined;
  CreateClient: undefined;
  BudgetDetails: { budgetId: string };
  ProfileSettings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await userService.getSession();

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
        });
      }
    } catch (error) {
      console.error("Erro ao verificar sessão:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                animation: "slide_from_left",
              }}
            />
            <Stack.Screen name="CreateBudget" component={CreateBudgetScreen} />
            <Stack.Screen
              name="BudgetDetails"
              component={BudgetDetailsScreen}
            />
            <Stack.Screen
              name="ProfileSettings"
              component={ProfileSettingsScreen}
            />
            <Stack.Screen name="CreateClient" component={CreateClientScreen} />
            <Stack.Screen name="ClientsList" component={ClientsListScreen} />
            <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                animation: "fade",
              }}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0E27",
  },
});
