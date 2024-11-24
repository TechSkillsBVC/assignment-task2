import AsyncStorage from '@react-native-async-storage/async-storage';

export const getFromNetworkFirst = async <T>(key: string, request: Promise<T>): Promise<T> => {
    try {
        const response = await request;
        console.log(`Network response received for key "${key}":`, response);

        await setInCache(key, response);
        return response;
    } catch (error) {
        console.error(`Network request failed for key "${key}", falling back to cache:`, error);

        try {
            return await getFromCache<T>(key);
        } catch (cacheError) {
            console.error(`Cache retrieval failed for key "${key}":`, cacheError);
            throw cacheError; // Propagate error if both network and cache fail
        }
    }
};

export const setInCache = async (key: string, value: any): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(value);
        console.log(`Caching value for key "${key}":`, value);

        await AsyncStorage.setItem(key, jsonValue);
        console.log(`Successfully cached key "${key}".`);
    } catch (error) {
        console.error(`Error setting cache for key "${key}":`, error);
        throw error; // Re-throw error for caller to handle
    }
};

export const getFromCache = async <T>(key: string): Promise<T> => {
    try {
        console.log(`Attempting to retrieve key "${key}" from cache.`);

        const json = await AsyncStorage.getItem(key);
        if (json != null) {
            const parsedValue = JSON.parse(json);
            console.log(`Cache hit for key "${key}":`, parsedValue);
            return parsedValue as T;
        } else {
            console.warn(`Cache miss for key "${key}".`);
            throw new Error(`Key "${key}" not in cache`);
        }
    } catch (error) {
        console.error(`Error retrieving key "${key}" from cache:`, error);
        throw error; // Re-throw error for caller to handle
    }
};
