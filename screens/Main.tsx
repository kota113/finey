import React, {useEffect, useState} from "react";
import {SafeAreaView, ScrollView, View} from "react-native";
import {Appbar, Chip, IconButton, List, TextInput} from "react-native-paper";
import {getData, storeData} from "../utils/localStorage";
import * as Notifications from "expo-notifications";
import {SetDepositModal} from "./dialogs/SetDeposit";
import {SetNotificationModal} from "./dialogs/SetNotification";
import {DateSetModal} from "./dialogs/SetDate";
import {SetTimeModal} from "./dialogs/SetTime";
import {SubmitProofModal} from "./dialogs/SubmitProof";
import {GrantNotificationDialog} from "./dialogs/GrantNotification";

interface Task {
    id: number;
    name: string;
    isCompleted: boolean;
    deposit: number;
    dueDate: Date;
    notificationId: string;
    notifyBefore: number;
}


const TopAppBar = ({navigation}) => (
    <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()}/>
        <Appbar.Content title="Finey"/>
    </Appbar.Header>
)


const TaskListItem = ({index, task, deleteTask, markTaskComplete, markTaskIncomplete}) => {
    const [leftIcon, setLeftIcon] = useState(task.isCompleted ? "checkbox-marked-circle-outline" : "checkbox-blank-circle-outline");
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
        setLeftIcon(task.isCompleted ? "checkbox-blank-circle-outline" : "checkbox-marked-circle-outline");
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
            right={props => <IconButton {...props} icon="delete"
                                        onPress={() => deleteTask(task)}/>}
            left={props => <IconButton {...props} icon={leftIcon}
                                       onPress={onCheckPress}/>}
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
        title: `${new Date(date).getMonth()}月${new Date(date).getDate()}日(${["日", "月", "火", "水", "木", "金", "土"][new Date(date).getDay()]})`,
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
    const [notificationSetModalVisible, setNotificationSetModalVisible] = useState<boolean>(false);
    const [depositModalVisible, setDepositModalVisible] = useState<boolean>(false);
    const [submitProofModalVisible, setSubmitProofModalVisible] = useState<boolean>(true);
    const [fileSubmittingTask, setFileSubmittingTask] = useState<Task>();

    useEffect(() => {
        getData("tasks").then((tasks) => {
            console.log(tasks)
            if (tasks) {
                // convert dueDate to Date object
                tasks = tasks.map((task: Task) => {
                    task.dueDate = new Date(task.dueDate);
                    return task;
                });
                setTasks(tasks);
            }
        })
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
        setNotificationSetModalVisible(true);
    }

    function setNotificationBefore(notifyBefore: number) {
        setTask((currentTask) => {
            const updatedTask = {...currentTask};
            updatedTask.notifyBefore = notifyBefore;
            addTask(updatedTask);
            setNotificationSetModalVisible(false);
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

    function onFileSubmit(filePath: string) {
        setSubmitProofModalVisible(false)
        const newTasks = tasks.map(t => {
            if (t.id === fileSubmittingTask.id) {
                t.isCompleted = true;
                Notifications.cancelScheduledNotificationAsync(t.notificationId).then(() => console.log("cancelled"));
            }
            return t;
        });
        setTasks(newTasks);
        storeData("tasks", newTasks).then(() => console.log("stored"));
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
        storeData("tasks", newTasks).then(() => console.log("stored"));
        return true;
    }


    const addTask = (task: Task) => {
        setTasks((prevTasks) => {
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
            storeData("tasks", [...prevTasks, task]).then(() => console.log("stored"));
            return [...prevTasks, task]
        });
    }

    const deleteTask = (task: Task) => {
        const newTasks = tasks.filter(t => t.id !== task.id)
        if (!task.isCompleted) Notifications.cancelScheduledNotificationAsync(task.notificationId).then(() => console.log("cancelled"));
        setTasks(newTasks);
        storeData("tasks", newTasks).then(() => console.log("stored"));
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
            <DateSetModal visible={dateModalVisible} setVisible={setDateModalVisible} onConfirm={setDueDate}/>
            {timeModalVisible &&
                <SetTimeModal visible={timeModalVisible} setVisible={setTimeModalVisible} onConfirm={setDueTime}/>}
            {depositModalVisible && <SetDepositModal visible={depositModalVisible} setVisible={setDepositModalVisible}
                                                     onConfirm={setDeposit}/>}
            {notificationSetModalVisible &&
                <SetNotificationModal visible={notificationSetModalVisible} onConfirm={setNotificationBefore}
                                      setVisible={setNotificationSetModalVisible}/>}
            {submitProofModalVisible &&
                <SubmitProofModal visible={submitProofModalVisible} setVisible={setSubmitProofModalVisible}
                                  onSubmit={onFileSubmit} onDismiss={cancelFileSubmit}/>}
            <GrantNotificationDialog/>
        </SafeAreaView>
    );
};

export default ({navigation}) => {
    getData("user").then((user) => {
        if (!user) {
            navigation.reset({
                index: 0,
                routes: [{name: 'Setup'}]
            })
        }
    });
    return (
        <Screen navigation={navigation}/>
    );
};
