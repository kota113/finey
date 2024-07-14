import {StripeProvider, useStripe} from "@stripe/stripe-react-native";
import {Avatar, Button, Card, Dialog, Portal, Text, useTheme} from "react-native-paper";
import {useState} from "react";
import auth from "@react-native-firebase/auth";
import {initializePaymentSheet, openPaymentSheet} from "../utils/stripePaymentSheet";
import {storeLocalData} from "../utils/localStorage";
import {Image, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";

export default ({navigation}) => {
    const [loading, setLoading] = useState(false);
    const [successDialogVisible, setSuccessDialogVisible] = useState(false);
    const {initPaymentSheet, presentPaymentSheet} = useStripe();
    const theme = useTheme()
    const safeAreaInsets = useSafeAreaInsets();

    async function launchDialog() {
        setLoading(true)
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/payment-methods-count`,
            {
                'method': 'GET',
                'headers': {
                    'Authorization': 'Bearer ' + await auth().currentUser.getIdToken()
                }
            })
        const resJson = await res.json()
        if (resJson.count == 0) {
            initializePaymentSheet(setLoading, initPaymentSheet).then(() => {
                openPaymentSheet(presentPaymentSheet).then((res) => {
                    if (res === true) {
                        setLoading(false)
                        setSuccessDialogVisible(true)
                    } else {
                        setLoading(false)
                    }
                })
            })
        } else {
            setLoading(false)
            setSuccessDialogVisible(true)
        }
    }

    function onSubmit() {
        storeLocalData("paymentProvider", "stripe").then(() => {
            launchDialog().then()
        })
    }

    return (
        <StripeProvider
            publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE}
        >
            <StatusBar style={"auto"}/>
            <View
                style={{
                    flex: 1,
                    backgroundColor: theme.colors.background,
                    paddingHorizontal: 20,
                    paddingVertical: 25,
                    marginTop: safeAreaInsets.top
                }}>
                <Text variant={"displaySmall"} style={{marginBottom: 7}}>カード決済を設定</Text>
                <Text
                    variant={"bodyMedium"}>クレジットカード決済を設定しても、設定からいつでもPayPay決済に戻すことが可能です。</Text>
                <Card mode={"outlined"} style={{marginTop: 25}}>
                    <Card.Title
                        title="引き続きPayPayを利用"
                        left={(props) => <Image {...props} source={require("../assets/paypay-logo.jpg")}
                                                style={{height: 45, width: 45, borderRadius: 5}}/>}
                    />
                    <Card.Content>
                        <Text>・都度決済が必要</Text>
                        <Text>・返金されるまで時間がかかる</Text>
                        <Text>・PayPayが利用可能な端末でのみ使用可能</Text>
                    </Card.Content>
                </Card>
                <Card mode={"outlined"} style={{marginTop: 17}}>
                    <Card.Title
                        title="クレジットカード決済"
                        left={(props) => <Avatar.Icon {...props} icon={"credit-card"} size={47}/>}
                    />
                    <Card.Content>
                        <Text>・アプリ内で自動的に決済が完了</Text>
                        <Text>・タスクの達成を確認後、即時に返金が反映</Text>
                        <Text> ※カード発行会社によって異なります</Text>
                        <Text>・ご利用の全端末で使用可能</Text>
                    </Card.Content>
                </Card>
                <View style={{
                    justifyContent: "space-between",
                    flexDirection: "row",
                    bottom: 30,
                    position: "absolute",
                    left: 25,
                    right: 25
                }}>
                    <Button mode={"text"} onPress={() => {
                        navigation.goBack();
                    }}>
                        キャンセル
                    </Button>
                    <Button mode={"contained"} loading={loading} disabled={loading} onPress={onSubmit}>
                        設定
                    </Button>
                </View>
            </View>
            <Portal>
                <Dialog visible={successDialogVisible} dismissable={false}>
                    <Dialog.Icon icon={"check"}/>
                    <Dialog.Title style={{textAlign: "center"}}>完了しました</Dialog.Title>
                    <Dialog.Content>
                        <Text>今後のお支払いにはご登録のクレジットカードが使われます</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => {
                            setSuccessDialogVisible(false);
                            navigation.goBack();
                        }}>
                            完了
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </StripeProvider>
    )
}