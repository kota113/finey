import {useEffect, useState} from "react";
import {SafeAreaView, ScrollView, View} from "react-native";
import {Appbar, Button, Chip, Dialog, IconButton, List, Portal, TextInput} from "react-native-paper";
import {DatePickerModal, TimePickerModal} from "react-native-paper-dates";
import {getData, storeData} from "../utils/localStorage";

interface Task {
    id: number;
    name: string;
    deposit: number;
    dueDate: Date;
}


const TopAppBar = ({navigation}) => (
    <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Finey" />
    </Appbar.Header>
)

const TaskList = ({ tasks, deleteTask }) => {
    // Group tasks by due date
    const groupedTasks = tasks.reduce((groups, task) => {
        const date = task.dueDate.toISOString().split('T')[0]; // Get the date part of the timestamp
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(task);
        return groups;
    }, {});

    // Convert the groups object to an array of sections
    const sections = Object.keys(groupedTasks).map(date => ({
        title: `${new Date(date).getMonth()}月${new Date(date).getDate()}日(${["日", "月", "火", "水", "木", "金", "土"][new Date(date).getDay()]})`,
        data: groupedTasks[date].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()) // Sort tasks by time within each group
    }));

    return (
        <ScrollView style={{flex: 1, paddingTop: 5}}>
            {sections.map((section, index) => (
                <List.Section
                    key={index}
                >
                    <List.Subheader>{section.title}</List.Subheader>
                    {/*  don't use FlatList  */}
                    {section.data.map((task: Task, index: number) => {
                        const Description = () => (
                            <View style={{flexDirection: "row", width: "70%"}}>
                                <Chip style={{marginHorizontal: 3, marginVertical: 3}} icon="alarm" mode={"outlined"}>{task.dueDate?.toLocaleTimeString([], {hour: "numeric", minute: "numeric"})}</Chip>
                                <Chip style={{marginHorizontal: 3, marginVertical: 3}} icon="currency-jpy" mode={"outlined"}>{task.deposit?.toLocaleString()}</Chip>
                            </View>
                        )
                        return (
                            <List.Item
                                key={index}
                                title={task.name}
                                titleStyle={{marginLeft: 5, marginBottom: 5}}
                                description={Description}
                                right={props => <IconButton {...props} icon="delete"
                                                            onPress={() => deleteTask(task.id)}/>}
                            />
                        )
                    })}
                </List.Section>
            ))}
        </ScrollView>
    );
};


const TimeSetModal = ({ visible, setVisible, onConfirm }) => {
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

const DateSetModal = ({ visible, setVisible, onConfirm }) => {
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

const DepositSetModal = ({ visible, setVisible, onConfirm }) => {
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
                        left={<TextInput.Icon icon={"currency-jpy"} />}
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => setVisible(false)}>キャンセル</Button>
                    <Button onPress={() => { onConfirm(deposit); setVisible(false); }} disabled={!Boolean(deposit)}>決定</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const Screen = ({ navigation }) => {
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
        setTask({ id: tasks.length, name: text, deposit: 0, dueDate: new Date() });
    }

    function setDueTime(params: any) {
        setTask((currentTask) => {
            const updatedTask = { ...currentTask };
            const date = new Date(currentTask.dueDate);
            date.setHours(params.hours);
            date.setMinutes(params.minutes);
            updatedTask.dueDate = date;
            return updatedTask;
        });
        setTimeModalVisible(false);
        setDepositModalVisible(true);
    }

    function setDueDate({date}: {date: Date}) {
        setTask((currentTask) => {
            const updatedTask = { ...currentTask };
            updatedTask.dueDate = date;
            return updatedTask;
        });
        setDateModalVisible(false);
        setTimeModalVisible(true);
    }

    function setDeposit(deposit: number) {
        setTask((currentTask) => {
            const updatedTask = { ...currentTask };
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

    const addTask = (task) => {
        setTasks((prevTasks) => {
            storeData("tasks", [...prevTasks, task]).then(r => console.log("stored"));
            return [...prevTasks, task]
        });
    }

    const deleteTask = (id: number) => {
        const newTasks = tasks.filter(t => t.id !== id)
        setTasks(newTasks);
        storeData("tasks", newTasks).then(r => console.log("stored"));
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            <TopAppBar navigation={navigation} />
            <View style={{flex: 1, padding: 20}}>
                <TextInput
                    label="タスクを追加"
                    value={task?.name || ""}
                    onChangeText={onTextChange}
                    right={<TextInput.Icon icon={"plus"} onPress={addBtnPressed}/>}
                />
                <TaskList tasks={tasks} deleteTask={deleteTask} />
            </View>
            <DateSetModal visible={dateModalVisible} setVisible={setDateModalVisible} onConfirm={setDueDate} />
            {timeModalVisible && <TimeSetModal visible={timeModalVisible} setVisible={setTimeModalVisible} onConfirm={setDueTime} />}
            {depositModalVisible && <DepositSetModal visible={depositModalVisible} setVisible={setDepositModalVisible} onConfirm={setDeposit} />}
        </SafeAreaView>
    );
};

export default Screen;
