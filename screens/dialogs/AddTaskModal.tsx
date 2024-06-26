import React, {useEffect, useState} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import {useTheme} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {Task} from "../../types";
import uuid from "react-native-uuid";
import ModalHeader from "./AddTask/ModalHeader";
import ModalContents from "./AddTask/ModalContents";
import auth from "@react-native-firebase/auth";
import {storeTasks} from "../../utils/localStorage";
import * as Notifications from "expo-notifications";
import SetDepositModal from "./SetDeposit";
import LoadingDialog from "./Loading";


const addTask = (task: Task, setTasks: React.Dispatch<React.SetStateAction<Task[]>>, setPaymentFailedModalVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    async function requestAPI() {
        const token = await auth().currentUser.getIdToken();
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/add-task`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({id: task.id})
        })
        return res.ok;
    }

    let succeeded = false;
    setTasks((prevTasks) => {
        let newTasks = [...prevTasks];
        storeTasks([...prevTasks, task]).then(() => {
            requestAPI().then((responseSuccess) => {
                if (responseSuccess) {
                    succeeded = true;
                    newTasks = [...prevTasks, task];
                    // notify certain time before due date
                    const notificationDate = new Date(task.dueDate.getTime() - task.notifyBefore);
                    Notifications.scheduleNotificationAsync({
                        content: {
                            title: "期限が近づいています",
                            body: task.name,
                        },
                        trigger: notificationDate,
                    }).then((id) => {
                        task.notificationId = id;
                    })
                } else {
                    succeeded = false;
                    setPaymentFailedModalVisible(true)
                    // undo adding the task
                    storeTasks(prevTasks).then(() => console.log("undone adding task"));
                }
            });
        })
        return newTasks;
    });
    return succeeded;
}


const SlidableModal = ({isVisible, setIsVisible, setTasks, setPaymentFailedModalVisible}) => {
    const _tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
    const defaultTask: Task = {
        id: uuid.v4() as string,
        name: "",
        isCompleted: false,
        deposit: 1000,
        dueDate: new Date(`${_tomorrow.getFullYear()}-${_tomorrow.getMonth() + 1}-${_tomorrow.getDate()}T23:59:59`),
        notificationId: "",
        notifyBefore: 30 * 60 * 1000
    }
    const [task, setTask] = useState<Task>(defaultTask)
    const [addingTaskModalVisible, setAddingTaskModalVisible] = useState<boolean>(false)
    const [depositModalVisible, setDepositModalVisible] = useState<boolean>(false);
    const safeAreaInsets = useSafeAreaInsets();
    const height = Dimensions.get('window')["height"] - safeAreaInsets.top;
    const heightOptions = {
        visible: height * 0.83,
        hidden: height * 1.5,
    }
    const theme = useTheme();
    const translateY = useSharedValue(height);

    function abortAddingTask() {
        setIsVisible(false);
        setTask(defaultTask);
    }

    function setDeposit(deposit: number) {
        const updatedTask = {...task};
        updatedTask.deposit = deposit;
        setDepositModalVisible(false);
        setAddingTaskModalVisible(true);
        const succeeded = addTask(updatedTask, setTasks, setPaymentFailedModalVisible);
        setAddingTaskModalVisible(false);
        if (succeeded) {
            setTask(defaultTask);
            setIsVisible(false);
        }
        // setTask((currentTask) => {
        //     const updatedTask = {...currentTask};
        //     updatedTask.deposit = deposit;
        //     return updatedTask;
        // });
    }

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{translateY: translateY.value}],
        };
    });

    useEffect(() => {
        if (isVisible) {
            translateY.value = withSpring(heightOptions.visible, {mass: 0.3});
        } else {
            translateY.value = withSpring(heightOptions.hidden, {mass: 0.3});
        }
    }, [isVisible]);

    return (
        // <View style={{flex: 1}}>
        <>
            <Animated.View style={[{...styles.modal, backgroundColor: theme.colors.secondaryContainer}, animatedStyle]}>
                {isVisible &&
                    <View style={styles.modalContent}>
                        <ModalHeader
                            abortAddingTask={abortAddingTask}
                            addTaskBtnEnabled={task.name && task.dueDate && task.notifyBefore}
                            onAddTaskPressed={() => setDepositModalVisible(true)}
                        />
                        <ModalContents translateY={translateY}
                                       heightOptions={heightOptions} task={task} setTask={setTask}/>
                    </View>
                }
            </Animated.View>
            {isVisible && <>
                <SetDepositModal currentValue={task.deposit} visible={depositModalVisible} onConfirm={setDeposit}
                                 onAbort={() => setDepositModalVisible(false)}
                />
            </>}
            <LoadingDialog visible={addingTaskModalVisible}/>
        </>
        //     </View>
    );
};

const styles = StyleSheet.create({
    modal: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        bottom: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalContent: {
        flex: 1,
        paddingTop: 15,
        paddingHorizontal: 20
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 25,
        marginBottom: 20,
    },
    closeButton: {
        fontSize: 16,
        color: 'blue',
    },
});

export default SlidableModal;
