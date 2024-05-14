import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, {firebase} from "@react-native-firebase/auth";


// todo: remove localStorage

const storeData = async (key: string, value: any) => {
    await firebase.firestore().collection(key).doc(auth().currentUser.uid).set({data: value})
    await _storeLocalData(key, value)
}

const _storeLocalData = async (key: string, value: any) => {
    // make it json string if it's not a string
    const jsonValue = typeof value === "string" ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
};


const getData = async (key: string) => {
    const res = await firebase.firestore().collection(key).doc(auth().currentUser.uid).get()
    const data = res.data()
    if (data && data.length > 0) {
        return data.data
    } else {
        return _getLocalData(key)
    }
}

const _getLocalData = async (key: string) => {
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
