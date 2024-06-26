import {ActivityIndicator, Dialog, Portal} from "react-native-paper";

export default ({visible}) => (
    <Portal>
        <Dialog visible={visible} dismissable={false} dismissableBackButton={false}>
            <Dialog.Title>決済中...</Dialog.Title>
            <Dialog.Content>
                <ActivityIndicator size={"large"} style={{flex: 1, marginVertical: 40}}/>
            </Dialog.Content>
        </Dialog>
    </Portal>
)
