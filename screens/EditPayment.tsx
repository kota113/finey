import * as WebBrowser from "expo-web-browser";
import {useEffect} from "react";
import {ActivityIndicator} from "react-native-paper";
import {requestBackend} from "../utils/apiRequest";

function openCustomerPortal(callback: () => void) {
    requestBackend("/customer-portal-url", "GET")
        .then(res => res.json().then(data => {
            WebBrowser.openBrowserAsync(data.url).then(callback)
        }))
}

export default function ({navigation}) {
    useEffect(() => {
        openCustomerPortal(() => navigation.goBack())
    }, []);
    return (
        <ActivityIndicator size={"large"} style={{flex: 1, alignSelf: "center"}}/>
    )
}
