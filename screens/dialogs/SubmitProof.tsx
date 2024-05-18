import {ActivityIndicator, Button, Dialog, Icon, Portal, Text, TextInput, TouchableRipple} from "react-native-paper";
import {ImageBackground, StyleSheet, TouchableOpacity, View} from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import {DocumentPickerResult} from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {ImagePickerResult} from 'expo-image-picker';
import {useState} from "react";
import {ProofFile} from "../../types";


function launchDocumentPicker(setSelectedFile: (file: ProofFile) => void, type: "media" | "document") {
    if (type === "media") {
        ImagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: false,
        }).then(onSelected)
    } else {
        DocumentPicker.getDocumentAsync().then(onSelected)
    }
    function onSelected(result: ImagePickerResult | DocumentPickerResult) {
        if (result.canceled) {
            return;
        } else {
            const asset = result.assets[0]
            let file: ProofFile;
            if (asset.mimeType?.startsWith("image") || asset.mimeType?.startsWith("video")) {
                file = {
                    uri: asset.uri,
                    thumbnail: asset.uri
                }
            } else {
                file = {
                    uri: asset.uri,
                    //@ts-ignore
                    title: asset.name
                }
            }
            setSelectedFile(file)
        }
    }
}


const FileSelectPlaceholder = ({selectedFile, onPress}: { selectedFile: ProofFile, onPress: () => void }) => (
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
                        {selectedFile.title}
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
    const [selectedFile, setSelectedFile] = useState<ProofFile>(null);
    const [submitting, setSubmitting] = useState(false);
    const [fileDescription, setFileDescription] = useState<string>("");
    const [noticeDialogVisible, setNoticeDialogVisible] = useState(false);
    const [fileTypePickerVisible, setFileTypePickerVisible] = useState(false);

    function initialize() {
        setSubmitting(false);
        setSelectedFile(null);
        setFileDescription("");
    }

    function onSubmitPressed() {
        setSubmitting(true);
        onSubmit(selectedFile, fileDescription).then(() => {
            setVisible(false);
            initialize()
            setNoticeDialogVisible(true);
        })
    }
    return (
        <>
            <Portal>
                <Dialog
                    visible={visible}
                    onDismiss={() => {
                        initialize()
                        onDismiss();
                    }}
                    // disable dismiss when submitting
                    dismissable={!submitting}
                    dismissableBackButton={!submitting}
                >
                    <Dialog.Title>お疲れさまです！</Dialog.Title>
                    <Dialog.Content>
                        <Text>証明となる画像などはありますか？</Text>
                        {submitting ?
                            <ActivityIndicator size={"large"} style={styles.proofSubmitArea}/>
                            :
                            selectedFile?.thumbnail ?
                                <ImageBackground
                                    source={{uri: selectedFile.thumbnail}}
                                    style={{...styles.proofSubmitArea, opacity: selectedFile ? 1 : 0}}
                                    imageStyle={{borderRadius: 20, resizeMode: "contain"}}
                                >
                                    <TouchableOpacity style={{flex: 1, opacity: 0}}
                                                      onPress={() => setFileTypePickerVisible(true)}/>
                                </ImageBackground>
                                :
                                <FileSelectPlaceholder selectedFile={selectedFile}
                                                       onPress={() => setFileTypePickerVisible(true)}/>
                        }
                        <TextInput
                            style={{marginTop: 10}}
                            label={"ファイルの説明（省略可）"}
                            value={fileDescription}
                            onChangeText={setFileDescription}
                            disabled={submitting}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setVisible(false)} disabled={submitting}>キャンセル</Button>
                        <Button
                            onPress={onSubmitPressed}
                            disabled={!Boolean(selectedFile) || submitting}
                        >
                            送信
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <Portal>
                <Dialog visible={fileTypePickerVisible} onDismiss={() => setFileTypePickerVisible(false)}>
                    <Dialog.Title>どちらを選択しますか？</Dialog.Title>
                    <Dialog.Actions>
                        <Button onPress={() => {
                            setFileTypePickerVisible(false)
                            launchDocumentPicker(setSelectedFile, "media")
                        }}>画像・動画</Button>
                        <Button onPress={() => {
                            setFileTypePickerVisible(false)
                            launchDocumentPicker(setSelectedFile, "document")
                        }}>ファイル</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <Portal>
                <Dialog visible={noticeDialogVisible} onDismiss={() => setNoticeDialogVisible(false)}>
                    <Dialog.Icon icon={"face-man-shimmer"} size={40} color={"#259707"}/>
                    <Dialog.Title style={{textAlign: "center"}}>返金までお待ちください</Dialog.Title>
                    <Dialog.Content>
                        <Text style={{textAlign: "center"}}>AIと人間がファイルを見ています...</Text>
                        <Text style={{textAlign: "center"}}>返金まで数日かかります。</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setNoticeDialogVisible(false)}>閉じる</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </>
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
