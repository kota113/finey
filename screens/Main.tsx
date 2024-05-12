import React, {useEffect, useState} from "react";
import {SafeAreaView, ScrollView, View} from "react-native";
import {ActivityIndicator, Appbar, Button, Chip, Dialog, IconButton, List, Portal, TextInput} from "react-native-paper";
import {DatePickerModal, TimePickerModal} from "react-native-paper-dates";
import {getData, storeData} from "../utils/localStorage";
import * as Notifications from "expo-notifications";
import {firebase} from "@react-native-firebase/auth";
import {GoogleSignin} from "@react-native-google-signin/google-signin";

interface Task {
    id: number;
    name: string;
    isCompleted: boolean;
    deposit: number;
    dueDate: Date;
    notificationId: string;
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
    const completedTasks = tasks.filter(task => task.isCompleted);

    // Group tasks by due date
    const groupedTasks = tasks.reduce((groups, task) => {
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
        data: groupedTasks[date].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()) // Sort tasks by time within each group
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
                    {completedTasks.map((task, index) => (
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


const TimeSetModal = ({visible, setVisible, onConfirm}) => {
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

const DateSetModal = ({visible, setVisible, onConfirm}) => {
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

const DepositSetModal = ({visible, setVisible, onConfirm}) => {
    const [deposit, setDeposit] = useState<number>();
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                <Dialog.Title>いくら預けますか？</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        keyboardType={"numeric"}
                        value={deposit ? deposit.toLocaleString() : ""}
                        inputMode={"numeric"}
                        onChangeText={(text) => setDeposit(text ? parseInt(text.replaceAll(",", "")) : undefined)}
                        left={<TextInput.Icon icon={"currency-jpy"}/>}
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => setVisible(false)}>キャンセル</Button>
                    <Button onPress={() => {
                        onConfirm(deposit);
                        setVisible(false);
                    }} disabled={!Boolean(deposit)}>決定</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const Screen = ({navigation}) => {
    const [task, setTask] = useState<Task>();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [timeModalVisible, setTimeModalVisible] = useState(false);
    const [dateModalVisible, setDateModalVisible] = useState(false);
    const [depositModalVisible, setDepositModalVisible] = useState(false);

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
            notificationId: ""
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
            addTask(updatedTask);
            return null;
        });
        setDepositModalVisible(false);
    }

    const addBtnPressed = () => {
        if (task?.name) {
            setDateModalVisible(true);
        }
    };

    const markTaskComplete = (task: Task) => {
        const newTasks = tasks.map(t => {
            if (t.id === task.id) {
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
                Notifications.scheduleNotificationAsync({
                    content: {title: t.name},
                    trigger: t.dueDate,
                }).then((id) => {
                    t.notificationId = id;
                })
            }
            return t;
        });
        setTasks(newTasks);
        storeData("tasks", newTasks).then(() => console.log("stored"));
    }


    const addTask = (task) => {
        setTasks((prevTasks) => {
            Notifications.scheduleNotificationAsync({
                content: {title: task.name},
                trigger: task.dueDate,
            }).then((id: string) =>
                task.notificationId = id
            );
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
                <TimeSetModal visible={timeModalVisible} setVisible={setTimeModalVisible} onConfirm={setDueTime}/>}
            {depositModalVisible && <DepositSetModal visible={depositModalVisible} setVisible={setDepositModalVisible}
                                                     onConfirm={setDeposit}/>}
        </SafeAreaView>
    );
};

export default ({navigation}) => {
    // set true if firebase is not initialized
    const [initializing, setInitializing] = React.useState(!Boolean(firebase.app));
    const [googleSignInConfigured, setGoogleSignInConfigured] = React.useState(false);
    getData("user").then((user) => {
        if (!user) {
            navigation.reset({
                index: 0,
                routes: [{name: 'Setup'}]
            })
        }
    });
    if (initializing) {
        firebase.initializeApp({
            // apiKey: process.env.FIREBASE_API_KEY,
            apiKey: "AIzaSyAw-_akclT1RswbPWcNd0gT7Bjf0JaJwQY",
            // appId: process.env.FIREBASE_APP_ID,
            appId: "1:890921992941:android:dd9b8a1460c34a2c5e82e4",
            projectId: "finey-9c921",
            databaseURL: "",
            messagingSenderId: "",
            storageBucket: "",
        }).then(() => setInitializing(false))
    }
    if (!googleSignInConfigured) {
        GoogleSignin.configure({
            webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
        })
        setGoogleSignInConfigured(true)
    }
    return (
        <>
            {initializing ? <ActivityIndicator size={"large"}/> : <Screen navigation={navigation}/>}
        </>
    );
};
