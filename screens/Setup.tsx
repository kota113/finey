import React from 'react';
import {Alert, Animated, Dimensions, Platform, StatusBar, StyleSheet, Text, View,} from 'react-native';
import {ExpandingDot} from 'react-native-animated-pagination-dots';
import {Button, Dialog, IconButton, Portal, TextInput} from "react-native-paper";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import auth from '@react-native-firebase/auth';
import {useSafeAreaInsets} from "react-native-safe-area-context";

const {width} = Dimensions.get('screen');


interface PageItem {
    text: string;
    description?: string;
    image?: any;
    backgroundColor: string;
    element?: React.ReactNode;
}


async function onGoogleButtonPress(navigation: any) {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    // Get the users ID token
    const {idToken} = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential)
        .then(() => {
            navigation.reset({
                index: 0,
                routes: [{name: 'AppDrawer'}]
            })
        })
        .catch((error) => console.log(error));
}

async function onEmailButtonPress(email: string, password: string, navigation: any, showDialog: () => void) {
    return (
        auth()
            .createUserWithEmailAndPassword(email, password)
            .then((user) => {
                if (!user.user.emailVerified) {
                    user.user.sendEmailVerification().then(() => {
                        user.user.getIdToken().then(token => {
                            fetch(`${process.env.EXPO_PUBLIC_API_URL}/register`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + token
                                }
                            }).then(() => {
                                showDialog()
                            })
                        })
                    })
                }
            })
            .catch(error => {
                if (error.code === 'auth/email-already-in-use') {
                    // login if email already exists
                    auth().signInWithEmailAndPassword(email, password)
                        .then(() => {
                            Alert.alert("ログインしました")
                            navigation.reset({
                                index: 0,
                                routes: [{name: 'AppDrawer'}]
                            })
                        })
                        .catch(() => {
                            Alert.alert('エラー', 'メールアドレスまたはパスワードが間違っています');
                        });
                }

                if (error.code === 'auth/invalid-email') {
                    Alert.alert('エラー', 'メールアドレスが無効です');
                }

                console.error(error);
            })
    )
}


const LoginElements = ({navigation}) => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [dialogVisible, setDialogVisible] = React.useState(false);
    const [emailLoginLoading, setEmailLoginLoading] = React.useState(false);
    const showDialog = () => setDialogVisible(true)
    return (
        <>
            <View style={{marginTop: 40}}>
                <Button
                    style={{borderRadius: 7}}
                    icon={"google"}
                    mode={"contained-tonal"}
                    onPress={() => onGoogleButtonPress(navigation).then(() => Alert.alert("ログインしました")).catch((error) => console.log(error))}
                >
                    Googleでログイン・登録
                </Button>
            </View>
            <Text style={{
                color: "#fff",
                textAlign: "center",
                marginTop: 12,
                fontWeight: "600",
                fontSize: 16
            }}>または</Text>
            <View style={{marginTop: 10, width: width * 0.7}}>
                <TextInput
                    style={{marginTop: 10}}
                    label={"メールアドレス"}
                    disabled={emailLoginLoading}
                    autoComplete={"email"}
                    textContentType={"emailAddress"}
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={{marginTop: 10}}
                    label={"パスワード"}
                    disabled={emailLoginLoading}
                    secureTextEntry
                    autoComplete={Platform.OS === "android" ? "password" : "current-password"}
                    textContentType={"password"}
                    value={password}
                    onChangeText={setPassword}
                />
            </View>
            <Button
                style={{borderRadius: 7, marginTop: 10}}
                icon={"account"}
                mode={"contained"}
                loading={emailLoginLoading}
                disabled={emailLoginLoading}
                onPress={() => {
                    setEmailLoginLoading(true)
                    onEmailButtonPress(email, password, navigation, showDialog).then(() => setEmailLoginLoading(false))
                }}
            >
                ログイン・登録
            </Button>
            {/*  dialog  */}
            <Portal>
                <Dialog visible={dialogVisible} onDismiss={() => {
                    setDialogVisible(false)
                }}>
                    <Dialog.Title>メールアドレスを認証</Dialog.Title>
                    <Dialog.Content>
                        <Text>ご入力のメールアドレスに確認メールを送信しました。ご確認ください。</Text>
                        <Text>確認が完了しましたら、完了ボタンを押してください</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => {
                            setDialogVisible(false)
                            onEmailButtonPress(email, password, navigation, showDialog).then()
                        }}>完了</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
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
            backgroundColor: '#7bcf6e',
        },
        {
            text: "お金の力を借りよう",
            description: "タスクを完了したら、預けたお金が返ってきます",
            image: require('../assets/appImage3.jpg'),
            backgroundColor: '#7370cf',
        },
        ...(auth().currentUser ? [] : [{
            text: "はじめましょう",
            backgroundColor: '#db4747',
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
        <View style={{...[styles.container], paddingTop: insets.top, paddingBottom: insets.bottom}}>
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
