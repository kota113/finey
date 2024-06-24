import {Dialog, Portal, Text} from "react-native-paper";
import React from "react";
import {StyleSheet} from "react-native";

export function PaymentFailedDialog({visible, setVisible}: {
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
}) {
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                <Dialog.Icon icon={"alert"} color={"#ff8c00"}/>
                <Dialog.Title style={styles.dialogTitle}>お支払いに失敗しました</Dialog.Title>
                <Dialog.Content>
                    <Dialog.Content>
                        <Text>ご利用の決済手段が無効となっています。</Text>
                        <Text>別の決済手段をご登録ください。</Text>
                    </Dialog.Content>
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
}

const styles = StyleSheet.create({
    dialogTitle: {
        textAlign: "center"
    }
})
