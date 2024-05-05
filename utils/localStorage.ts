import AsyncStorage from '@react-native-async-storage/async-storage';


const storeData = async (key: string, value: any) => {
    // make it json string if it's not a string
    const jsonValue = typeof value === "string" ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
};

const getData = async (key: string) => {
    const value = await AsyncStorage.getItem(key);
    // parse the value if it's possible
    try {
        return JSON.parse(value)
    } catch (e) {
        return value
    }
};

const clearLocalStorage = async () => {
    await AsyncStorage.clear()
}

export {storeData, getData, clearLocalStorage}
