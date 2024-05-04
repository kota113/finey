import { useState } from "react";
import { FlatList, SafeAreaView, View } from "react-native";
import { Appbar, Button, Dialog, IconButton, List, Portal, TextInput } from "react-native-paper";
import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";

interface Task {
    id: number;
    name: string;
    deposit: number;
    dueDate: Date;
}

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
                    <Button onPress={() => { onConfirm(deposit); setVisible(false); }}>決定</Button>
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

    function setDueDate(date: Date) {
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
            setTasks((prevTasks) => [...prevTasks, updatedTask]);
            return null;
        });
        setDepositModalVisible(false);
    }

    const addTask = () => {
        if (task) {
            setDateModalVisible(true);
        }
    };

    const deleteTask = (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <SafeAreaView>
            <Appbar.Header>
                <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
                <Appbar.Content title="ToDo App" />
            </Appbar.Header>
            <View style={{ padding: 20 }}>
                <TextInput
                    label="タスクを追加"
                    value={task?.name}
                    onChangeText={onTextChange}
                    right={<TextInput.Icon icon={"plus"} onPress={addTask} />}
                />
                <FlatList
                    style={{ marginTop: 20 }}
                    data={tasks}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <List.Item
                            key={item.id.toString()}
                            title={item.name}
                            description={`${item.dueDate?.toLocaleString()} ･ ${item.deposit?.toLocaleString()}円`}
                            right={props => <IconButton {...props} icon="delete" onPress={() => deleteTask(item.id)} />}
                        />
                    )}
                />
            </View>
            <DateSetModal visible={dateModalVisible} setVisible={setDateModalVisible} onConfirm={setDueDate} />
            <TimeSetModal visible={timeModalVisible} setVisible={setTimeModalVisible} onConfirm={setDueTime} />
            <DepositSetModal visible={depositModalVisible} setVisible={setDepositModalVisible} onConfirm={setDeposit} />
        </SafeAreaView>
    );
};

export default Screen;
