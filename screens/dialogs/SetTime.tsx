import {TimePickerModal} from "react-native-paper-dates";
import React from "react";

export const SetTimeModal = ({visible, setVisible, onConfirm}) => {
    return (
        <TimePickerModal
            locale='ja'
            visible={visible}
            onDismiss={() => setVisible(false)}
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