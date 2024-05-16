import {
    Animated,
    LayoutAnimation,
    Platform,
    SafeAreaView,
    SectionList,
    StyleSheet,
    UIManager,
    View
} from "react-native";
import {Appbar, Chip, Icon, Text, useTheme} from "react-native-paper";
import React, {useRef, useState} from "react";

// Enable Layout Animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ListItem {
    updatedDate: Date,
    taskName: string,
    taskId: string,
    amount: number,
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
    const theme = useTheme()
    const itemIcon = item.status === "paid" ? "cash" : item.status === "refunded" ? "restore" : "timer-sand";
    const InfoChips = () => (
        <View style={{flexDirection: "row", marginTop: 5}}>
            <Chip icon={itemIcon} mode={"outlined"} style={{marginRight: 5}}>
                {item.status === "paid" ? "支払済み" : item.status === "refunded" ? "返金済み" : "処理中"}・
                {item.updatedDate.getFullYear()}/{item.updatedDate.getMonth() + 1}/{item.updatedDate.getDate()}
            </Chip>
        </View>
    )
    return (
        <>
            {item.visible && (
                <Animated.View
                    style={{...styles.item, opacity: animationRef, backgroundColor: theme.colors.surfaceVariant}}>
                    <Icon size={33} source={itemIcon}/>
                    <View style={{flex: 1, marginLeft: 10, flexDirection: "column"}}>
                        <Text
                            variant={"titleMedium"}
                        >
                            {item.taskName}
                        </Text>
                        <InfoChips/>
                    </View>
                    <Text
                        variant={"titleLarge"}
                        style={item.status === 'refunded' && {
                            textDecorationLine: "line-through",
                            textDecorationStyle: "solid"
                        }}
                    >
                        {item.amount}円
                    </Text>
                </Animated.View>
            )}
        </>
    );
};

const FilterChips = ({chipsSelected, onChipPress}: {
    chipsSelected: ChipStatus[],
    onChipPress: (status: ChipStatus) => void
}) => (
    <>
        <Chip
            style={styles.chip}
            selected={chipsSelected.includes("paid")}
            showSelectedCheck={true}
            showSelectedOverlay={true}
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
            showSelectedOverlay={true}
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
            showSelectedOverlay={true}
            onPress={() => {
                onChipPress("pending")
            }}
        >
            処理中
        </Chip>
    </>
)

const HistoryContainer = ({navigation}) => {
    const [chipsSelected, setChipsSelected] = useState<ChipStatus[]>(['paid', 'refunded', 'pending']);
    const animationRefs = {
        paid: useRef(new Animated.Value(1)).current,
        refunded: useRef(new Animated.Value(1)).current,
        pending: useRef(new Animated.Value(1)).current,
    }
    const [items, setItems] = useState<ListItem[]>([
        {updatedDate: new Date(), taskId: '1', taskName: 'ベイズ統計', status: 'paid', amount: 1000, visible: true},
        {updatedDate: new Date(), taskId: '2', taskName: '料理', status: 'refunded', amount: 1000, visible: true},
        {
            updatedDate: new Date(),
            taskId: '3',
            taskName: '部屋の片付け',
            status: 'pending',
            amount: 1000,
            visible: true
        },
    ]);

    const animateItems = (status: string, visible: boolean) => {
        const ref = animationRefs[status as ChipStatus];
        if (visible) {
            // Animate the layout changes before setting visibility to true
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setItems(prevItems => prevItems.map(item =>
                item.status === status ? {...item, visible: true} : item
            ));

            // Start fade-in animation
            Animated.timing(ref, {
                toValue: 1, // Target opacity value: 1
                duration: 200, // Duration of the animation in milliseconds
                useNativeDriver: true,
            }).start();
        } else {
            // Start fade-out animation
            Animated.timing(ref, {
                toValue: 0, // Target opacity value: 0
                duration: 200, // Duration of the animation in milliseconds
                useNativeDriver: true,
            }).start(() => {
                // Animate the layout changes after fade-out is complete
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setItems(prevItems => prevItems.map(item =>
                    item.status === status ? {...item, visible: false} : item
                ));
            });
        }
    };

    function onChipPress(pressedChip: ChipStatus) {
        chipsSelected.includes(pressedChip) ?
            setChipsSelected(
                (currentValue) => {
                    const newChips: ChipStatus[] = currentValue.filter((chip) => chip !== pressedChip);
                    applyFilter(newChips);
                    return newChips;
                }
            )
            :
            setChipsSelected((currentValue) => {
                const newChips: ChipStatus[] = [...currentValue, pressedChip];
                applyFilter(newChips);
                return newChips;
            });
    }

    const applyFilter = (chips: ChipStatus[]) => {
        console.log(chips);
        if (chips.length === 0) {
            setItems(items.map((item) => {
                animateItems(item.status, true);
                return {...item, visible: true};
            }));
        } else {
            setItems(items.map((item) => {
                if (!chips.includes(item.status)) {
                    animateItems(item.status, false);
                    return {...item, visible: false};
                } else {
                    animateItems(item.status, true);
                    return {...item, visible: true};
                }
            }));
        }
    };

    function transformData(items: ListItem[]): { title: string; data: ListItem[] }[] {
        const grouped: { [key: string]: ListItem[] } = {};

        items.forEach((item) => {
            const dateKey = `${item.updatedDate.getFullYear() !== new Date().getFullYear() ? (item.updatedDate.getFullYear() + '年') : ""}${item.updatedDate.getMonth() + 1}月${item.updatedDate.getDate()}日`;
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(item);
        });

        return Object.keys(grouped).map((key) => ({
            title: key,
            data: grouped[key],
        }));
    }

    return (
        <View style={styles.container}>
            <View style={styles.chipContainer}>
                <FilterChips chipsSelected={chipsSelected} onChipPress={onChipPress}/>
            </View>
            <SectionList
                sections={transformData(items)}
                keyExtractor={(item) => item.taskId}
                renderItem={({item}) => (
                    <AnimatedListItem item={item} animationRef={animationRefs[item.status]}/>
                )}
                renderSectionHeader={({section: {title}}) => (
                    <Text style={{fontWeight: 'bold', fontSize: 20, marginTop: 20, marginBottom: 5}}>{title}</Text>
                )}
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
    );
};

const styles = StyleSheet.create({
    item: {
        paddingHorizontal: 15,
        paddingVertical: 20,
        alignItems: "center",
        marginVertical: 8,
        borderRadius: 10,
        flex: 1,
        flexDirection: "row",
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