import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 *  Fetches data from the network first. If the request fails, it falls back to the cache.
 * @param key 
 * @param request 
 * @returns 
 */
export const getFromNetworkFirst = async <T>(key: string, request: Promise<T>): Promise<T> => {
    try {
        const response = await request;
        setInCache(key, response);
        return response;
    } catch (e) {
        return getFromCache<T>(key);
    }
};

/**
 * Sets data in the cache.
 * @param key 
 * @param value 
 * @returns 
 */
export const setInCache = (key: string, value: any) => {
    const jsonValue = JSON.stringify(value);
    return AsyncStorage.setItem(key, jsonValue);
};

/**
 * Fetches data from the cache.
 * @param key 
 * @returns 
 */

export const getFromCache = async <T>(key: string): Promise<T> => {
    const json = await AsyncStorage.getItem(key);
    return await (json != null ? Promise.resolve(JSON.parse(json)) : Promise.reject(`Key "${key}" not in cache`));
};
