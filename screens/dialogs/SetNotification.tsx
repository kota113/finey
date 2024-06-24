import React, {useState} from "react";
import {Button, Dialog, Portal, SegmentedButtons, TextInput} from "react-native-paper";

export const SetNotificationModal = ({currentValue, visible, onConfirm, onAbort}) => {
    const [days, setDays] = useState<number>(Math.floor(currentValue / (24 * 60 * 60 * 1000)));
    const [hours, setHours] = useState<number>(Math.floor((currentValue % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)));
    const [minutes, setMinutes] = useState<number>(Math.floor(((currentValue % (24 * 60 * 60 * 1000)) % (60 * 60 * 1000)) / (60 * 1000)));
    const [selectedIndex, setSelectedIndex] = useState<number>(2);
    const buttons = [
        {
            value: 'days',
            label: '日',
            icon: 'calendar',
        },
        {
            value: 'hours',
            label: '時間',
            icon: 'clock',
        },
        {
            value: 'minutes',
            label: '分',
            icon: 'alarm',
        },
    ]

    function onTextChange(number: number) {
        if (buttons[selectedIndex].value === "days") {
            setDays(number);
        } else if (buttons[selectedIndex].value === "hours") {
            setHours(number);
        } else {
            setMinutes(number);
        }
    }

    function onConfirmPressed() {
        // add days, hours, minutes
        const notifyBefore = (
            (days ? days * 24 * 60 * 60 * 1000 : 0) +
            (hours ? hours * 60 * 60 * 1000 : 0) +
            (minutes ? minutes * 60 * 1000 : 0)
        );
        onConfirm(notifyBefore);
    }

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onAbort}>
                <Dialog.Title>いつ通知しますか？</Dialog.Title>
                <Dialog.Content>
                    <SegmentedButtons
                        value={buttons[selectedIndex].value}
                        onValueChange={(value: string) => {
                            setSelectedIndex(buttons.findIndex(b => b.value === value));
                        }}
                        buttons={buttons}
                    />
                    <TextInput
                        style={{marginTop: 13}}
                        keyboardType={"numeric"}
                        value={
                            buttons[selectedIndex].value === "days" ? days ? days.toString() : ""
                                : buttons[selectedIndex].value === "hours" ? hours ? hours.toString() : ""
                                    : minutes ? minutes.toString() : ""
                        }
                        inputMode={"numeric"}
                        placeholder={"0"}
                        onChangeText={(text) => onTextChange(text ? parseInt(text) : undefined)}
                        left={<TextInput.Icon icon={buttons[selectedIndex].icon}/>}
                        right={<TextInput.Affix text={buttons[selectedIndex].label + "前"}/>}
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onAbort}>キャンセル</Button>
                    <Button
                        onPress={onConfirmPressed}
                        disabled={!Boolean(days || minutes || hours)}
                    >
                        決定
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}