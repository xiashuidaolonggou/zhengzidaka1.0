import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { CreateGoalScreen } from '../screens/CreateGoalScreen';
import { GoalDetailScreen } from '../screens/GoalDetailScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { COLORS, FONT_SIZE } from '../constants';

export type GoalStackParamList = {
  Home: undefined;
  CreateGoal: undefined;
  GoalDetail: { goalId: string };
};

const Stack = createNativeStackNavigator<GoalStackParamList>();

function GoalStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: FONT_SIZE.lg,
        },
        contentStyle: { backgroundColor: COLORS.background },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: '我的目标',
          headerRight: () => (
            <Text
              style={{
                color: COLORS.accent,
                fontSize: 26,
                fontWeight: '300',
                marginRight: 8,
              }}
              onPress={() => navigation.navigate('CreateGoal')}
            >
              ＋
            </Text>
          ),
        })}
      />
      <Stack.Screen
        name="CreateGoal"
        component={CreateGoalScreen}
        options={{ title: '新建目标' }}
      />
      <Stack.Screen
        name="GoalDetail"
        component={GoalDetailScreen}
        options={{
          title: '',
          headerBackTitle: '返回',
        }}
      />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.border,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="GoalsTab"
          component={GoalStack}
          options={{
            tabBarLabel: '目标',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 19 }}>目</Text>
            ),
          }}
        />
        <Tab.Screen
          name="StatsTab"
          component={StatsScreen}
          options={{
            title: '统计',
            tabBarLabel: '统计',
            headerShown: true,
            headerStyle: { backgroundColor: COLORS.surface },
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: FONT_SIZE.lg,
              color: COLORS.textPrimary,
            },
            headerShadowVisible: false,
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 19 }}>统</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
