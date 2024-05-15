import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, {firebase} from "@react-native-firebase/auth";
import {Task} from "../types";
import * as Notifications from "expo-notifications";


// todo: remove localStorage

const storeTasks = async (tasks: Task[]) => {
    await _storeLocalData("tasks", tasks)
    // remove notificationId from tasks
    tasks.forEach(task => {
        delete task.notificationId
    })
    return await firebase.firestore().collection("tasks").doc(auth().currentUser.uid).set({data: tasks}).then(() => console.log("Data stored"))
}

const storeData = async (key: string, value: any) => {
    await firebase.firestore().collection(key).doc(auth().currentUser.uid).set({data: value}).then(() => console.log("Data stored"))
    await _storeLocalData(key, value)
}

const _storeLocalData = async (key: string, value: any) => {
    // make it json string if it's not a string
    const jsonValue = typeof value === "string" ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
};

const getTasks = async () => {
    const res = await firebase.firestore().collection("tasks").doc(auth().currentUser.uid).get()
    const data = res.data()
    if (data && data.data.length > 0) {
        const firebaseData = data.data
        const localData = await _getLocalData("tasks")
        // SYNC TASKS
        // check all tasks, and if there's a task that's not in the local storage, add it
        // if there's a task that's not in the firebase, remove it
        firebaseData.forEach((task: Task | object) => {
            if (!localData.find((localTask: Task) => localTask.id === task["id"])) {
                // add notification and set notificationId to task
                const notificationDate = new Date(task["dueDate"].getTime() - task["notifyBefore"]);
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: "期限が近づいています",
                        body: task["name"],
                    },
                    trigger: notificationDate,
                }).then((id) => {
                    task["notificationId"] = id;
                })
                localData.push(task)
            } else if (!firebaseData.find((firebaseTask: Task) => firebaseTask.id === task["id"])) {
                // remove notification
                task["notificationId"] && Notifications.cancelScheduledNotificationAsync(task["notificationId"])
                localData.splice(localData.findIndex((localTask: Task) => localTask.id === task["id"]), 1)
            }
            task["dueDate"] = task["dueDate"].toDate();
        })
        await storeTasks(localData)
        return data.data
    } else {
        return []
    }
}

const getData = async (key: string) => {
    const res = await firebase.firestore().collection(key).doc(auth().currentUser.uid).get()
    const data = res.data()
    if (data && data.data.length > 0) {
        return data.data
    } else {
        return _getLocalData(key)
    }
}

const _getLocalData = async (key: string) => {
    const value = await AsyncStorage.getItem(key);
    // parse the value if it's possible
    try {
        return JSON.parse(value)
    } catch (e) {
        return value
    }
};

const clearLocalStorage = async () => {
    await AsyncStorage.clear()
}

export {storeTasks, storeData, getTasks, getData, clearLocalStorage}
