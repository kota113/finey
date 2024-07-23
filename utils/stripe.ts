import {requestBackend} from "./apiRequest";

export async function getPaymentMethodsCount() {
    const res = await requestBackend("/payment-methods-count", "GET");
    const resJson = await res.json()
    return resJson.count
}
