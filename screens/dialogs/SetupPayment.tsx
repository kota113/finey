import {ActivityIndicator, Button, Dialog, Portal, RadioButton, Text} from "react-native-paper";
import {useEffect, useState} from "react";
import {StripeProvider, useStripe} from "@stripe/stripe-react-native";
import auth from "@react-native-firebase/auth";
import {getLocalData, storeLocalData} from "../../utils/localStorage";
import {PaymentProvider} from "../../types";
import {initializePaymentSheet, openPaymentSheet} from "../../utils/stripePaymentSheet";


export default function SetupPayment() {
    const [visible, setVisible] = useState(false);
    const {initPaymentSheet, presentPaymentSheet} = useStripe();
    const [loading, setLoading] = useState(true);
    const [successDialogVisible, setSuccessDialogVisible] = useState(false);
    const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<PaymentProvider>("stripe");

    function onSubmit() {
        if (!loading) {
            if (selectedPaymentProvider === "stripe") {
                openPaymentSheet(presentPaymentSheet).then((res) => {
                    if (res === true) {
                        storeLocalData("paymentProvider", "stripe").then(() => {
                            setVisible(false);
                            setSuccessDialogVisible(true);
                        })
                    }
                })
            } else {
                storeLocalData("paymentProvider", "paypay").then(() => {
                    setVisible(false);
                    setSuccessDialogVisible(true);
                })
            }
        }
    }

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
                initializePaymentSheet(setLoading, initPaymentSheet).then(() => setLoading(false));
            }
        }

        getLocalData("paymentProvider").then((provider: PaymentProvider) => {
            if (provider == 'stripe') {
                launchDialog().then()
            }
        });
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
                                <Text>デポジットのお支払手段を設定してください</Text>
                                <Text
                                    style={{marginBottom: 10}}>クレジットカードの場合、お支払いがよりスムーズになります。</Text>
                                <RadioButton.Group
                                    onValueChange={value => setSelectedPaymentProvider(value as PaymentProvider)}
                                    value={selectedPaymentProvider}
                                >
                                    <RadioButton.Item style={{flexDirection: "row-reverse"}} mode={"android"}
                                                      label="クレジットカード" value="stripe"/>
                                    <RadioButton.Item style={{flexDirection: "row-reverse"}} mode={"android"}
                                                      label="PayPay" value="paypay"/>
                                </RadioButton.Group>
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
                        ) : selectedPaymentProvider == "stripe" ?
                            (
                                <>
                                    <Text>お支払い方法の設定が完了しました</Text>
                                    <Text>今後はこのカードで決済・返金が行われます</Text>
                                </>
                            ) :
                            (
                                <>
                                    <Text>お支払い方法がPayPayに設定されました</Text>
                                    <Text>都度PayPayアプリから決済を行ってください</Text>
                                    <Text>決済方法は設定からいつでも変更できます</Text>
                                </>
                            )
                        }
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button disabled={loading} onPress={() => setSuccessDialogVisible(false)}>完了</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </StripeProvider>
    );
}