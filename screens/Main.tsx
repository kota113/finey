import React, {useEffect, useState} from "react";
import {ScrollView, StyleSheet, View} from "react-native";
import {ActivityIndicator, Appbar, Chip, FAB, IconButton, List, Text, Tooltip, useTheme} from "react-native-paper";
import {getTasks, storeTasks} from "../utils/localStorage";
import * as Notifications from "expo-notifications";
import {SubmitProofModal} from "./dialogs/SubmitProof";
import PaymentFailedDialog from "./dialogs/PaymentFailed";
import {GrantNotificationDialog} from "./dialogs/GrantNotification";
import auth, {firebase} from "@react-native-firebase/auth";
import '@react-native-firebase/storage';
import {ProofFile, Task} from "../types";
import SetupPayment from "./dialogs/SetupPayment";
import AddTaskModal from "./dialogs/AddTaskModal";


const TopAppBar = ({navigation}) => (
    <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()}/>
        <Appbar.Content title="Finey"/>
    </Appbar.Header>
)


const TaskListItem = ({index, task, deleteTask, markTaskComplete, markTaskIncomplete}: {
    index: number,
    task: Task,
    deleteTask: (task: Task) => void,
    markTaskComplete: (task: Task) => void,
    markTaskIncomplete: (task: Task) => void
}) => {
    // if the due is closer than 1 day, disable the delete button
    const remainingTime = task.dueDate.getTime() - Date.now()
    const deleteTaskDisabled: boolean = Boolean(remainingTime <= 24 * 60 * 60 * 1000) && Boolean(0 <= remainingTime);
    const isTaskOutdated: boolean = Boolean(remainingTime < 0);
    const Description = () => (
        <View style={{flexDirection: "row", width: "70%"}}>
            <Chip
                style={{marginHorizontal: 3, marginVertical: 3}}
                icon="alarm"
                mode={"outlined"}
                disabled={task.isCompleted || isTaskOutdated}
            >
                {/* if tasks is in not in main section, show date */}
                {(!task.isCompleted && !isTaskOutdated) ?
                    task.dueDate?.toLocaleTimeString([], {hour: "numeric", minute: "numeric"})
                    :
                    task.dueDate?.toLocaleString(["ja"], {
                        month: "numeric",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric"
                    })
                }
            </Chip>
            <Chip style={{marginHorizontal: 3, marginVertical: 3}} icon="currency-jpy" mode={"outlined"}
                  disabled={task.isCompleted || isTaskOutdated}>{task.deposit?.toLocaleString()}</Chip>
        </View>
    )

    function onCheckPress() {
        setTimeout(() => {
            task.isCompleted ? markTaskIncomplete(task) : markTaskComplete(task);
        }, 150);
    }

    return (
        <List.Item
            key={index}
            title={task.name}
            titleStyle={{
                marginLeft: 5,
                marginBottom: 5,
                color: (isTaskOutdated) ? "grey" : undefined,
                textDecorationLine: (!task.isCompleted && isTaskOutdated) ? 'line-through' : 'none'
            }}
            description={Description}
            disabled={deleteTaskDisabled}
            right={props => (
                // if the due is closer than 1 day, disable the delete button
                deleteTaskDisabled ? (
                        <Tooltip
                            title={"期限まで1日以下です。削除できません。"}
                            enterTouchDelay={50}
                        >
                            <IconButton {...props} icon="delete" disabled={deleteTaskDisabled}
                                        onPress={() => deleteTask(task)}/>
                        </Tooltip>
                    ) :
                    // show delete button only for ongoing tasks with a due date further than 1 day
                    (
                        <IconButton {...props} icon="delete" disabled={!Boolean(!task.isCompleted && !isTaskOutdated)}
                                    onPress={() => deleteTask(task)}/>
                    )
            )}
            left={props =>
                <IconButton
                    {...props}
                    disabled={isTaskOutdated}
                    icon={task.isCompleted ? "checkbox-marked-circle-outline" : "checkbox-blank-circle-outline"}
                    onPress={onCheckPress}
                />
            }
        />
    )
}


