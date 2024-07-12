import {Button, Dialog, Portal, Text} from "react-native-paper";
import {Platform, StyleSheet} from 'react-native';
import {
    AndroidImportance,
    getPermissionsAsync,
    IosAuthorizationStatus,
    NotificationPermissionsStatus,
    requestPermissionsAsync,
    setNotificationChannelAsync
} from "expo-notifications";
import React, {useEffect} from "react";
import * as Linking from 'expo-linking';
import {getLocalData, storeLocalData} from "../../utils/localStorage";


function parsePermissions(
    permissions: NotificationPermissionsStatus,
    setNotificationPermState: React.Dispatch<React.SetStateAction<"AUTHORIZED" | "UNDETERMINED" | "DENIED">>
) {
    let notificationState: "AUTHORIZED" | "UNDETERMINED" | "DENIED";
    if (Platform.OS === "android") {
        if (permissions.granted) {
            notificationState = "AUTHORIZED";
        } else if (permissions.status === "undetermined" || permissions.canAskAgain) {
            notificationState = "UNDETERMINED";
        } else {
            notificationState = "DENIED";
        }
    } else {
        if (permissions.ios?.status === IosAuthorizationStatus.AUTHORIZED) {
            notificationState = "AUTHORIZED";
        } else if (permissions.ios?.status === IosAuthorizationStatus.NOT_DETERMINED) {
            notificationState = "UNDETERMINED";
        } else {
            notificationState = "DENIED"
        }
    }
    setNotificationPermState(notificationState)
    return notificationState
}

export const GrantNotificationDialog = () => {
    const [visible, setVisible] = React.useState(false);
    const [notificationPermState, setNotificationPermState] = React.useState<"UNDETERMINED" | "DENIED" | "AUTHORIZED">("AUTHORIZED");
    useEffect(() => {
        getPermissionsAsync().then((permissions) => {
            const permission = parsePermissions(permissions, setNotificationPermState);
            getLocalData("doNotShowNotificationDialog").then((doNotShow: boolean) => {
                if (permission !== "AUTHORIZED" && !doNotShow) {
                    setVisible(true)
                }
            })
        })
    }, []);

    const setDoNotShowAgain = async () => {
        return await storeLocalData("doNotShowNotificationDialog", true)
    }

    function requestPermission() {
        setVisible(false)
        if (notificationPermState === "UNDETERMINED") {
            requestPermissionsAsync({
                ios: {
                    allowAlert: true,
                    allowBadge: true,
                    allowSound: true
                }
            }).then((permissions) => {
                const notificationState = parsePermissions(permissions, setNotificationPermState);
                if (notificationState === "AUTHORIZED") {
                    // if platform is android, set channel
                    if (Platform.OS === "android") {
                        setNotificationChannelAsync("task", {
                            name: "タスク通知",
                            importance: AndroidImportance.HIGH,
                            vibrationPattern: [0, 250, 250, 250],
                            enableVibrate: true,
                        }).then((channel) => {
                            if (channel === null) {
                                console.log("Failed to create channel");
                                setVisible(true);
                            }
                        })
                    }
                } else {
                    setVisible(true);
                }
            })
        } else if (notificationPermState === "DENIED") {
            Linking.openSettings().then(() => setVisible(false))
        } else { // authorized
            setVisible(false)
        }
    }

    return (
        <Portal>
            <Dialog visible={visible}>
                <Dialog.Icon icon={"bell"} color={"#ff8c00"}/>
                <Dialog.Title style={styles.dialogTitle}>通知を許可してください</Dialog.Title>
                <Dialog.Content>
                    {notificationPermState === "UNDETERMINED" ?
                        <>
                            <Text>タスクの期限を通知するため、権限が必要です。</Text>
                            <Text>次の画面で許可をタップしてください。</Text>
                            <Text>通知が必要ない場合は、この注意を非表示にできます。</Text>
                        </>
                        : notificationPermState === "DENIED" &&
                        <>
                            <Text>通知が拒否されています。</Text>
                            <Text>設定から通知を許可してください。</Text>
                            <Text>通知が必要ない場合は、この注意を非表示にできます。</Text>
                        </>
                    }
                </Dialog.Content>
                <Dialog.Actions style={{justifyContent: "space-between"}}>
                    <Button onPress={() => setDoNotShowAgain().then(() => setVisible(false))}>
                        二度と表示しない
                    </Button>
                    <Button mode={"contained"} contentStyle={{paddingHorizontal: 7}} onPress={requestPermission}>
                        次へ
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    )
}

const styles = StyleSheet.create({
    dialogTitle: {
        textAlign: "center"
    }
})
