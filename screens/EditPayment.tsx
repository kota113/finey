import * as WebBrowser from "expo-web-browser";
import {useEffect} from "react";
import {ActivityIndicator} from "react-native-paper";
import {PaymentProvider} from "../types";
import * as Linking from "expo-linking";
import {getPaymentProvider} from "../utils/paymentProvider";
import {requestBackend} from "../utils/apiRequest";

function openCustomerPortal(callback: () => void) {
    requestBackend("/customer-portal-url", "GET")
        .then(res => res.json().then(data => {
            WebBrowser.openBrowserAsync(data.url).then(callback)
        }))
}

export default function ({navigation}) {
    useEffect(() => {
        getPaymentProvider().then((provider: PaymentProvider) => {
            if (provider === "stripe") {
                openCustomerPortal(() => navigation.goBack())
            } else {
                // open paypay app
                Linking.openURL("paypay://").then(() => navigation.goBack())
            }
        })
    }, []);
    return (
        <ActivityIndicator size={"large"} style={{flex: 1, alignSelf: "center"}}/>
    )
}
