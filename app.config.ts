import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'volunteam',
    slug: 'volunteam',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png', // Ensure this file exists
    splash: {
        image: './assets/splash.png',
        resizeMode: 'cover',
        backgroundColor: '#031A62',
    },
    updates: {
        fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
        supportsTablet: true,
        infoPlist: {
            LSApplicationQueriesSchemes: ['tel', 'sms', 'maps'],
        },
    },
    android: {
        // Remove the adaptiveIcon configuration
        permissions: [
            "CALL_PHONE",
            "SEND_SMS",
            "ACCESS_FINE_LOCATION",
            "ACCESS_COARSE_LOCATION"
        ],
    },
    web: {
        favicon: './assets/favicon.png',
    },
    plugins: [
        [
            'expo-image-picker',
            {
                photosPermission: 'The app accesses your photos to let you add them to events.',
                cameraPermission: 'The app accesses your camera to let you add pictures to events.',
            },
        ],
    ],
    extra: {
        eas: {
            projectId: '954f3b8e-1155-4f8f-8601-a2b3126da39e',
        },
        IMGBB_API_KEY: process.env.IMGBB_API_KEY,
    },
});
