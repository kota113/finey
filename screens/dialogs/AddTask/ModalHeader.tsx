import {View} from "react-native";
import {Button} from "react-native-paper";
import React from "react";

export default ({abortAddingTask, addTaskBtnEnabled, onAddTaskPressed}) => (
    <View style={{justifyContent: "space-between", flexDirection: "row", marginBottom: 5}}>
        <Button onPress={abortAddingTask}>
            閉じる
        </Button>
        <Button mode={"contained"} onPress={onAddTaskPressed} disabled={!addTaskBtnEnabled}>
            追加
        </Button>
    </View>
)