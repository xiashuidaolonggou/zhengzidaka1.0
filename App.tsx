import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GoalProvider } from './src/context/GoalContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GoalProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </GoalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
