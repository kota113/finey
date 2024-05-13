export interface Task {
    id: number;
    name: string;
    isCompleted: boolean;
    deposit: number;
    dueDate: Date;
    notificationId: string;
    notifyBefore: number;
}

export interface ProofFile {
    title?: string;
    uri: string;
    thumbnail?: string;
}