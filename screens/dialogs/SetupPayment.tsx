import {Button, Dialog, Portal, RadioButton, Text} from "react-native-paper";
import {useCallback, useEffect, useState} from "react";
import {PaymentProvider} from "../../types";
import {getPaymentProvider} from "../../utils/paymentProvider";
import {useFocusEffect} from "@react-navigation/native";
import {getPaymentMethodsCount} from "../../utils/stripe";


export default function SetupPayment({navigation}) {
    const [visible, setVisible] = useState(false);
    const [successDialogVisible, setSuccessDialogVisible] = useState(false);
    const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<PaymentProvider>("stripe");
    const [newUser, setNewUser] = useState(false);

    function onSubmit() {
        setVisible(false)
        navigation.navigate("SetupStripe" ? selectedPaymentProvider === "stripe" : "SetupPayPay")
    }

    async function isUserNew() {
        const provider = await getPaymentProvider();
        if (provider == null) {
            return true
        } else if (provider == "stripe") {
            const count = await getPaymentMethodsCount();
            if (count == 0) {
                return true
            }
        }
        return false
    }

    // アプリ起動時に決済方法が未設定の場合、ダイアログを表示。newUserをtrueに
    useEffect(() => {
        isUserNew().then((isNew) => {
            if (isNew) {
                setNewUser(true)
                setVisible(true)
            }
        })
    })

    // 新規ユーザーの場合、フォーカスが当たる度にチェック
    useFocusEffect(
        useCallback(() => {
            if (newUser) {
                isUserNew().then((isNew) => {
                    if (!isNew) {
                        setVisible(true)
                    } else {
                        setNewUser(false)
                        setSuccessDialogVisible(true)
                    }
                });
            }
            return () => {
            };
        }, [])
    );

    return (
        <>
            <Portal>
                <Dialog visible={visible} dismissableBackButton={false} dismissable={false}>
                    <Dialog.Icon icon={"credit-card"} size={30}/>
                    <Dialog.Title style={{textAlign: "center"}}>支払い方法の設定</Dialog.Title>
                    <Dialog.Content>
                        <Text>デポジットのお支払手段を設定してください</Text>
                        <Text
                            style={{marginBottom: 10}}>デポジットはタスク設定時に決済され、完了したら払い戻されます。
                        </Text>
                        <RadioButton.Group
                            onValueChange={value => setSelectedPaymentProvider(value as PaymentProvider)}
                            value={selectedPaymentProvider}
                        >
                            <RadioButton.Item style={{flexDirection: "row-reverse"}} mode={"android"}
                                              label="クレジットカード" value="stripe"/>
                            <RadioButton.Item style={{flexDirection: "row-reverse"}} mode={"android"}
                                              label="PayPay" value="paypay"/>
                        </RadioButton.Group>
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