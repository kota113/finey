import {firebase} from "@react-native-firebase/auth";
import * as WebBrowser from "expo-web-browser";
import {useEffect} from "react";
import {ActivityIndicator} from "react-native-paper";

function openCustomerPortal(callback: () => void) {
    const user = firebase.auth().currentUser
    user.getIdToken().then(token => {
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/customer-portal-url`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        }).then(res => res.json().then(data => {
            WebBrowser.openBrowserAsync(data.url).then(callback)
        }))
    })
}

export default function ({navigation}) {
    useEffect(() => {
        openCustomerPortal(() => navigation.goBack())
    }, []);
    return (
        <ActivityIndicator size={"large"} style={{flex: 1, alignSelf: "center"}}/>
    )
}
