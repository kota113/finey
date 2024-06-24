import React, {useEffect} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import {Directions, Gesture, GestureDetector} from 'react-native-gesture-handler';
import {Button, Icon, TextInput, useTheme} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const ModalHeader = ({setIsVisible}) => (
    <View style={{justifyContent: "space-between", flexDirection: "row"}}>
        <Button onPress={() => setIsVisible(false)}>
            閉じる
        </Button>
        <Button mode={"contained"} disabled={true}>
            追加
        </Button>
    </View>
)

const ModalContents = ({taskTitleInput, translateY, heightOptions}) => {
    const TitleInput = () => (
        <TextInput
            ref={taskTitleInput}
            contentStyle={{fontSize: 28}}
            mode={"flat"}
            placeholder={"タイトルを入力"}
            underlineStyle={{height: 0}}
            style={{backgroundColor: "transparent", width: "100%"}}
            underlineColor={"transparent"}
            onPress={() =>
                translateY.value = withSpring(heightOptions.full, {mass: 0.3})
            }
        />
    )
    const ShortInfoInput = () => (
        <View style={{
            flexDirection: "row",
            paddingHorizontal: 10,
            paddingTop: 10,
            justifyContent: "center",
            alignItems: "center"
        }}>
            <Icon source={"calendar"} size={30}/>
            <Button mode={"outlined"} style={{
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 15,
                marginLeft: 3
            }} compact={true} labelStyle={{fontSize: 19, fontWeight: "500"}}>
                06/24
            </Button>
            <Icon source={"clock-outline"} size={30}/>
            <Button mode={"outlined"} style={{
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 15,
                marginLeft: 3
            }} compact={true} labelStyle={{fontSize: 19, fontWeight: "500"}}>
                23:59
            </Button>
            <Icon source={"bell"} size={30}/>
            <Button mode={"outlined"}
                    style={{borderRadius: 10, justifyContent: "center", alignItems: "center", marginLeft: 3}}
                    compact={true} labelStyle={{fontSize: 19, fontWeight: "500"}}>
                30分前
            </Button>
        </View>
    )

    return (
        <View style={{flex: 1, flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start"}}>
            <TitleInput/>
            <ShortInfoInput/>
        </View>
    )
}

const SlidableModal = ({isVisible, setIsVisible}) => {
    const taskTitleInput = React.useRef(null);
    const safeAreaInsets = useSafeAreaInsets();
    const height = Dimensions.get('window')["height"] - safeAreaInsets.top;
    const heightOptions = {
        full: height * 0.3,
        half: height * 0.80,
        hidden: height * 1.5,
    }
    const theme = useTheme();
    const translateY = useSharedValue(height);

    const blurTaskTitleInput = () => {
        taskTitleInput.current.blur();
    }

    const closeModal = () => {
        setIsVisible(false);
    }

    const flingUp = Gesture.Fling()
        .direction(Directions.UP)
        .onEnd(() => {
            translateY.value = withSpring(translateY.value == heightOptions.half ? heightOptions.full : heightOptions.half, {mass: 0.3});
        });

    const flingDown = Gesture.Fling()
        .direction(Directions.DOWN)
        .onEnd(() => {
            translateY.value = withSpring(heightOptions.half, {mass: 0.3});
            runOnJS(blurTaskTitleInput)();
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{translateY: translateY.value}],
        };
    });

    useEffect(() => {
        if (isVisible) {
            translateY.value = withSpring(heightOptions.half, {mass: 0.3});
        } else {
            translateY.value = withSpring(heightOptions.hidden, {mass: 0.3});
        }
    }, [isVisible]);

    return (
        <GestureDetector gesture={Gesture.Exclusive(flingUp, flingDown)}>
            <Animated.View style={[{...styles.modal, backgroundColor: theme.colors.secondaryContainer}, animatedStyle]}>
                {isVisible &&
                    <View style={styles.modalContent}>
                        <ModalHeader setIsVisible={setIsVisible}/>
                        <ModalContents taskTitleInput={taskTitleInput} translateY={translateY}
                                       heightOptions={heightOptions}/>
                    </View>
                }
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    modal: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        bottom: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalContent: {
        flex: 1,
        paddingTop: 15,
        paddingHorizontal: 20
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 25,
        marginBottom: 20,
    },
    closeButton: {
        fontSize: 16,
        color: 'blue',
    },
});

export default SlidableModal;
