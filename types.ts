import "@react-native-firebase/firestore"
import {Timestamp} from "@react-native-firebase/firestore/lib/modular/Timestamp";

export interface Task {
    id: number;
    name: string;
    isCompleted: boolean;
    deposit: number;
    dueDate: Date;
    notificationId: string;
    notifyBefore: number;
}

// dueDate is stored in a Timestamp, not a Date
export interface TaskFromFirebase {
    id: number;
    name: string;
    isCompleted: boolean;
    deposit: number;
    dueDate: Timestamp;
    notificationId: string;
    notifyBefore: number;
}

// dueDate is stored in a string, not a Date
export interface TaskFromLocalStorage {
    id: number;
    name: string;
    isCompleted: boolean;
    deposit: number;
    dueDate: string;
    notificationId: string;
    notifyBefore: number;
}

export interface ProofFile {
    title?: string;
    uri: string;
    thumbnail?: string;
}