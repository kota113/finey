import {PaymentProvider} from "../types";
import auth from "@react-native-firebase/auth";
import {Alert} from "react-native";

export async function setPaymentProvider(provider: PaymentProvider) {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user/payment-provider`, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${await auth().currentUser.getIdToken()}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({provider: provider})
    })
    if (!res.ok) {
        Alert.alert("エラー", "エラーが発生しました。もう一度お試しください。")
        throw new Error("Error setting payment provider.")
    }
    return
}

export async function getPaymentProvider() {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user/payment-provider`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${await auth().currentUser.getIdToken()}`
        }
    })
    if (!res.ok) {
        throw new Error("Error getting payment provider.")
    }
    const data = await res.json()
    return data.provider as PaymentProvider
}
