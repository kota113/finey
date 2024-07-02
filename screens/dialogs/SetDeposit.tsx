import React, {useState} from "react";
import {ActivityIndicator, Button, Dialog, HelperText, Portal, TextInput} from "react-native-paper";

export default ({currentValue, visible, onConfirm, onAbort, loading}) => {
    const [deposit, setDeposit] = useState<number>(currentValue);
    const hasError = () => {
        return deposit && deposit < 1000;
    };
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onAbort} dismissable={!loading} dismissableBackButton={!loading}>
                {loading ?
                    <>
                        <Dialog.Title>お支払い中…</Dialog.Title>
                        <Dialog.Content>
                            <ActivityIndicator size={"large"} style={{flex: 1, marginVertical: 40}}/>
                        </Dialog.Content>
                    </>
                    :
                    <>
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
                    </>
                }
            </Dialog>
        </Portal>
    );
};