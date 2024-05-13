import React, {useState} from "react";
import {Button, Dialog, HelperText, Portal, TextInput} from "react-native-paper";

export const SetDepositModal = ({visible, onConfirm, onAbort}) => {
    const [deposit, setDeposit] = useState<number>(1000);
    const hasError = () => {
        return deposit && deposit < 1000;
    };
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onAbort}>
                <Dialog.Title>いくら預けますか？</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        keyboardType={"numeric"}
                        value={deposit ? deposit.toLocaleString() : ""}
                        inputMode={"numeric"}
                        onChangeText={(text) => {
                            setDeposit(text ? parseInt(text.replaceAll(",", "")) : undefined)
                        }}
                        left={<TextInput.Icon icon={"currency-jpy"}/>}
                    />
                    <HelperText type="error" visible={hasError()}>
                        1000円以上で入力してください
                    </HelperText>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onAbort}>キャンセル</Button>
                    <Button onPress={() => {
                        onConfirm(deposit);
                    }} disabled={!Boolean(deposit) || hasError()}>決定</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};