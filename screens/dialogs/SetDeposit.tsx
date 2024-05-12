import React, {useState} from "react";
import {Button, Dialog, Portal, TextInput} from "react-native-paper";

export const SetDepositModal = ({visible, setVisible, onConfirm}) => {
    const [deposit, setDeposit] = useState<number>();
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                <Dialog.Title>いくら預けますか？</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        keyboardType={"numeric"}
                        value={deposit ? deposit.toLocaleString() : ""}
                        inputMode={"numeric"}
                        onChangeText={(text) => setDeposit(text ? parseInt(text.replaceAll(",", "")) : undefined)}
                        left={<TextInput.Icon icon={"currency-jpy"}/>}
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => setVisible(false)}>キャンセル</Button>
                    <Button onPress={() => {
                        onConfirm(deposit);
                        setVisible(false);
                    }} disabled={!Boolean(deposit)}>決定</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};