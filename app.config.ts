import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'volunteam',
    slug: 'volunteam',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
        image: './assets/splash.png',
        resizeMode: 'cover',
        backgroundColor: '#031A62',
    },
    updates: {
        fallbackToCacheTimeout: 30000, // Allow a 30-second fallback timeout for updates
    },
    assetBundlePatterns: ['**/*'],
    ios: {
        supportsTablet: true,
        infoPlist: {
            LSApplicationQueriesSchemes: ['tel', 'sms', 'maps'], // Allow deep linking to these schemes
        },
    },
    android: {
        permissions: [
            'CALL_PHONE',
            'SEND_SMS',
            'ACCESS_FINE_LOCATION',
            'ACCESS_COARSE_LOCATION',
        ],
        newArchEnabled: true, // Ensure compatibility with new architecture
    },
    web: {
        favicon: './assets/favicon.png',
    },
    plugins: [
        [
            'expo-image-picker',
            {
                photosPermission:
                    'The app accesses your photos to let you add them to events.',
                cameraPermission:
                    'The app accesses your camera to let you add pictures to events.',
            },
        ],
    ],
    extra: {
        eas: {
            projectId: '954f3b8e-1155-4f8f-8601-a2b3126da39e',
        },
        IMGBB_API_KEY: config.extra?.IMGBB_API_KEY || '',
    },
});
