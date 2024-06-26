import {Button, Dialog, Portal} from "react-native-paper";

export default ({visible, onConfirm, onAbort}) => {
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onAbort}>
                <Dialog.Title>タスクを削除しますか？</Dialog.Title>
                <Dialog.Actions>
                    <Button onPress={onAbort}>キャンセル</Button>
                    <Button onPress={onConfirm}>削除</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}