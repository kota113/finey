import {DatePickerModal} from "react-native-paper-dates";
import React from "react";

export const DateSetModal = ({visible, setVisible, onConfirm}) => {
    return (
        <DatePickerModal
            locale='ja'
            mode={"single"}
            presentationStyle={"pageSheet"}
            visible={visible}
            onDismiss={() => setVisible(false)}
            onConfirm={onConfirm}
            animationType="fade"
            label={"日付を選択"}
            saveLabel={"OK"}
            date={new Date()}
        />
    );
};