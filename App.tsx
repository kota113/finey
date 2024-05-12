import 'react-native-gesture-handler';
import * as React from 'react';
import {AppRegistry} from 'react-native';
import {DefaultTheme, PaperProvider} from 'react-native-paper';
import config from './app.config';
import AppDrawer from './screens/DrawerNavigation';
import {StatusBar} from "expo-status-bar";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {NavigationContainer, Theme} from "@react-navigation/native";
import Settings from "./screens/Settings";
import Setup from "./screens/Setup";
import EditPayment from "./screens/EditPayment";

const Stack = createNativeStackNavigator();

const GlobalTheme: Theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        // Customize your theme colors here
        background: 'white',
        primary: DefaultTheme.colors.primary,
        card: DefaultTheme.colors.surface,
        text: "black",
        border: "",
        notification: "",
    },
};


const StackNavigator = () => {
    return (
        <NavigationContainer theme={GlobalTheme}>
            <Stack.Navigator initialRouteName={"AppDrawer"}>
                <Stack.Screen name="AppDrawer" component={AppDrawer} options={{headerShown: false}}/>
                <Stack.Screen name="Settings" component={Settings} options={{headerShown: false}}/>
                <Stack.Screen name="EditPayment" component={EditPayment} options={{headerShown: false}}/>
                <Stack.Screen name="Setup" component={Setup} options={{headerShown: false}}/>
                <Stack.Screen name="Help" component={Setup} options={{headerShown: false}}/>
            </Stack.Navigator>
        </NavigationContainer>

    )
}

// noinspection JSUnusedGlobalSymbols
export default function App() {
    return (
        <PaperProvider>
            <StackNavigator/>
            <StatusBar style="auto"/>
        </PaperProvider>
    );
}

AppRegistry.registerComponent(config.expo.name, () => App);
