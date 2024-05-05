import Main from "./Main";
import {createDrawerNavigator} from '@react-navigation/drawer';
import {Drawer as PaperDrawer} from "react-native-paper";
import {FlatList, SafeAreaView, StyleSheet} from "react-native";
import {registerTranslation} from "react-native-paper-dates";
import * as Notifications from "expo-notifications";


registerTranslation('ja', {
    save: '保存',
    selectSingle: '日付を選択',
    selectMultiple: '日付を選択',
    selectRange: '期間を選択',
    notAccordingToDateFormat: (inputFormat) =>
        `形式が無効です。使用：${inputFormat}`,
    mustBeHigherThan: (date) => `${date}より後にする必要があります`,
    mustBeLowerThan: (date) => `${date}より前にする必要があります`,
    mustBeBetween: (startDate, endDate) =>
        `${startDate} - ${endDate}の範囲で入力してください`,
    dateIsDisabled: '日付は入力できません',
    previous: '前へ',
    next: '次へ',
    typeInDate: '日付を入力',
    pickDateFromCalendar: 'カレンダーから日付を選択',
    close: '閉じる',
    minute: '分',
    hour: '時'
})

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});


const Drawer = createDrawerNavigator();

interface DrawerItem {
    label: string,
    screen: string,
    icon: string
}


const DrawerContent = ({ navigation }) => {
    const DrawerItems: DrawerItem[] = [
        {
            label: '支払い',
            screen: 'payment',
            icon: 'credit-card'
        },
        {
            label: '設定',
            screen: 'settings',
            icon: 'cog-outline'
        }
    ]
    function onItemPress(screen: string) {
        navigation.navigate(screen)
    }
    return (
        <SafeAreaView style={styles.drawerContainer}>
            <FlatList
                data={DrawerItems}
                keyExtractor={(item) => item.label}
                renderItem={
                    ({ item }) => (
                        <PaperDrawer.Item
                            icon={item.icon}
                            label={item.label}
                            onPress={onItemPress.bind(this, item.screen)}
                        />
                    )
                }
            />
        </SafeAreaView>
    )
}

const AppDrawer = () => {
    return (
        <Drawer.Navigator
            initialRouteName="Feed"
            drawerContent={DrawerContent}
        >
            <Drawer.Screen
                name="Feed"
                component={Main}
                options={{ headerShown: false }}
            />
        </Drawer.Navigator>
    )
}


const styles = StyleSheet.create({
    drawerContainer : {
        paddingTop: 10
    }
})

export default AppDrawer;
