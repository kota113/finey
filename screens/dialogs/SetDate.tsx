import {DatePickerModal} from "react-native-paper-dates";
import React from "react";

export const DateSetModal = ({visible, onConfirm, onAbort}) => {
    return (
        <DatePickerModal
            locale='ja'
            mode={"single"}
            presentationStyle={"pageSheet"}
            visible={visible}
            onDismiss={onAbort}
            onConfirm={onConfirm}
            animationType="fade"
            label={"日付を選択"}
            saveLabel={"OK"}
            date={new Date()}
        />
    );
};