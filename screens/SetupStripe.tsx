import {StripeProvider, useStripe} from "@stripe/stripe-react-native";
import {Avatar, Button, Card, Dialog, Portal, Text, useTheme} from "react-native-paper";
import {useState} from "react";
import {initializePaymentSheet, openPaymentSheet} from "../utils/stripePaymentSheet";
import {View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";
import {setPaymentProvider} from "../utils/paymentProvider";
import {getPaymentMethodsCount} from "../utils/stripe";

export default ({navigation}) => {
    const [loading, setLoading] = useState(false);
    const [successDialogVisible, setSuccessDialogVisible] = useState(false);
    const {initPaymentSheet, presentPaymentSheet} = useStripe();
    const theme = useTheme()
    const safeAreaInsets = useSafeAreaInsets();

    async function launchDialog() {
        setLoading(true)
        if (await getPaymentMethodsCount() == 0) {
            initializePaymentSheet(setLoading, initPaymentSheet).then(() => {
                openPaymentSheet(presentPaymentSheet).then((res) => {
                    if (res === true) {
                        setPaymentProvider("stripe").then(() => {
                            setLoading(false)
                            setSuccessDialogVisible(true)
                        })
                    } else {
                        setLoading(false)
                    }
                })
            })
        } else {
            setPaymentProvider("stripe").then(() => {
                setLoading(false)
                setSuccessDialogVisible(true)
            })
        }
    }

    function onSubmit() {
        launchDialog().then()
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
                    paddingVertical: 35,
                    marginTop: safeAreaInsets.top
                }}>
                <Text variant={"displaySmall"} style={{marginBottom: 12}}>カード決済を設定</Text>
                <Text
                    variant={"bodyMedium"}>設定からいつでもPayPay決済に戻すことが可能です。</Text>
                <Card mode={"outlined"} style={{marginTop: 25}}>
                    <Card.Title
                        title="カード情報の保管"
                        left={(props) => <Avatar.Icon {...props} icon={"lock"} size={47}/>}
                    />
                    <Card.Content>
                        <Text>・開発者は決済情報を閲覧できません</Text>
                        <Text>・暗号化して送信されます</Text>
                        <Text>・米Stripe社のサービスを使用しています</Text>
                        <Text variant={"bodySmall"}>※詳しくはStripe社のプライバシーポリシーをご確認ください。</Text>
                    </Card.Content>
                </Card>
                <Card mode={"outlined"} style={{marginTop: 17}}>
                    <Card.Title
                        title="入力は一度だけ"
                        left={(props) => <Avatar.Icon {...props} icon={"credit-card"} size={47}/>}
                    />
                    <Card.Content>
                        <Text>・以降のお支払いは自動的に行われます</Text>
                        <Text>・決済情報は端末に関わらず使用できます</Text>
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