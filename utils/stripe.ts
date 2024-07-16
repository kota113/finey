import auth from "@react-native-firebase/auth";

export async function getPaymentMethodsCount() {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/payment-methods-count`,
        {
            'method': 'GET',
            'headers': {
                'Authorization': 'Bearer ' + await auth().currentUser.getIdToken()
            }
        })
    const resJson = await res.json()
    return resJson.count
}