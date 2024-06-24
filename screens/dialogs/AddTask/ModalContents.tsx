import {Button, Icon, TextInput} from "react-native-paper";
import {withSpring} from "react-native-reanimated";
import {Keyboard, View} from "react-native";
import React, {useEffect, useMemo, useState} from "react";
import {DateSetModal} from "../SetDate";
import {SetTimeModal} from "../SetTime";
import {Task} from "../../../types";
import {SetNotificationModal} from "../SetNotification";


export default ({translateY, heightOptions, task, setTask}) => {
    const taskTitleInput = React.useRef(null);
    const [taskTitle, setTaskTitle] = useState<string>("");
    const [timeModalVisible, setTimeModalVisible] = useState<boolean>(false);
    const [dateModalVisible, setDateModalVisible] = useState<boolean>(false);
    const [notificationModalVisible, setNotificationModalVisible] = useState<boolean>(false);
    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", (e) => {
            const keyboardHeight = e.endCoordinates.height;
            // if all modals are closed
            if (!timeModalVisible && !dateModalVisible && !notificationModalVisible) {
                translateY.value = withSpring(heightOptions.visible - keyboardHeight, {mass: 0.3});
            }
        });
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            translateY.value = withSpring(heightOptions.visible, {mass: 0.3});
            taskTitleInput.current?.blur();
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    function onTextChange(text: string) {
        setTask((currentTask: Task) => {
            const updatedTask = {...currentTask};
            updatedTask.name = text;
            return updatedTask;
        });
    }

    function setDueTime(params: { hours: number, minutes: number }) {
        setTask((currentTask: Task) => {
            const updatedTask = {...currentTask};
            const date = new Date(currentTask.dueDate);
            date.setHours(params.hours);
            date.setMinutes(params.minutes);
            updatedTask.dueDate = date;
            return updatedTask;
        });
        setTimeModalVisible(false);
    }

    function setDueDate({date}: { date: Date }) {
        setTask((currentTask: Task) => {
            const updatedTask = {...currentTask};
            updatedTask.dueDate = date;
            return updatedTask;
        });
        setDateModalVisible(false);
    }

    function setNotifyBefore(notifyBefore: number) {
        setTask((currentTask: Task) => {
            const updatedTask = {...currentTask};
            updatedTask.notifyBefore = notifyBefore;
            setNotificationModalVisible(false);
            return updatedTask;
        });
    }

    const TitleInput = useMemo(() => (
        <TextInput
            ref={taskTitleInput}
            contentStyle={{fontSize: 25}}
            mode={"flat"}
            placeholder={"タイトルを入力"}
            underlineStyle={{height: 0}}
            style={{backgroundColor: "transparent", width: "100%"}}
            underlineColor={"transparent"}
            autoFocus={true}
            value={taskTitle}
            onChangeText={setTaskTitle}
            onBlur={() => onTextChange(taskTitle)}
        />
    ), [taskTitle, taskTitleInput]);
    const ShortInfoInput = () => (
        <View style={{
            flexDirection: "row",
            paddingHorizontal: 10,
            paddingTop: 10,
            justifyContent: "center",
            alignItems: "center"
        }}>
            <Icon source={"calendar"} size={30}/>
            <Button
                mode={"outlined"}
                style={{
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 15,
                    marginLeft: 3
                }}
                compact={true}
                labelStyle={{fontSize: 19, fontWeight: "500"}}
                onPress={() => {
                    taskTitleInput.current?.blur();
                    setDateModalVisible(true)
                }}
            >
                {task?.dueDate.toLocaleDateString()}
            </Button>
            <Icon source={"clock-outline"} size={30}/>
            <Button
                mode={"outlined"}
                style={{
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 15,
                    marginLeft: 3
                }}
                compact={true}
                labelStyle={{fontSize: 19, fontWeight: "500"}}
                onPress={() => {
                    taskTitleInput.current?.blur();
                    setTimeModalVisible(true)
                }}
            >
                {/*time string in 24h format*/}
                {task?.dueDate.toLocaleTimeString(['ja'], {hour: '2-digit', minute: '2-digit'}).slice(0, 5)}
            </Button>
            <Icon source={"bell"} size={30}/>
            <Button
                mode={"outlined"}
                style={{borderRadius: 10, justifyContent: "center", alignItems: "center", marginLeft: 3}}
                compact={true}
                labelStyle={{fontSize: 18, fontWeight: "500"}}
                onPress={() => {
                    taskTitleInput.current?.blur();
                    setNotificationModalVisible(true)
                }}
            >
                {Math.floor(task?.notifyBefore / 60000)}分前
            </Button>
        </View>
    )

    return (
        <View style={{flex: 1, flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start"}}>
            {TitleInput}
            <ShortInfoInput/>
            <DateSetModal currentValue={task?.dueDate} visible={dateModalVisible} onConfirm={setDueDate}
                          onAbort={() => setDateModalVisible(false)}/>
            <SetTimeModal date={task?.dueDate} setVisible={setTimeModalVisible} visible={timeModalVisible}
                          onConfirm={setDueTime}/>
            <SetNotificationModal currentValue={task?.notifyBefore} visible={notificationModalVisible}
                                  onConfirm={setNotifyBefore}
                                  onAbort={() => setNotificationModalVisible(false)}/>
        </View>
    )
}
