import React, {useEffect, useState} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import {useTheme} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {Task} from "../../types";
import uuid from "react-native-uuid";
import ModalHeader from "./AddTask/ModalHeader";
import ModalContents from "./AddTask/ModalContents";
import {getTasks, storeTasks} from "../../utils/localStorage";
import * as Notifications from "expo-notifications";
import SetDepositModal from "./SetDeposit";
import {requestBackend} from "../../utils/apiRequest";


async function addTask(
    task: Task,
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
    setPaymentFailedModalVisible: React.Dispatch<React.SetStateAction<boolean>>
): Promise<boolean> {
    async function requestAPI() {
        const res = await requestBackend("/add-task", "POST", {id: task.id});
        return res.ok;
    }

    let succeeded: boolean;
    const prevTasks = await getTasks();
    await storeTasks([...prevTasks, task]);

    try {
        const responseSuccess = await requestAPI();
        if (responseSuccess) {
            succeeded = true;
            // notify certain time before due date
            const notificationDate = new Date(task.dueDate.getTime() - task.notifyBefore);
            task.notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "期限が近づいています",
                    body: task.name,
                },
                trigger: notificationDate,
            });
            setTasks((prevTasks) => [...prevTasks, task]);
        } else {
            succeeded = false;
            await storeTasks(prevTasks);
            setPaymentFailedModalVisible(true);
        }
    } catch (error) {
        console.error("Error adding task:", error);
        succeeded = false;
    }

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
    const [loading, setLoading] = useState<boolean>(false);
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
        setLoading(true);
        addTask(updatedTask, setTasks, setPaymentFailedModalVisible).then((succeeded) => {
            setDepositModalVisible(false);
            setLoading(false);
            if (succeeded) {
                setTask(defaultTask);
                setIsVisible(false);
            }
        });
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
                                 onAbort={() => setDepositModalVisible(false)} loading={loading}
                />
            </>}
        </>
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
