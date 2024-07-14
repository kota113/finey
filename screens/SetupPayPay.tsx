import {Avatar, Button, Card, Dialog, Portal, Text, useTheme} from "react-native-paper";
import {useState} from "react";
import {storeLocalData} from "../utils/localStorage";
import {View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";

export default ({navigation}) => {
    const [loading, setLoading] = useState(false);
    const [successDialogVisible, setSuccessDialogVisible] = useState(false);
    const theme = useTheme()
    const safeAreaInsets = useSafeAreaInsets();

    function onSubmit() {
        storeLocalData("paymentProvider", "paypay").then(() => {
            console.log("PayPay setup here")
        })
    }

    return (
        <>
            <StatusBar style={"auto"}/>
            <View
                style={{
                    flex: 1,
                    backgroundColor: theme.colors.background,
                    paddingHorizontal: 20,
                    paddingVertical: 35,
                    marginTop: safeAreaInsets.top
                }}>
                <Text variant={"displaySmall"} style={{marginBottom: 12}}>PayPay決済を設定</Text>
                <Text
                    variant={"bodyMedium"}>設定後も、設定からいつでもクレジットカード決済に戻すことが可能です。</Text>
                <Card mode={"outlined"} style={{marginTop: 17}}>
                    <Card.Title
                        title="PayPay残高から決済"
                        left={(props) => <Avatar.Icon {...props} icon={"bank"} size={47}/>}
                    />
                    <Card.Content>
                        <Text>・PayPayの残高から決済されます。</Text>
                        <Text>・残高が不足する場合はエラーとなります。</Text>
                        <Text>・PayPayに登録のカードからは決済できません。</Text>
                    </Card.Content>
                </Card>
                <Card mode={"outlined"} style={{marginTop: 25}}>
                    <Card.Title
                        title="セキュリティ"
                        left={(props) => <Avatar.Icon {...props} icon={"lock"} size={47}/>}
                    />
                    <Card.Content>
                        <Text>・決済情報は保存されません</Text>
                        <Text>・PayPayアカウントから決済が行われます</Text>
                    </Card.Content>
                </Card>
                <Card mode={"outlined"} style={{marginTop: 17}}>
                    <Card.Title
                        title="アカウントの再連携"
                        left={(props) => <Avatar.Icon {...props} icon={"refresh"} size={47}/>}
                    />
                    <Card.Content>
                        <Text>・定期的な再連携が必要です。</Text>
                        <Text>・決済ごとの連携は必要ありません。</Text>
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
                        <Text>今後のお支払いには連携したPayPayアカウントが使用されます。</Text>
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
        </>
    )
}