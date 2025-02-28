import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import InfluencerListScreen from './src/screens/InfluencerListScreen';
import InfluencerFormScreen from './src/screens/InfluencerFormScreen';
import InfluencerProfileScreen from './src/screens/InfluencerProfileScreen';
import JobTrackingScreen from './src/screens/JobTrackingScreen';

// Initialize the sync service
import SyncService from './src/services/SyncService';
SyncService.getInstance().init();

// Define the theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#e11d48', // rose-600
    accent: '#f43f5e', // rose-500
    background: '#f9fafb', // gray-50
    surface: '#ffffff',
    text: '#1f2937', // gray-800
    error: '#ef4444', // red-500
  },
};

// Define the stack navigator
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="InfluencerList"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#e11d48',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="InfluencerList" 
              component={InfluencerListScreen} 
              options={{ title: 'Influencer Listesi' }} 
            />
            <Stack.Screen 
              name="InfluencerForm" 
              component={InfluencerFormScreen} 
              options={({ route }) => ({ 
                title: route.params?.id ? 'Influencer Düzenle' : 'Yeni Influencer Ekle' 
              })} 
            />
            <Stack.Screen 
              name="InfluencerProfile" 
              component={InfluencerProfileScreen} 
              options={{ title: 'Influencer Profili' }} 
            />
            <Stack.Screen 
              name="JobTracking" 
              component={JobTrackingScreen} 
              options={{ title: 'İş Takibi' }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}