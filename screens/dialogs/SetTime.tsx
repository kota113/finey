import {TimePickerModal} from "react-native-paper-dates";
import React from "react";
import {Button, Dialog, Portal, Text} from "react-native-paper";

export const SetTimeModal = ({visible, setVisible, onConfirm, date}) => {
    const [invalid, setInvalid] = React.useState(false)

    function onConfirmWrapper({hours, minutes}) {
        const selected = new Date(date)
        selected.setHours(hours)
        selected.setMinutes(minutes)
        if (selected < new Date()) {
            setInvalid(true)
            setVisible(false)
        } else {
            onConfirm({hours: hours, minutes: minutes})
        }
    }

    function onInvalidDismiss() {
        setInvalid(false)
        setVisible(true)
    }
    return (
        <>
            {visible &&
                <TimePickerModal
                    locale='ja'
                    visible={visible}
                    onDismiss={() => setVisible(false)}
                    onConfirm={onConfirmWrapper}
                    hours={0}
                    minutes={0}
                    animationType="fade"
                    label={"時間を選択"}
                    cancelLabel={"キャンセル"}
                    confirmLabel={"OK"}
                />
            }
            <Portal>
                <Dialog visible={invalid} onDismiss={onInvalidDismiss}>
                    <Dialog.Title>無効な時間</Dialog.Title>
                    <Dialog.Content>
                        <Dialog.Content>
                            <Text>期限は現在より後にする必要があります</Text>
                        </Dialog.Content>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={onInvalidDismiss}>OK</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </>
    );
};