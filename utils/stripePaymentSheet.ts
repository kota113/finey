import auth from "@react-native-firebase/auth";
import {Alert} from "react-native";
import {InitPaymentSheetResult, PresentPaymentSheetResult} from "@stripe/stripe-react-native";
import {PresentOptions, SetupParams} from "@stripe/stripe-react-native/lib/typescript/src/types/PaymentSheet";

const fetchPaymentSheetParams = async () => {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/setup-payment-intent`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + await auth().currentUser.getIdToken(),
            'Content-Type': 'application/json',
        },
    });
    const {setupIntent, ephemeralKey, customer} = await response.json();

    return {
        setupIntent,
        ephemeralKey,
        customer,
    };
};

export const initializePaymentSheet = async (setLoading: (loading: boolean) => void, initPaymentSheet: (params: SetupParams) => Promise<InitPaymentSheetResult>) => {
    const {
        setupIntent,
        ephemeralKey,
        customer,
    } = await fetchPaymentSheetParams();

    const {error} = await initPaymentSheet({
        merchantDisplayName: "Finey",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        setupIntentClientSecret: setupIntent,
    });
    if (!error) {
        setLoading(true);
    }
};

export const openPaymentSheet = async (presentPaymentSheet: (options?: PresentOptions) => Promise<PresentPaymentSheetResult>) => {
    const {error} = await presentPaymentSheet();

    if (error) {
        Alert.alert("エラー", "支払い方法の設定中にエラーが発生しました");
        return false
    } else {
        return true
    }
};