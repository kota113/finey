import {Button, Dialog, Portal} from "react-native-paper";
import {Text} from "react-native";
import React from "react";

export default ({dialogVisible, setDialogVisible, onVerified}) => (
    <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => {
            setDialogVisible(false)
        }}>
            <Dialog.Title>メールアドレスを認証</Dialog.Title>
            <Dialog.Content>
                <Text>ご入力のメールアドレスに確認メールを送信しました。ご確認ください。</Text>
                <Text>確認が完了しましたら、完了ボタンを押してください</Text>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => {
                    setDialogVisible(false)
                    onVerified()
                }}>完了</Button>
            </Dialog.Actions>
        </Dialog>
    </Portal>
)