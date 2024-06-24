import {ActivityIndicator, Dialog, Portal} from "react-native-paper";

export default ({visible}) => (
    <Portal>
        <Dialog visible={visible} dismissable={false} dismissableBackButton={false}>
            <Dialog.Content>
                <ActivityIndicator size={"large"} style={{flex: 1}}/>
            </Dialog.Content>
        </Dialog>
    </Portal>
)
