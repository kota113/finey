import {Button, Dialog, Portal} from "react-native-paper";
import {Text} from "react-native";
import React from "react";

export default ({loginFailedMessage, setLoginFailedMessage}) => (
    <Portal>
        <Dialog visible={Boolean(loginFailedMessage)}>
            <Dialog.Title>エラー</Dialog.Title>
            <Dialog.Content>
                <Text>{loginFailedMessage ? loginFailedMessage : ""}</Text>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => {
                    setLoginFailedMessage(null)
                }}>閉じる</Button>
            </Dialog.Actions>
        </Dialog>
    </Portal>
)