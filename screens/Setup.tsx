import React from 'react';
import {Animated, Dimensions, StatusBar, StyleSheet, View,} from 'react-native';
import {ExpandingDot} from 'react-native-animated-pagination-dots';
import {Button, IconButton, SegmentedButtons, Text, TextInput} from "react-native-paper";
import auth from '@react-native-firebase/auth';
import {useSafeAreaInsets} from "react-native-safe-area-context";
import LoginFailedDialog from "./dialogs/LoginFailed";
import VerifyEmail from "./dialogs/VerifyEmail";
import ResetPasswordDialog from "./dialogs/ResetPassword";
import {requestBackend} from "../utils/apiRequest";

const {width} = Dimensions.get('screen');


interface PageItem {
    text: string;
    description?: string;
    image?: any;
    backgroundColor: string;
    element?: React.ReactNode;
}


async function onEmailRegisterButtonPress(email: string, password: string, showVerifyDialog: () => void, setLoginFailedMessage: React.Dispatch<string | null>) {
    return (
        auth()
            .createUserWithEmailAndPassword(email, password)
            .then((user) => {
                if (!user.user.emailVerified) {
                    user.user.sendEmailVerification().then(() => {
                        requestBackend("/register", "POST").then(() => {
                            showVerifyDialog()
                        })
                    })
                }
            })
            .catch(error => {
                if (error.code === 'auth/email-already-in-use') {
                    setLoginFailedMessage('このメールアドレスは既に登録されています')
                } else if (error.code === 'auth/invalid-email') {
                    setLoginFailedMessage('メールアドレスが無効です')
                } else {
                    console.error(error);
                }
            })
    )
}

async function onEmailLoginButtonPress(email: string, password: string, navigation: any, showVerifyDialog: () => void, setLoginFailedMessage: React.Dispatch<string | null>) {
    return auth()
        .signInWithEmailAndPassword(email, password)
        .then((user) => {
            // メールアドレスが認証されてない場合はダイアログを表示
            if (!user.user.emailVerified) {
                user.user.sendEmailVerification().then(() => {
                    showVerifyDialog()
                })
            }
            navigation.reset({
                index: 0,
                routes: [{name: 'AppDrawer'}]
            })
        })
        .catch(() => {
            setLoginFailedMessage('メールアドレスまたはパスワードが間違っています')
        });
}


const LoginElements = ({navigation}) => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [verifyDialogVisible, setVerifyDialogVisible] = React.useState(false);
    const [passwordResetDialogVisible, setPasswordResetDialogVisible] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [inputMode, setInputMode] = React.useState<"login" | "register">("login");
    const [loginFailedMessage, setLoginFailedMessage] = React.useState<string | null>(null);
    const showVerifyDialog = () => setVerifyDialogVisible(true)
    return (
        <>
            <View style={{marginTop: 10, width: width * 0.7}}>
                <SegmentedButtons
                    style={{borderRadius: 20, marginTop: 6, backgroundColor: "#f1f1f1"}}
                    value={inputMode}
                    onValueChange={(value: string) => setInputMode(value as "login" | "register")}
                    buttons={[
                        {
                            value: 'login',
                            label: 'ログイン',
                            icon: 'login',
                        },
                        {
                            value: 'register',
                            label: '新規登録',
                            icon: 'account-plus',
                        }
                    ]}
                />
                <TextInput
                    style={{marginTop: 10}}
                    label={"メールアドレス"}
                    disabled={loading}
                    autoComplete={"email"}
                    textContentType={"emailAddress"}
                    value={email}
                    onChangeText={setEmail}
                />
                {inputMode === "login" ?
                    <TextInput
                        key={"loginPasswordInput"}
                        style={{marginTop: 10}}
                        label={"パスワード"}
                        disabled={loading}
                        secureTextEntry
                        autoComplete={"password"}
                        textContentType={"password"}
                        value={password}
                        onChangeText={setPassword}
                    /> :
                    <TextInput
                        key={"registerPasswordInput"}
                        style={{marginTop: 10}}
                        label={"パスワードを設定"}
                        disabled={loading}
                        secureTextEntry
                        autoComplete={"new-password"}
                        textContentType={"newPassword"}
                        value={password}
                        onChangeText={setPassword}
                    />
                }
            </View>
            <Button
                style={{borderRadius: 7, marginTop: 10}}
                icon={inputMode === "login" ? "login" : "account-plus"}
                mode={"contained"}
                loading={loading}
                disabled={loading || email === "" || password === ""}
                onPress={() => {
                    setLoading(true)
                    if (inputMode === "login") {
                        onEmailLoginButtonPress(email, password, navigation, showVerifyDialog, setLoginFailedMessage).then(() => {
                            setLoading(false)
                        })
                    } else {
                        onEmailRegisterButtonPress(email, password, showVerifyDialog, setLoginFailedMessage).then(() => {
                            setLoading(false)
                        })
                    }
                }}
            >
                {inputMode === "login" ? "ログイン" : "新規登録"}
            </Button>
            {/*underlined text to reset password*/}
            <Text style={{marginTop: 15, color: "white", textDecorationLine: "underline", fontWeight: "bold"}}
                  onPress={() => setPasswordResetDialogVisible(true)}>パスワードをお忘れですか？
            </Text>
            {/*  dialogs  */}
            <VerifyEmail dialogVisible={verifyDialogVisible} setDialogVisible={setVerifyDialogVisible}
                         onVerified={() => onEmailLoginButtonPress(email, password, navigation, showVerifyDialog, setLoginFailedMessage)}/>
            <LoginFailedDialog loginFailedMessage={loginFailedMessage} setLoginFailedMessage={setLoginFailedMessage}/>
            <ResetPasswordDialog visible={passwordResetDialogVisible} setVisible={setPasswordResetDialogVisible}
                                 setLoginFailedMessage={setLoginFailedMessage}/>
        </>
    )
}


