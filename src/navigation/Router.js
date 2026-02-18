import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/theme';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import QuizScreen from '../screens/QuizScreen';
import ResultatScreen from '../screens/ResultatScreen';
import ClassementScreen from '../screens/ClassementScreen';
import HistoriqueScreen from '../screens/HistoriqueScreen';
import ProfilScreen from '../screens/ProfilScreen';
import ConcoursScreen from '../screens/ConcoursScreen';
import AdminScreen from '../screens/AdminScreen';
import UsersListScreen from '../screens/UsersListScreen';
import LogsListScreen from '../screens/LogsListScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNav = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#161616',
        borderTopColor: 'rgba(255,255,255,0.08)',
        borderTopWidth: 1,
        height: 62,
        paddingBottom: 8,
        paddingTop: 4,
      },
      tabBarActiveTintColor: COLORS.jauneEtoile,
      tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      tabBarIcon: ({ color, size, focused }) => {
        const map = {
          Accueil: focused ? 'home' : 'home-outline',
          Classement: focused ? 'trophy' : 'trophy-outline',
          Historique: focused ? 'time' : 'time-outline',
          Profil: focused ? 'person' : 'person-outline',
        };
        return <Ionicons name={map[route.name] || 'help'} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Accueil" component={HomeScreen} />
    <Tab.Screen name="Classement" component={ClassementScreen} />
    <Tab.Screen name="Historique" component={HistoriqueScreen} />
    <Tab.Screen name="Profil" component={ProfilScreen} />
  </Tab.Navigator>
);

const Router = () => {
  const { estConnecte, chargement, utilisateur } = useAuth();

  if (chargement) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' }}>
        <ActivityIndicator size="large" color={COLORS.rouge} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {estConnecte ? (
          <>
            <Stack.Screen name="MainTabs" component={TabNav} />
            <Stack.Screen name="Quiz" component={QuizScreen} options={{ animation: 'slide_from_right', gestureEnabled: false }} />
            <Stack.Screen name="Resultat" component={ResultatScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Concours" component={ConcoursScreen} options={{ animation: 'slide_from_right' }} />
            {utilisateur?.isAdmin && (
              <>
                <Stack.Screen name="Admin" component={AdminScreen} options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="UsersList" component={UsersListScreen} options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="LogsList" component={LogsListScreen} options={{ animation: 'slide_from_right' }} />
              </>
            )}
          </>
        ) : (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_right' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Router;