const TaskList = ({tasks, deleteTask, markTaskComplete, markTaskIncomplete}) => {
    const theme = useTheme()

    // Filter out outdated tasks
    const outdatedTasks = tasks.filter((task: Task) => (task.dueDate.getTime() < new Date().getTime()) && !task.isCompleted);

    // Filter out completed tasks
    const completedTasks = tasks.filter((task: Task) => task.isCompleted);


    // Group tasks by due date
    const groupedTasks = tasks.reduce((groups: object, task: Task) => {
        if (task.isCompleted) return groups; // Don't group completed tasks
        if (outdatedTasks.includes(task)) return groups; // Don't group completed tasks
        const date = task.dueDate.toISOString().split('T')[0]; // Get the date part of the timestamp
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(task);
        return groups;
    }, {});

    // Convert the groups object to an array of sections
    let sections = Object.keys(groupedTasks).map(date => ({
        title: `${new Date(date).getMonth() + 1}月${new Date(date).getDate()}日(${["日", "月", "火", "水", "木", "金", "土"][new Date(date).getDay()]})`,
        data: groupedTasks[date].sort((a: Task, b: Task) => a.dueDate.getTime() - b.dueDate.getTime()) // Sort tasks by time within each group
    }));

    sections = sections.sort((a, b) => {
        const dateA = new Date(a.title);
        const dateB = new Date(b.title);
        return dateA.getTime() - dateB.getTime();
    });

    return (
        <ScrollView style={{flex: 1, paddingTop: 5}}>
            {tasks.length > 0 ?
                sections.map((section, index) => (
                    <List.Section
                        key={index}
                    >
                        <List.Subheader>{section.title}</List.Subheader>
                        {/*  don't use FlatList  */}
                        {section.data.map((task: Task, index: number) => {
                            return (
                                <TaskListItem
                                    key={index}
                                    index={index}
                                    task={task}
                                    deleteTask={deleteTask}
                                    markTaskComplete={markTaskComplete}
                                    markTaskIncomplete={markTaskIncomplete}
                                />
                            )
                        })}
                    </List.Section>
                ))
                :
                <View style={{alignSelf: 'center', flex: 1}}>
                    <Text style={{textAlign: "center", fontSize: 20}}>タスクがありません</Text>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <IconButton icon={'plus'} mode={'contained-tonal'}
                                    style={{borderRadius: 13, backgroundColor: theme.colors.primaryContainer}}/>
                        <Text style={{textAlign: "center", fontSize: 20}}>ボタンから追加できます</Text>
                    </View>
                </View>
            }
            {completedTasks.length > 0 &&
                <List.Accordion title={"完了済み"}>
                    {completedTasks.map((task: Task, index: number) => (
                        <TaskListItem
                            key={index}
                            index={index}
                            task={task}
                            deleteTask={deleteTask}
                            markTaskComplete={markTaskComplete}
                            markTaskIncomplete={markTaskIncomplete}
                        />
                    ))}
                </List.Accordion>
            }
            {outdatedTasks.length > 0 &&
                <List.Accordion title={"期限切れ"} titleStyle={{color: theme.colors.error}}>
                    {outdatedTasks.map((task: Task, index: number) => (
                        <TaskListItem
                            key={index}
                            index={index}
                            task={task}
                            deleteTask={deleteTask}
                            markTaskComplete={markTaskComplete}
                            markTaskIncomplete={markTaskIncomplete}
                        />
                    ))}
                </List.Accordion>
            }
        </ScrollView>
    );
};


const AddTaskFAB = ({onPress}) => (
    <FAB
        variant={"primary"}
        icon="plus"
        style={styles.fab}
        onPress={onPress}
    />
)