const Screen = ({navigation}) => {
    const data: PageItem[] = [
        {
            text: "Fineyへようこそ",
            description: "ToDoリストを溜めがちなあなたへ",
            image: require('../assets/appImage1.jpg'),
            backgroundColor: '#4654a7',
        },
        {
            text: "こうなってませんか？",
            description: "後回しにしがちなあなたを応援します",
            image: require('../assets/appImage2.png'),
            backgroundColor: 'rgba(255,0,0,0.56)',
        },
        {
            text: "お金の力を借りよう",
            description: "タスクを完了したら、預けたお金が返ってきます",
            image: require('../assets/appImage3.jpg'),
            backgroundColor: '#7370cf',
        },
        ...(auth().currentUser ? [] : [{
            text: "はじめましょう",
            backgroundColor: '#6ab35e',
            element: (<LoginElements navigation={navigation}/>)
        }])
    ];
    const insets = useSafeAreaInsets()

    const imageW = width * 0.7;
    const imageH = imageW * 1.4;

    const scrollX = React.useRef(new Animated.Value(0)).current;
    const keyExtractor = React.useCallback((_, index) => index.toString(), []);
    //Current item index of FlatList
    const [activeIndex, setActiveIndex] = React.useState(0);
    let flatListRef = React.useRef(null);
    const gotoNextPage = () => {
        if (activeIndex + 1 < data.length) {
            // @ts-ignore
            flatListRef.current.scrollToIndex({
                index: activeIndex + 1,
                animated: true,
            });
        }
    };
    const gotoPrevPage = () => {
        if (activeIndex !== 0) {
            // @ts-ignore
            flatListRef.current.scrollToIndex({
                index: activeIndex - 1,
                animated: true,
            });
        }
    };
    const skipToStart = () => {
        // @ts-ignore
        flatListRef.current.scrollToIndex({
            index: data.length - 1,
            animated: true,
        });
    };
    // FlatList props that calculates current item index
    const onViewRef = React.useRef(({viewableItems}: any) => {
        setActiveIndex(viewableItems[0].index);
    });
    const viewConfigRef = React.useRef({viewAreaCoveragePercentThreshold: 50});
    const renderItem = React.useCallback(({item}: { item: PageItem }) => {
        return (
            <View style={[styles.itemContainer]}>
                {item.image &&
                    <Animated.Image
                        style={{
                            width: imageW,
                            height: imageH,
                            borderRadius: 20,
                            resizeMode: 'cover',
                        }}
                        // refer to the assets folder for the images
                        source={item.image}
                    />
                }
                <Animated.Text
                    style={{
                        fontSize: 28,
                        fontWeight: '700',
                        color: '#fff',
                        marginTop: 20,
                        textAlign: "center"
                    }}
                >
                    {item.text}
                </Animated.Text>
                {item.description &&
                    <Animated.Text
                        style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#fff',
                            marginTop: 10,
                            paddingHorizontal: 20,
                            textAlign: 'center',
                        }}
                    >
                        {item.description}
                    </Animated.Text>
                }
                {item.element && item.element}
            </View>
        );
    }, []);

    return (
        <View style={[{...styles.container, paddingTop: insets.top, paddingBottom: insets.bottom}]}>
            <StatusBar hidden/>
            <View style={[StyleSheet.absoluteFillObject]}>
                {data.map((item, index) => {
                    const inputRange = [
                        (index - 1) * width,
                        index * width,
                        (index + 1) * width,
                    ];
                    const colorFade = scrollX.interpolate({
                        inputRange,
                        outputRange: [0, 1, 0],
                    });
                    return (
                        <Animated.View
                            key={index}
                            style={[
                                StyleSheet.absoluteFillObject,
                                {backgroundColor: item.backgroundColor, opacity: colorFade},
                            ]}
                        />
                    );
                })}
            </View>
            <Animated.FlatList
                ref={flatListRef}
                onViewableItemsChanged={onViewRef.current}
                viewabilityConfig={viewConfigRef.current}
                data={data}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                horizontal
                decelerationRate={'normal'}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {x: scrollX}}}],
                    {
                        useNativeDriver: false,
                    }
                )}
            />
            <ExpandingDot
                data={data}
                expandingDotWidth={30}
                scrollX={scrollX}
                inActiveDotOpacity={0.6}
                dotStyle={{
                    width: 10,
                    height: 10,
                    backgroundColor: '#347af0',
                    borderRadius: 5,
                    marginHorizontal: 5
                }}
                containerStyle={{
                    top: 30,
                }}
            />
            <View style={[styles.buttonContainer]}>
                <IconButton
                    icon="chevron-left"
                    iconColor={"#ffffff"}
                    style={[styles.button]}
                    onPress={() => gotoPrevPage()}
                />
                <IconButton
                    icon="chevron-right"
                    iconColor={"#ffffff"}
                    style={[styles.button]}
                    onPress={() => gotoNextPage()}
                />
                <IconButton
                    icon="page-last"
                    iconColor={"#ffffff"}
                    style={[styles.button]}
                    onPress={() => skipToStart()}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContainer: {
        flex: 1,
        width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    button: {
        margin: 10
    },
    buttonText: {
        color: '#fff',
    },
});

export default Screen;
