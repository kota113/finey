import {Alert, Animated, LayoutAnimation, Platform, SectionList, StyleSheet, UIManager, View} from "react-native";
import {ActivityIndicator, Appbar, Chip, Icon, Text, useTheme} from "react-native-paper";
import React, {useEffect, useRef, useState} from "react";
import auth from "@react-native-firebase/auth";

// Enable Layout Animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ListItem {
    paidDate: Date,
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
                {item.paidDate.getFullYear()}/{item.paidDate.getMonth() + 1}/{item.paidDate.getDate()}
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
                        ¥{item.amount}
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
    const [loading, setLoading] = useState(true);
    const animationRefs = {
        paid: useRef(new Animated.Value(1)).current,
        refunded: useRef(new Animated.Value(1)).current,
        pending: useRef(new Animated.Value(1)).current,
    }
    const [items, setItems] = useState<ListItem[]>([]);

    useEffect(() => {
        async function fetchData() {
            const data = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/payments-history`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${await auth().currentUser.getIdToken()}`
                    }
                }
            )
            if (!data.ok) {
                console.error("Failed to fetch payments history");
                Alert.alert("エラー", "決済履歴の取得に失敗しました。");
                navigation.goBack()
                return;
            }
            const json = await data.json();
            // convert date strings to Date objects
            json["charges"].forEach((charge: ListItem) => {
                charge.paidDate = new Date(charge.paidDate);
                charge.updatedDate = new Date(charge.updatedDate);
            });
            setItems(json["charges"]);
            setLoading(false);
            console.log("Fetched payments history");
        }

        fetchData().then()
    }, []);

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

    const dateToSectionKey = (date: Date) => (`${date.getFullYear() !== new Date().getFullYear() ? (date.getFullYear() + '年') : ""}${date.getMonth() + 1}月${date.getDate()}日`)

    function transformData(items: ListItem[]): { title: string; data: ListItem[] }[] {
        const grouped: { [key: string]: ListItem[] } = {};

        items.forEach((item) => {
            const dateKey = dateToSectionKey(item.paidDate);
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
            {loading ?
                <ActivityIndicator size="large" style={{flex: 1, alignSelf: "center"}}/> :
                <>
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
                            // hide section header if all items in the section are filtered out
                            items.some((item) => dateToSectionKey(item.paidDate) === title && item.visible) ?
                                (
                                    <Text style={{
                                        fontWeight: 'bold',
                                        fontSize: 20,
                                        marginTop: 20,
                                        marginBottom: 5
                                    }}>{title}</Text>
                                ) :
                                <></>
                        )}
                    />
                </>
            }
        </View>
    );
};

export default ({navigation}) => {
    return (
        <View style={{flex: 1}}>
            <TopAppBar navigation={navigation}/>
            <HistoryContainer navigation={navigation}/>
        </View>
    );
};

const styles = StyleSheet.create({
    item: {
        paddingHorizontal: 15,
        paddingVertical: 20,
        alignItems: "center",
        marginVertical: 8,
        borderRadius: 20,
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