const Screen = ({navigation}) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState<boolean>(true)
    const [submitProofModalVisible, setSubmitProofModalVisible] = useState<boolean>(false);
    const [paymentFailedModalVisible, setPaymentFailedModalVisible] = useState<boolean>(false);
    const [fileSubmittingTask, setFileSubmittingTask] = useState<Task>();
    const [addTaskModalVisible, setAddTaskModalVisible] = useState<boolean>(false);
    const theme = useTheme();

    useEffect(() => {
        async function fetchTask() {
            const data = await getTasks();
            setTasks(data);
            setLoadingTasks(false);
        }

        fetchTask().then()
    }, []);

    const markTaskComplete = (task: Task) => {
        setFileSubmittingTask(task)
        setSubmitProofModalVisible(true)
    }

    function cancelFileSubmit() {
        setSubmitProofModalVisible(false)
        setFileSubmittingTask(undefined)
    }

    async function onFileSubmit(file: ProofFile, description: string) {
        const fileRef = `${auth().currentUser.uid}/${file.title || file.uri.split("/").pop()}`
        return firebase.storage().ref(fileRef).putFile(
            file.uri,
            {
                customMetadata: {
                    taskId: fileSubmittingTask.id.toString(),
                    taskTitle: fileSubmittingTask.name,
                    description: description
                }
            }
        ).then(async () => {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/mark-task-as-completed`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + await auth().currentUser.getIdToken()
                },
                body: JSON.stringify({id: fileSubmittingTask.id})
            })
            if (!res.ok) {
                console.error("Failed to mark task as complete")
            }
            const newTasks = tasks.map(t => {
                if (t.id === fileSubmittingTask.id) {
                    t.isCompleted = true;
                    t.proofFileRef = fileRef;
                    Notifications.cancelScheduledNotificationAsync(t.notificationId).then(() => console.log("cancelled"));
                }
                return t;
            });
            setTasks(newTasks);
            await storeTasks(newTasks);
        })
    }

    const markTaskIncomplete = (task: Task) => {
        const newTasks = tasks.map(t => {
            if (t.id === task.id) {
                t.isCompleted = false;
                // notify certain time before due date
                const notificationDate = new Date(t.dueDate.getTime() - t.notifyBefore);
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: "期限が近づいています",
                        body: t.name,
                    },
                    trigger: notificationDate,
                }).then((id) => {
                    t.notificationId = id;
                })
            }
            return t;
        });
        setTasks(newTasks);
        storeTasks(newTasks).then();
        return true;
    }

    const deleteTask = (task: Task) => {
        const newTasks = tasks.filter(t => t.id !== task.id)
        if (!task.isCompleted) Notifications.cancelScheduledNotificationAsync(task.notificationId).then(() => console.log("cancelled"));
        setTasks(newTasks);
        storeTasks(newTasks).then(() => console.log("stored"));
    };

    return (
        <View style={{flex: 1}}>
            <TopAppBar navigation={navigation}/>
            <View style={{flex: 1, padding: 20, backgroundColor: theme.colors.background}}>
                {loadingTasks ?
                    <ActivityIndicator size={"large"} style={{marginTop: 20, flex: 1}}/>
                    :
                    <TaskList tasks={tasks} deleteTask={deleteTask} markTaskComplete={markTaskComplete}
                              markTaskIncomplete={markTaskIncomplete}/>
                }
            </View>
            <SubmitProofModal visible={submitProofModalVisible} setVisible={setSubmitProofModalVisible}
                              onSubmit={onFileSubmit} onDismiss={cancelFileSubmit}/>
            <GrantNotificationDialog/>
            <PaymentFailedDialog visible={paymentFailedModalVisible} setVisible={setPaymentFailedModalVisible}
                                 navigation={navigation}/>
            <SetupPayment/>
            <AddTaskFAB onPress={() => setAddTaskModalVisible(true)}/>
            <AddTaskModal isVisible={addTaskModalVisible} setIsVisible={setAddTaskModalVisible} setTasks={setTasks}
                          setPaymentFailedModalVisible={setPaymentFailedModalVisible}/>
        </View>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        margin: 25,
        right: 0,
        bottom: 0,
    },
})

export default ({navigation}) => {
    if (auth().currentUser === null) {
        navigation.reset({
            index: 0,
            routes: [{name: 'Setup'}]
        })
    }
    return (
        <Screen navigation={navigation}/>
    );
};
