import {Task} from "../types";
import auth from "@react-native-firebase/auth";

export async function refundTaskRequest(task: Task) {
    const token = await auth().currentUser.getIdToken();
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/refund-task`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({id: task.id})
    })
    return res.ok;
}

export async function markTaskCompleteRequest(task: Task) {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/mark-task-as-completed`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + await auth().currentUser.getIdToken()
        },
        body: JSON.stringify({id: task.id})
    })
    return res.ok;
}