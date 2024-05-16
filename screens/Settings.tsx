import {FlatList, View} from "react-native";
import {Appbar, List, Snackbar, Text} from "react-native-paper";
import * as Linking from "expo-linking";
import appConfig from "../app.config";
import {useState} from "react";


interface SettingsItem {
    label: string,
    icon: string,
    screen?: string,
    onPress?: () => void
}


const TopAppBar = ({navigation}) => (
    <Appbar.Header>
        <Appbar.Action icon="arrow-left" onPress={() => navigation.goBack()}/>
        <Appbar.Content title="設定"/>
    </Appbar.Header>
)

const Settings = ({navigation}: { navigation: any }) => {
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const settings: SettingsItem[] = [
        {
            label: "通知",
            icon: "bell",
            onPress: () => Linking.openSettings()
        },
        // {
        //     label: "言語",
        //     icon: "translate",
        //     screen: "日本語"
        // },
        // {
        //     label: "テーマ",
        //     icon: "palette",
        //     screen: "ライト"
        // },
        {
            label: "バージョン",
            icon: "information",
            onPress: () => setSnackbarVisible(true)
        }
    ]
    return (
        <>
            <FlatList
                data={settings}
                keyExtractor={(item) => item.label}
                renderItem={
                    ({item}) => (
                        <List.Item
                            style={{paddingHorizontal: 10, paddingVertical: 10}}
                            title={item.label}
                            left={props => <List.Icon {...props} icon={item.icon}/>}
                            onPress={item.onPress ? item.onPress : () => {
                                navigation.navigate(item.screen)
                            }}
                        />
                    )
                }
            />
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                action={{
                    label: 'OK',
                    onPress: () => {
                        setSnackbarVisible(false)
                    },
                }}>
                <Text style={{color: "white"}}>バージョン {appConfig.expo.version}</Text>
            </Snackbar>
        </>
    )
}


export default function Screen({navigation}: { navigation: any }) {
    return (
        <View style={{flex: 1}}>
            <TopAppBar navigation={navigation}/>
            <Settings navigation={navigation}/>
        </View>
    )
}