import * as Notifications from 'expo-notifications';

// First, set the handler that will cause the notification
// to show the alert

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

async function scheduleNotification(title: string, trigger: Date) {
    return await Notifications.scheduleNotificationAsync({
        content: {
            title
        },
        trigger,
    });
}

async function cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export {scheduleNotification, cancelNotification}
