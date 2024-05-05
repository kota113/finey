import Main from "./Main";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Drawer as PaperDrawer } from "react-native-paper";
import {useState} from "react";
import {View, StyleSheet, FlatList} from "react-native";
import {registerTranslation} from "react-native-paper-dates";


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
    screen: string
}


const DrawerContent = ({ navigation }) => {
    const [active, setActive] = useState('first')
    const DrawerItems: DrawerItem[] = [
        {
            label: 'First Item',
            screen: 'first'
        },
        {
            label: 'Second Item',
            screen: 'second'
        }
    ]
    function onItemPress(screen: string) {
        setActive(screen)
        navigation.navigate(screen)
    }
    return (
        <View style={styles.drawerContainer}>
            <FlatList
                data={DrawerItems}
                keyExtractor={(item) => item.label}
                renderItem={
                    ({ item }) => (
                        <PaperDrawer.Item
                            label={item.label}
                            active={active === item.screen}
                            onPress={onItemPress.bind(this, item.screen)}
                        />
                    )
                }
            />
        </View>
    )
}

const AppDrawer = ({ navigation }) => {
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
