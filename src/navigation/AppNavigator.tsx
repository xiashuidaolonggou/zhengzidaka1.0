import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { CreateGoalScreen } from '../screens/CreateGoalScreen';
import { GoalDetailScreen } from '../screens/GoalDetailScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { HeatmapScreen } from '../screens/HeatmapScreen';
import { COLORS, FONT_SIZE } from '../constants';

export type StatsStackParamList = {
  StatsList: undefined;
  Heatmap: undefined;
};

export type GoalStackParamList = {
  Home: undefined;
  CreateGoal: undefined;
  GoalDetail: { goalId: string };
};

const GoalStackNav = createNativeStackNavigator<GoalStackParamList>();
const StatsStackNav = createNativeStackNavigator<StatsStackParamList>();

const GoalStack = () => {
  return (
    <GoalStackNav.Navigator
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
      <GoalStackNav.Screen
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
      <GoalStackNav.Screen
        name="CreateGoal"
        component={CreateGoalScreen}
        options={{ title: '新建目标' }}
      />
      <GoalStackNav.Screen
        name="GoalDetail"
        component={GoalDetailScreen}
        options={{
          title: '',
          headerBackTitle: '返回',
        }}
      />
    </GoalStackNav.Navigator>
  );
};

const StatsStack = () => {
  return (
    <StatsStackNav.Navigator
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
      <StatsStackNav.Screen
        name="StatsList"
        component={StatsScreen}
        options={({ navigation }) => ({
          title: '统计',
          headerRight: () => (
            <Text
              style={{
                color: COLORS.accentBlue,
                fontSize: FONT_SIZE.md,
                fontWeight: '500',
              }}
              onPress={() => navigation.navigate('Heatmap')}
            >
              热力图
            </Text>
          ),
        })}
      />
      <StatsStackNav.Screen
        name="Heatmap"
        component={HeatmapScreen}
        options={{
          title: '年度热力图',
          headerBackTitle: '返回',
        }}
      />
    </StatsStackNav.Navigator>
  );
};

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
          component={StatsStack}
          options={{
            tabBarLabel: '统计',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 19 }}>统</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
