import {Alert} from "react-native";
import {ActivityIndicator, Button, Dialog, Portal, Text} from "react-native-paper";
import {useEffect, useState} from "react";
import {StripeProvider, useStripe} from "@stripe/stripe-react-native";
import auth from "@react-native-firebase/auth";

export default function SetupPayment() {
    const [visible, setVisible] = useState(false);
    const {initPaymentSheet, presentPaymentSheet} = useStripe();
    const [loading, setLoading] = useState(true);
    const [successDialogVisible, setSuccessDialogVisible] = useState(false);

    function onSubmit() {
        if (!loading) {
            openPaymentSheet().then((res) => {
                if (res === true) {
                    setVisible(false);
                    setSuccessDialogVisible(true);
                }
            });
        }
    }

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

    const initializePaymentSheet = async () => {
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

    const openPaymentSheet = async () => {
        const {error} = await presentPaymentSheet();

        if (error) {
            Alert.alert("エラー", "支払い方法の設定中にエラーが発生しました");
            return false
        } else {
            return true
        }
    };

    useEffect(() => {
        async function launchDialog() {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/payment-methods-count`,
                {
                    'method': 'GET',
                    'headers': {
                        'Authorization': 'Bearer ' + await auth().currentUser.getIdToken()
                    }
                })
            const resJson = await res.json()
            if (resJson.count == 0) {
                setVisible(true)
                initializePaymentSheet().then(() => setLoading(false));
            }
        }

        launchDialog().then()
    }, []);

    return (
        <StripeProvider
            publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE}
            // merchantIdentifier="merchant.com.finey" // required for Apple Pay
        >
            <Portal>
                <Dialog visible={visible} dismissableBackButton={false} dismissable={false}>
                    <Dialog.Icon icon={"credit-card"} size={30}/>
                    <Dialog.Title style={{textAlign: "center"}}>支払い方法の設定</Dialog.Title>
                    <Dialog.Content>
                        {loading ? (
                            <ActivityIndicator size={"large"}/>
                        ) : (
                            <>
                                <Text>ご利用になる前に、支払手段の設定が必要です。</Text>
                                <Text>ご利用のカードを登録してください</Text>
                            </>
                        )}
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button disabled={loading} onPress={onSubmit}>次へ</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <Portal>
                <Dialog visible={successDialogVisible} onDismiss={() => setSuccessDialogVisible(false)}>
                    <Dialog.Icon icon={"check"} size={30}/>
                    <Dialog.Title style={{textAlign: "center"}}>完了しました</Dialog.Title>
                    <Dialog.Content>
                        {loading ? (
                            <ActivityIndicator size={"large"}/>
                        ) : (
                            <>
                                <Text>お支払い方法の設定が完了しました</Text>
                                <Text>今後はこのカードで決済・返金が行われます</Text>
                            </>
                        )}
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button disabled={loading} onPress={() => setSuccessDialogVisible(false)}>完了</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </StripeProvider>
    );
}