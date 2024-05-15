import React, {useEffect, useState} from "react";
import {SafeAreaView, ScrollView, View} from "react-native";
import {Appbar, Chip, IconButton, List, TextInput, Tooltip} from "react-native-paper";
import {getTasks, storeTasks} from "../utils/localStorage";
import * as Notifications from "expo-notifications";
import {SetDepositModal} from "./dialogs/SetDeposit";
import {SetNotificationModal} from "./dialogs/SetNotification";
import {DateSetModal} from "./dialogs/SetDate";
import {SetTimeModal} from "./dialogs/SetTime";
import {SubmitProofModal} from "./dialogs/SubmitProof";
import {GrantNotificationDialog} from "./dialogs/GrantNotification";
import auth, {firebase} from "@react-native-firebase/auth";
import '@react-native-firebase/storage';
import {ProofFile, Task} from "../types";
import SetupPayment from "./dialogs/SetupPayment";


const TopAppBar = ({navigation}) => (
    <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()}/>
        <Appbar.Content title="Finey"/>
    </Appbar.Header>
)


const TaskListItem = ({index, task, deleteTask, markTaskComplete, markTaskIncomplete}) => {
    // if the due is closer than 1 day, disable the delete button
    const deleteTaskEnabled: boolean = task.dueDate.getTime() - Date.now() > 24 * 60 * 60 * 1000;
    const Description = () => (
        <View style={{flexDirection: "row", width: "70%"}}>
            <Chip
                style={{marginHorizontal: 3, marginVertical: 3}}
                icon="alarm"
                mode={"outlined"}
                disabled={task.isCompleted}
            >
                {!task.isCompleted ?
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
                  disabled={task.isCompleted}>{task.deposit?.toLocaleString()}</Chip>
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
            titleStyle={{marginLeft: 5, marginBottom: 5}}
            description={Description}
            disabled={deleteTaskEnabled}
            right={props => (
                <Tooltip title={deleteTaskEnabled ? "期限まで1日以下なので削除できません" : "削除"}>
                    <IconButton {...props} icon="delete"
                                onPress={() => deleteTask(task)}/>
                </Tooltip>
            )}
            left={props =>
                <IconButton {...props}
                            icon={task.isCompleted ? "checkbox-marked-circle-outline" : "checkbox-blank-circle-outline"}
                            onPress={onCheckPress}
                />
            }
        />
    )
}


const TaskList = ({tasks, deleteTask, markTaskComplete, markTaskIncomplete}) => {
    // Filter out completed tasks
    const completedTasks = tasks.filter((task: Task) => task.isCompleted);

    // Group tasks by due date
    const groupedTasks = tasks.reduce((groups: object, task: Task) => {
        if (task.isCompleted) return groups; // Don't group completed tasks
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
            {sections.map((section, index) => (
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
            ))}
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
        </ScrollView>
    );
};


const Screen = ({navigation}) => {
    const [task, setTask] = useState<Task>();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [timeModalVisible, setTimeModalVisible] = useState<boolean>(false);
    const [dateModalVisible, setDateModalVisible] = useState<boolean>(false);
    const [notificationModalVisible, setNotificationModalVisible] = useState<boolean>(false);
    const [depositModalVisible, setDepositModalVisible] = useState<boolean>(false);
    const [submitProofModalVisible, setSubmitProofModalVisible] = useState<boolean>(false);
    const [fileSubmittingTask, setFileSubmittingTask] = useState<Task>();

    useEffect(() => {
        async function fetchTask() {
            const data = await getTasks();
            setTasks(data);
        }

        fetchTask().then()
    }, []);

    function onTextChange(text: string) {
        setTask({
            id: tasks.length,
            name: text,
            isCompleted: false,
            deposit: 0,
            dueDate: new Date(),
            notificationId: "",
            notifyBefore: 0
        });
    }

    function setDueTime(params: any) {
        setTask((currentTask) => {
            const updatedTask = {...currentTask};
            const date = new Date(currentTask.dueDate);
            date.setHours(params.hours);
            date.setMinutes(params.minutes);
            updatedTask.dueDate = date;
            return updatedTask;
        });
        setTimeModalVisible(false);
        setDepositModalVisible(true);
    }

    function setDueDate({date}: { date: Date }) {
        setTask((currentTask) => {
            const updatedTask = {...currentTask};
            updatedTask.dueDate = date;
            return updatedTask;
        });
        setDateModalVisible(false);
        setTimeModalVisible(true);
    }

    function setDeposit(deposit: number) {
        setTask((currentTask) => {
            const updatedTask = {...currentTask};
            updatedTask.deposit = deposit;
            return updatedTask;
        });
        setDepositModalVisible(false);
        setNotificationModalVisible(true);
    }

    function setNotificationBefore(notifyBefore: number) {
        setTask((currentTask) => {
            const updatedTask = {...currentTask};
            updatedTask.notifyBefore = notifyBefore;
            addTask(updatedTask);
            setNotificationModalVisible(false);
            return null;
        });
    }

    const addBtnPressed = () => {
        if (task?.name) {
            setDateModalVisible(true);
        }
    };

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

    function cancelAddTask() {
        setTask(undefined);
        setDateModalVisible(false);
        setTimeModalVisible(false);
        setDepositModalVisible(false);
        setNotificationModalVisible(false);
    }

    const addTask = (task: Task) => {
        setTasks((prevTasks) => {
            storeTasks([...prevTasks, task]).then(() => {
                auth().currentUser.getIdToken().then((token) => {
                    fetch(`${process.env.EXPO_PUBLIC_API_URL}/add-task`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({id: task.id})
                    }).then((res) => {
                        if (!res.ok) {
                            console.error("Failed to execute payment")
                        } else console.log("payment completed")
                    });
                })
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
            });
            return [...prevTasks, task]
        });
    }

    const deleteTask = (task: Task) => {
        const newTasks = tasks.filter(t => t.id !== task.id)
        if (!task.isCompleted) Notifications.cancelScheduledNotificationAsync(task.notificationId).then(() => console.log("cancelled"));
        setTasks(newTasks);
        storeTasks(newTasks).then(() => console.log("stored"));
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            <TopAppBar navigation={navigation}/>
            <View style={{flex: 1, padding: 20}}>
                <TextInput
                    label="タスクを追加"
                    value={task?.name || ""}
                    onChangeText={onTextChange}
                    right={<TextInput.Icon icon={"plus"} onPress={addBtnPressed}/>}
                />
                <TaskList tasks={tasks} deleteTask={deleteTask} markTaskComplete={markTaskComplete}
                          markTaskIncomplete={markTaskIncomplete}/>
            </View>
            <DateSetModal visible={dateModalVisible} onConfirm={setDueDate} onAbort={cancelAddTask}/>
            {timeModalVisible &&
                <SetTimeModal visible={timeModalVisible} onConfirm={setDueTime} onAbort={cancelAddTask}/>}
            {depositModalVisible &&
                <SetDepositModal visible={depositModalVisible} onConfirm={setDeposit} onAbort={cancelAddTask}/>}
            {notificationModalVisible &&
                <SetNotificationModal visible={notificationModalVisible} onConfirm={setNotificationBefore}
                                      onAbort={cancelAddTask}/>}
            <SubmitProofModal visible={submitProofModalVisible} setVisible={setSubmitProofModalVisible}
                              onSubmit={onFileSubmit} onDismiss={cancelFileSubmit}/>
            <GrantNotificationDialog/>
            <SetupPayment/>
        </SafeAreaView>
    );
};

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
