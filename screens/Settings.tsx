import {FlatList, SafeAreaView} from "react-native";
import {Appbar, List} from "react-native-paper";


interface SettingsItem {
    label: string,
    icon: string,
    value: string
}


const TopAppBar = ({navigation}) => (
    <Appbar.Header>
        <Appbar.Action icon="arrow-left" onPress={() => navigation.goBack()}/>
        <Appbar.Content title="設定"/>
    </Appbar.Header>
)

const Settings = ({navigation}: { navigation: any }) => {
    const settings: SettingsItem[] = [
        {
            label: "通知",
            icon: "bell",
            value: "オン"
        },
        {
            label: "言語",
            icon: "translate",
            value: "日本語"
        },
        {
            label: "テーマ",
            icon: "palette",
            value: "ライト"
        },
        {
            label: "バージョン",
            icon: "information",
            value: "1.0.0"
        }
    ]
    return (
        <FlatList
            data={settings}
            keyExtractor={(item) => item.label}
            renderItem={
                ({item}) => (
                    <List.Item
                        style={{paddingHorizontal: 10, paddingVertical: 10}}
                        title={item.label}
                        left={props => <List.Icon {...props} icon={item.icon}/>}
                    />
                )
            }
        />
    )
}


export default function Screen({navigation}: { navigation: any }) {
    return (
        <SafeAreaView style={{flex: 1}}>
            <TopAppBar navigation={navigation}/>
            <Settings navigation={navigation}/>
        </SafeAreaView>
    )
}