import {firebase} from "@react-native-firebase/auth";
import * as WebBrowser from "expo-web-browser";
import {SafeAreaView} from "react-native";
import {useEffect, useState} from "react";
import {ActivityIndicator, Portal} from "react-native-paper";

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
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        openCustomerPortal(() => navigation.goBack())
        setLoading(false)
    }, []);
    return (
        <SafeAreaView style={{flex: 1}}>
            {loading &&
                <Portal>
                    <ActivityIndicator size={"large"} style={{alignSelf: "center"}}/>
                </Portal>
            }
        </SafeAreaView>
    )
}
