import {Button, Dialog, Icon, Portal, Text, TouchableRipple} from "react-native-paper";
import {Alert, ImageBackground, Platform, StyleSheet, TouchableOpacity, View} from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import {DocumentPickerResult} from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {ImagePickerResult} from 'expo-image-picker';
import {useState} from "react";


function launchDocumentPicker(setSelectedFile: (uri: string) => void, setThumbnail: (uri: string) => void) {
    function onSelected(result: ImagePickerResult | DocumentPickerResult) {
        if (result.canceled) {
            return;
        } else {
            const file = result.assets[0]
            setSelectedFile(file.uri)
            if (file.mimeType?.startsWith("image") || file.mimeType?.startsWith("video")) {
                setThumbnail(file.uri)
            } else {
                setThumbnail(undefined)
            }
        }
    }

    if (Platform.OS === "ios") {
        Alert.prompt("どちらを選択しますか？", "", [
            {
                text: "キャンセル",
                onPress: () => {
                },
                style: "cancel"
            },
            {
                text: "画像・動画",
                onPress: () => {
                    ImagePicker.launchImageLibraryAsync({
                        allowsEditing: true,
                        allowsMultipleSelection: false,
                    }).then(onSelected)
                },
            },
            {
                text: "ファイル",
                onPress: () => {
                    DocumentPicker.getDocumentAsync().then(onSelected)
                },
            }
        ])
    } else {
        DocumentPicker.getDocumentAsync().then(onSelected)
    }
}


const FileSelectPlaceholder = ({selectedFile, onPress}) => (
    <TouchableRipple
        style={{...styles.proofSubmitArea}}
        onPress={onPress}
    >
        <View style={{alignSelf: "center", alignItems: "center"}}>
            {selectedFile ?
                <>
                    <Icon size={30} source={"file"} color={"black"}/>
                    <Text style={{fontWeight: "bold", marginTop: 10}}
                          variant="titleSmall">
                        {selectedFile.split("/").pop().split(".").pop().toUpperCase()}ファイル
                    </Text>
                </>
                :
                <>
                    <View style={{flexDirection: "row"}}>
                        <Icon size={30} source={"image"} color={"black"}/>
                        <Icon size={30} source={"video-outline"} color={"black"}/>
                        <Icon size={30} source={"music-note-eighth"} color={"black"}/>
                        <Icon size={30} source={"paperclip"} color={"black"}/>
                    </View>
                    <Text style={{fontWeight: "bold", marginTop: 10}}
                          variant="titleSmall">画像・動画・音声などを選択</Text>
                </>
            }
        </View>
    </TouchableRipple>
)

export const SubmitProofModal = ({visible, setVisible, onSubmit, onDismiss}) => {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>お疲れさまです！</Dialog.Title>
                <Dialog.Content>
                    <Text>証明となる画像などはありますか？</Text>
                    {thumbnail ?
                        <ImageBackground
                            source={{uri: thumbnail}}
                            style={{...styles.proofSubmitArea, opacity: selectedFile ? 1 : 0}}
                            imageStyle={{borderRadius: 20, resizeMode: "contain"}}
                        >
                            <TouchableOpacity style={{flex: 1, opacity: 0}}
                                              onPress={() => launchDocumentPicker(setSelectedFile, setThumbnail)}/>
                        </ImageBackground>
                        :
                        <FileSelectPlaceholder selectedFile={selectedFile}
                                               onPress={() => launchDocumentPicker(setSelectedFile, setThumbnail)}/>
                    }
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => setVisible(false)}>キャンセル</Button>
                    <Button
                        onPress={() => {
                            onSubmit();
                            setVisible(false);
                        }}
                        disabled={!Boolean(selectedFile)}
                    >
                        送信
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    )
}

const styles = StyleSheet.create({
    proofSubmitArea: {
        width: "100%",
        aspectRatio: 1,
        backgroundColor: "#dcdcdc",
        borderRadius: 20,
        marginTop: 10,
        alignItems: "center",
        justifyContent: "center",
    }
})
