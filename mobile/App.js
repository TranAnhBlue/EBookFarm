import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from './src/store/authStore';

// Create a client
const queryClient = new QueryClient();

// Auth
import LoginScreen from './src/screens/LoginScreen';

// Main Tabs
import HomeScreen        from './src/screens/HomeScreen';
import JournalListScreen from './src/screens/JournalListScreen';
import InventoryScreen   from './src/screens/InventoryScreen';
import SupplyScreen      from './src/screens/SupplyScreen';
import AIScreen          from './src/screens/AIScreen';
import TCVNScreen        from './src/screens/TCVNScreen';
import ProfileScreen     from './src/screens/ProfileScreen';

// Stack Screens
import ScannerScreen       from './src/screens/ScannerScreen';
import TraceDetailScreen   from './src/screens/TraceDetailScreen';
import NewsListScreen      from './src/screens/NewsListScreen';
import NewsDetailScreen    from './src/screens/NewsDetailScreen';
import AccountInfoScreen   from './src/screens/AccountInfoScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import JournalEntryScreen  from './src/screens/JournalEntryScreen';
import ProductionTechScreen from './src/screens/ProductionTechScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SettingsScreen      from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TAB_ICON = {
  Home:      'grid',
  Journals:  'book',
  Inventory: 'package',
  Supply:    'shopping-bag',
  AI:        'cpu',
  TCVN:      'file-text',
  Profile:   'user',
};

const TAB_LABEL = {
  Home:      'Tổng quan',
  Journals:  'Nhật ký',
  Inventory: 'Kho vật tư',
  Supply:    'Xin cấp',
  AI:        'Hỏi AI',
  TCVN:      'Tiêu chuẩn',
  Profile:   'Tài khoản',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Feather name={TAB_ICON[route.name]} size={size} color={color} />
        ),
        tabBarActiveTintColor:   '#16a34a',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabel: TAB_LABEL[route.name],
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 5,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home"      component={HomeScreen}        />
      <Tab.Screen name="Journals"  component={JournalListScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen}   />
      <Tab.Screen name="Supply"    component={SupplyScreen}      />
      <Tab.Screen name="AI"        component={AIScreen}          />
      <Tab.Screen name="TCVN"      component={TCVNScreen}        />
      <Tab.Screen name="Profile"   component={ProfileScreen}     />
    </Tab.Navigator>
  );
}

export default function App() {
  const { user, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Scanner"
                component={ScannerScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="TraceDetail"
                component={TraceDetailScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="NewsList"
                component={NewsListScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="NewsDetail"
                component={NewsDetailScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AccountInfo"
                component={AccountInfoScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="JournalEntry"
                component={JournalEntryScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ProductionTech"
                component={ProductionTechScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ headerShown: false }}
              />
            </>
          ) : (
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
