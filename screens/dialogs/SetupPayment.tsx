import {Button, Dialog, List, Portal, Text, useTheme} from "react-native-paper";
import {useState} from "react";
import {PaymentProvider} from "../../types";


export default function SetupPayment({navigation, visible, setVisible}) {
    const [successDialogVisible, setSuccessDialogVisible] = useState(false);
    const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<PaymentProvider>("paypay");

    function onSubmit() {
        setVisible(false)
        const screenToNavigate = selectedPaymentProvider === "stripe" ? "SetupStripe" : "SetupPayPay";
        navigation.navigate(screenToNavigate);
    }

    const theme = useTheme()
    const selectedBackgroundColor = "rgba(0,108,83,0.25)"

    return (
        <>
            <Portal>
                <Dialog visible={visible} dismissableBackButton={false} dismissable={false}>
                    <Dialog.Icon icon={"credit-card"} size={30}/>
                    <Dialog.Title style={{textAlign: "center"}}>お支払い方法</Dialog.Title>
                    <Dialog.Content>
                        <Text>デポジットのお支払手段を設定してください</Text>
                        <Text
                            style={{marginBottom: 10}}>タスク設定時に決済され、完了したら払い戻されます
                        </Text>
                        <List.Item
                            rippleColor={theme.colors.primary}
                            style={{
                                backgroundColor: selectedPaymentProvider === "paypay" ? selectedBackgroundColor : "transparent",
                                borderRadius: 15
                            }}
                            title="PayPay"
                            description="PayPayアカウントの残高から決済を行います"
                            left={props => <List.Icon {...props} icon="cellphone"/>}
                            onPress={() => {
                                setSelectedPaymentProvider("paypay");
                            }}
                        />
                        <List.Item
                            rippleColor={theme.colors.primary}
                            style={{
                                backgroundColor: selectedPaymentProvider === "stripe" ? selectedBackgroundColor : "transparent",
                                borderRadius: 15
                            }}
                            contentStyle={{borderRadius: 15}}
                            title="クレジットカード"
                            description="登録するクレジットカードから決済を行います"
                            left={props => <List.Icon {...props} icon="credit-card-outline"/>}
                            onPress={() => {
                                setSelectedPaymentProvider("stripe")
                            }}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={onSubmit}>次へ</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <Portal>
                <Dialog visible={successDialogVisible} onDismiss={() => setSuccessDialogVisible(false)}>
                    <Dialog.Icon icon={"check"} size={30}/>
                    <Dialog.Title style={{textAlign: "center"}}>完了しました</Dialog.Title>
                    <Dialog.Content>
                        {selectedPaymentProvider == "stripe" ?
                            (
                                <>
                                    <Text>お支払い方法がカードに設定されました</Text>
                                    <Text>決済方法は設定からいつでも変更できます</Text>
                                </>
                            ) :
                            (
                                <>
                                    <Text>お支払い方法がPayPayに設定されました</Text>
                                    <Text>決済方法は設定からいつでも変更できます</Text>
                                </>
                            )
                        }
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setSuccessDialogVisible(false)}>完了</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </>
    );
}