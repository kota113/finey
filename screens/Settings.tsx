import {FlatList, View} from "react-native";
import {Appbar, Button, Dialog, List, Portal, Snackbar, Text, useTheme} from "react-native-paper";
import * as Linking from "expo-linking";
import appConfig from "../app.config";
import {useCallback, useState} from "react";
import {PaymentProvider} from "../types";
import {getLocalData} from "../utils/localStorage";
import {useFocusEffect} from "@react-navigation/native";


interface SettingsItem {
    label: string,
    icon: string,
    screen?: string,
    onPress?: () => void
}


const TopAppBar = ({navigation}) => (
    <Appbar.Header>
        <Appbar.Action icon="arrow-left" onPress={() => navigation.goBack()}/>
        <Appbar.Content title="設定"/>
    </Appbar.Header>
)


const PaymentProviderDialog = ({
                                   visible,
                                   setVisible,
                                   selected,
                                   setSelected,
                                   selectedBackgroundColor,
                                   theme,
                                   onSubmit
                               }) => (
    <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
            <Dialog.Title>決済方法</Dialog.Title>
            <Dialog.Content>
                <List.Item
                    rippleColor={theme.colors.primary}
                    style={{
                        backgroundColor: selected === "stripe" ? selectedBackgroundColor : "transparent",
                        borderRadius: 15
                    }}
                    contentStyle={{borderRadius: 15}}
                    title="クレジットカード"
                    description="クレジットカードを登録して、決済をスムーズに行います。"
                    left={props => <List.Icon {...props} icon="credit-card-outline"/>}
                    onPress={() => {
                        setSelected("stripe")
                    }}
                />
                <List.Item
                    rippleColor={theme.colors.primary}
                    style={{
                        backgroundColor: selected === "paypay" ? selectedBackgroundColor : "transparent",
                        borderRadius: 15
                    }}
                    title="PayPay"
                    description="PayPayアカウントの残高から決済を行います。PayPayアカウントとの連携が必要です。"
                    left={props => <List.Icon {...props} icon="cellphone"/>}
                    onPress={() => {
                        setSelected("paypay");
                    }}
                />
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => setVisible(false)}>閉じる</Button>
                <Button onPress={onSubmit}>決定</Button>
            </Dialog.Actions>
        </Dialog>
    </Portal>
)


const Settings = ({navigation}: { navigation: any }) => {
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
    const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<PaymentProvider>(undefined);
    const theme = useTheme()

    useFocusEffect(
        useCallback(() => {
            getLocalData("paymentProvider").then((provider: PaymentProvider) => {
                setSelectedPaymentProvider(provider)
            })
            return () => {
            };
        }, [])
    );

    function onSubmitPaymentProvider() {
        setPaymentDialogVisible(false)
        getLocalData("paymentProvider").then((provider: PaymentProvider) => {
            if (selectedPaymentProvider === "stripe" && provider === "paypay") {
                navigation.navigate("SetupStripe")
            } else if (selectedPaymentProvider === "paypay" && provider === "stripe") {
                navigation.navigate("SetupPayPay")
            }
        })
    }

    const settings: SettingsItem[] = [
        {
            label: "決済方法",
            icon: "credit-card-settings-outline",
            onPress: () => setPaymentDialogVisible(true)
        },
        {
            label: "通知",
            icon: "bell",
            onPress: () => Linking.openSettings()
        },
        {
            label: "バージョン",
            icon: "information",
            onPress: () => setSnackbarVisible(true)
        }
    ]
    const selectedBackgroundColor = "rgba(0,108,83,0.25)"
    return (
        <>
            <FlatList
                data={settings}
                keyExtractor={(item) => item.label}
                renderItem={
                    ({item}) => (
                        <List.Item
                            style={{paddingHorizontal: 10, paddingVertical: 10}}
                            title={item.label}
                            left={props => <List.Icon {...props} icon={item.icon}/>}
                            onPress={item.onPress ? item.onPress : () => {
                                navigation.navigate(item.screen)
                            }}
                        />
                    )
                }
            />
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                action={{
                    label: 'OK',
                    onPress: () => {
                        setSnackbarVisible(false)
                    },
                }}>
                <Text style={{color: "white"}}>バージョン {appConfig.expo.version}</Text>
            </Snackbar>
            <PaymentProviderDialog
                visible={paymentDialogVisible}
                setVisible={setPaymentDialogVisible}
                selected={selectedPaymentProvider}
                setSelected={setSelectedPaymentProvider}
                selectedBackgroundColor={selectedBackgroundColor}
                theme={theme}
                onSubmit={onSubmitPaymentProvider}
            />
        </>
    )
}


export default function Screen({navigation}: { navigation: any }) {
    return (
        <View style={{flex: 1}}>
            <TopAppBar navigation={navigation}/>
            <Settings navigation={navigation}/>
        </View>
    )
}