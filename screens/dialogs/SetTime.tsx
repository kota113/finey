import {TimePickerModal} from "react-native-paper-dates";
import React from "react";

export const SetTimeModal = ({visible, onConfirm, onAbort}) => {
    return (
        <TimePickerModal
            locale='ja'
            visible={visible}
            onDismiss={onAbort}
            onConfirm={onConfirm}
            hours={0}
            minutes={0}
            animationType="fade"
            label={"時間を選択"}
            cancelLabel={"キャンセル"}
            confirmLabel={"OK"}
        />
    );
};