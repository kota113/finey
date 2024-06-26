import {Button, Dialog, Portal, Text} from "react-native-paper";
import React from "react";
import {StyleSheet} from "react-native";

export default ({visible, setVisible, navigation}: {
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    navigation: any
}) => {
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                <Dialog.Icon icon={"alert"} color={"#ff8c00"}/>
                <Dialog.Title style={styles.dialogTitle}>お支払いに失敗しました</Dialog.Title>
                <Dialog.Content>
                    <Text>ご利用の決済手段が無効となっています。</Text>
                    <Text>別の決済手段をご登録ください。</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => {
                        setVisible(false);
                        navigation.navigate("EditPayment");
                    }}>決済手段を変更</Button>
                    <Button onPress={() => setVisible(false)}>閉じる</Button>
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
