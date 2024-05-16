import {Animated, FlatList, LayoutAnimation, Platform, SafeAreaView, StyleSheet, UIManager, View} from "react-native";
import {Appbar, Chip, Text} from "react-native-paper";
import React, {useRef, useState} from "react";


// Enable Layout Animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ListItem {
    id: string,
    text: string,
    status: ChipStatus,
    visible: boolean
}

type ChipStatus = "paid" | "refunded" | "pending";


const TopAppBar = ({navigation}) => (
    <Appbar.Header>
        <Appbar.Action icon="arrow-left" onPress={() => navigation.goBack()}/>
        <Appbar.Content title="決済履歴"/>
    </Appbar.Header>
)

const AnimatedListItem = ({item, animationRef}: { item: ListItem, animationRef: Animated.Value }) => {
    return (
        <>
            {item.visible && (
                <Animated.View style={{...styles.item, opacity: animationRef}}>
                    <Text>{item.text}</Text>
                </Animated.View>
            )}
        </>
    );
};

const HistoryContainer = ({navigation}) => {
    const [chipsSelected, setChipsSelected] = useState<ChipStatus[]>([])
    const animationRefs = {
        paid: useRef(new Animated.Value(1)).current,
        refunded: useRef(new Animated.Value(1)).current,
        pending: useRef(new Animated.Value(1)).current,
    }
    const [items, setItems] = useState<ListItem[]>([
        {id: '1', text: 'Item 1', status: 'paid', visible: true},
        {id: '2', text: 'Item 2', status: 'refunded', visible: true},
        {id: '3', text: 'Item 3', status: 'pending', visible: true},
    ]);

    const animateItems = (status: string, visible: boolean) => {
        const ref = animationRefs[status as ChipStatus];
        if (visible) {
            // Start fade-in animation
            Animated.timing(ref, {
                toValue: 1, // Target opacity value: 1
                duration: 200, // Duration of the animation in milliseconds
                useNativeDriver: true,
            }).start(() => {
                // Animate the layout changes
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            });
        } else {
            // Start fade-out animation
            Animated.timing(ref, {
                toValue: 0, // Target opacity value: 0
                duration: 200, // Duration of the animation in milliseconds
                useNativeDriver: true,
            }).start(() => {
                // Animate the layout changes
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            });
        }
    };

    function onChipPress(pressedChip: ChipStatus) {
        chipsSelected.includes(pressedChip) ?
            setChipsSelected(
                (currentValue) => {
                    const newChips: ChipStatus[] = currentValue.filter((chip) => chip !== pressedChip)
                    applyFilter(newChips)
                    return newChips
                }
            )
            :
            setChipsSelected((currentValue) => {
                const newChips: ChipStatus[] = [...currentValue, pressedChip]
                applyFilter(newChips)
                return newChips
            })
    }

    const applyFilter = (chips: ChipStatus[]) => {
        console.log(chips)
        if (chips.length === 0) {
            setItems(items.map((item) => {
                animateItems(item.status, true)
                return {...item, visible: true}
            }))
            return
        } else {
            setItems(items.map((item) => {
                if (!chips.includes(item.status)) {
                    animateItems(item.status, false)
                    return {...item, visible: false}
                } else {
                    animateItems(item.status, true)
                    return {...item, visible: true}
                }
            }))
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.chipContainer}>
                <Chip
                    style={styles.chip}
                    selected={chipsSelected.includes("paid")}
                    showSelectedCheck={true}
                    onPress={() => {
                        onChipPress("paid")
                    }}
                >
                    支払済み
                </Chip>
                <Chip
                    style={styles.chip}
                    selected={chipsSelected.includes("refunded")}
                    showSelectedCheck={true}
                    onPress={() => {
                        onChipPress("refunded")
                    }}
                >
                    返金済み
                </Chip>
                <Chip
                    style={styles.chip}
                    selected={chipsSelected.includes("pending")}
                    showSelectedCheck={true}
                    onPress={() => {
                        onChipPress("pending")
                    }}
                >
                    処理中
                </Chip>
            </View>
            <FlatList
                data={items}
                renderItem={({item}) => (
                    <AnimatedListItem item={item} animationRef={animationRefs[item.status]}/>
                )}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
};


export default ({navigation}) => {
    return (
        <SafeAreaView style={{flex: 1}}>
            <TopAppBar navigation={navigation}/>
            <HistoryContainer navigation={navigation}/>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    item: {
        padding: 10,
        marginVertical: 8,
        backgroundColor: '#f9c2ff',
        borderRadius: 5,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    chipContainer: {
        flexDirection: "row",
    },
    chip: {
        margin: 5
    }
});