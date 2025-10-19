import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/mobile/contexts/AuthContext';
import { ThemeProvider } from './src/mobile/contexts/ThemeContext';

// Import mobile screens
import DashboardScreen from './src/mobile/screens/DashboardScreen';
import StrategiesScreen from './src/mobile/screens/StrategiesScreen';
import PortfolioScreen from './src/mobile/screens/PortfolioScreen';
import InsightsScreen from './src/mobile/screens/InsightsScreen';
import ProfileScreen from './src/mobile/screens/ProfileScreen';
import LoginScreen from './src/mobile/screens/LoginScreen';
import { useAuth } from './src/mobile/hooks/useAuth';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Strategies') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Portfolio') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Insights') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00D9FF',
        tabBarInactiveTintColor: '#8B949E',
        tabBarStyle: {
          backgroundColor: '#161B22',
          borderTopColor: '#30363D',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#0D1117',
          borderBottomColor: '#30363D',
        },
        headerTintColor: '#F0F6FC',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Market Dashboard' }}
      />
      <Tab.Screen 
        name="Strategies" 
        component={StrategiesScreen}
        options={{ title: 'Trading Strategies' }}
      />
      <Tab.Screen 
        name="Portfolio" 
        component={PortfolioScreen}
        options={{ title: 'My Portfolio' }}
      />
      <Tab.Screen 
        name="Insights" 
        component={InsightsScreen}
        options={{ title: 'AI Insights' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <View style={styles.loadingContainer} />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <TabNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <View style={styles.container}>
            <StatusBar style="light" backgroundColor="#0D1117" />
            <AppContent />
          </View>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
});