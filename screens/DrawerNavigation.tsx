import Main from "./Main";
import {createDrawerNavigator} from '@react-navigation/drawer';
import {Drawer as PaperDrawer} from "react-native-paper";
import {FlatList, StyleSheet, View} from "react-native";
import {registerTranslation} from "react-native-paper-dates";
import * as Notifications from "expo-notifications";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import * as WebBrowser from 'expo-web-browser';


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
    screen?: string,
    onPress?: () => void,
    icon: string,
}


const DrawerContent = ({navigation}) => {
    const insets = useSafeAreaInsets()
    const DrawerItems: DrawerItem[] = [
        {
            label: 'お支払い',
            onPress: () => WebBrowser.openBrowserAsync('https://expo.dev'),
            icon: 'credit-card'
        },
        {
            label: '設定',
            screen: 'Settings',
            icon: 'cog-outline'
        },
        {
            label: 'ヘルプ',
            screen: 'Help',
            icon: 'help-circle-outline'
        }
    ]

    function onItemPress(item: DrawerItem) {
        navigation.closeDrawer()
        item.screen ? navigation.navigate(item.screen) : item.onPress()
    }

    return (
        <View style={{// Paddings to handle safe area
            paddingTop: insets.top + styles.drawerContainer.paddingTop,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
        }}>
            <FlatList
                data={DrawerItems}
                keyExtractor={(item) => item.label}
                renderItem={
                    ({item}) => (
                        <PaperDrawer.Item
                            icon={item.icon}
                            label={item.label}
                            onPress={onItemPress.bind(this, item)}
                        />
                    )
                }
            />
        </View>
    )
}

const AppDrawer = () => {
    return (
        <Drawer.Navigator
            initialRouteName="main"
            drawerContent={DrawerContent}
        >
            <Drawer.Screen
                name="main"
                component={Main}
                options={{headerShown: false}}
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
