import 'react-native-gesture-handler';
import * as React from 'react';
import {AppRegistry} from 'react-native';
import {MD3LightTheme as DefaultTheme, PaperProvider} from 'react-native-paper';
import config from './app.config';
import AppDrawer from './screens/DrawerNavigation';
import {StatusBar} from "expo-status-bar";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {NavigationContainer, Theme} from "@react-navigation/native";
import Settings from "./screens/Settings";
import Setup from "./screens/Setup";
import EditPayment from "./screens/EditPayment";
import {firebase} from "@react-native-firebase/auth";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {getFirestore, initializeFirestore} from "@react-native-firebase/firestore/lib/modular";
import storage from '@react-native-firebase/storage';
import {materialTheme} from "./materialTheme";

const Stack = createNativeStackNavigator();

// noinspection GrazieInspection
const GlobalTheme: Theme = {
    ...DefaultTheme,
    colors: {
        ...materialTheme.colors,
        primary: materialTheme.colors.primary,
        background: materialTheme.colors.surface,
        text: materialTheme.colors.onSurface,
        // random colors, idk what they do
        border: materialTheme.colors.onSurface,
        notification: materialTheme.colors.primary,
        card: materialTheme.colors.surface,
    },
};


const StackNavigator = () => {
    // set true if firebase is not initialized
    const [googleSignInConfigured, setGoogleSignInConfigured] = React.useState(false);
    if (!firebase.app) {
        firebase.initializeApp({
            // apiKey: process.env.FIREBASE_API_KEY,
            apiKey: "AIzaSyAw-_akclT1RswbPWcNd0gT7Bjf0JaJwQY",
            // appId: process.env.FIREBASE_APP_ID,
            appId: "1:890921992941:android:dd9b8a1460c34a2c5e82e4",
            projectId: "finey-9c921",
            databaseURL: "",
            messagingSenderId: "",
            storageBucket: "finey-9c921.appspot.com",
        }).then(() => console.log("Firebase initialized"))
    }
    if (!getFirestore()) {
        initializeFirestore(firebase.app(), {
            persistence: true
        }).then(() => console.log("Firestore initialized"))
    }
    storage()
    if (!googleSignInConfigured) {
        GoogleSignin.configure({
            webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
        })
        setGoogleSignInConfigured(true)
    }
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
