import {Task} from "../types";
import auth from "@react-native-firebase/auth";
import appConfig from "../app.config";

type Method = "GET" | "POST" | "PUT" | "DELETE";

export async function requestBackend(path: string, method: Method, body: any = null) {
    const token = await auth().currentUser.getIdToken();
    return await fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}?version=${appConfig.expo.version}`, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(body)
    });
}

export async function refundTaskRequest(task: Task) {
    const res = await requestBackend("/refund-task", "POST", {id: task.id});
    return res.ok;
}

export async function markTaskCompleteRequest(task: Task) {
    const res = await requestBackend("/mark-task-as-completed", "POST", {id: task.id});
    return res.ok;
}