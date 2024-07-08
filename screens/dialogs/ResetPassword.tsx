import {Button, Dialog, Portal, Text, TextInput} from "react-native-paper";
import auth from '@react-native-firebase/auth';
import {useState} from "react";

export default ({visible, setVisible, setLoginFailedMessage}) => {
    const [email, setEmail] = useState("")
    const [emailSent, setEmailSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const onDismiss = () => {
        setVisible(false)
        setEmail("")
        setEmailSent(false)
        setLoading(false)
    }
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>パスワードをリセット</Dialog.Title>
                <Dialog.Content>
                    {emailSent ?
                        <Text>リセットメールを送信しました。メールを確認してください。</Text> :
                        <>
                            <Text>登録のメールアドレスを入力してください。</Text>
                            <TextInput
                                label="メールアドレス"
                                value={email}
                                textContentType={"emailAddress"}
                                autoComplete={"email"}
                                onChangeText={text => setEmail(text)}
                            />
                        </>
                    }
                </Dialog.Content>
                <Dialog.Actions>
                    {emailSent ?
                        <Button onPress={onDismiss}>閉じる</Button> :
                        <Button
                            disabled={loading}
                            onPress={() => {
                                setLoading(true)
                                auth().sendPasswordResetEmail(email).then(() => {
                                    setEmailSent(true)
                                }).catch((error) => {
                                    // catch error by case
                                    switch (error.code) {
                                        case 'auth/invalid-email':
                                            setLoginFailedMessage("メールアドレスが無効です")
                                            break;
                                        case 'auth/user-not-found':
                                            setLoginFailedMessage("登録されていないメールアドレスです")
                                            break;
                                        default:
                                            setLoginFailedMessage("不明なエラーが発生しました。もう一度お試しください")
                                    }
                                })
                            }}
                        >
                            リセット
                        </Button>
                    }
                </Dialog.Actions>
            </Dialog>
        </Portal>
    )
}