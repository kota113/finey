import {PaymentProvider} from "../types";
import {Alert} from "react-native";
import {requestBackend} from "./apiRequest";

export async function setPaymentProvider(provider: PaymentProvider) {
    const res = await requestBackend("/user/payment-provider", "POST", {provider: provider})
    if (!res.ok) {
        Alert.alert("エラー", "エラーが発生しました。もう一度お試しください。")
        throw new Error("Error setting payment provider.")
    }
    return
}

export async function getPaymentProvider() {
    const res = await requestBackend("/user/payment-provider", "GET")
    if (!res.ok) {
        throw new Error("Error getting payment provider.")
    }
    const data = await res.json()
    return data.provider as PaymentProvider
}
