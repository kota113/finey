export default {
    expo: {
        name: "Finey",
        slug: "Finey",
        version: "0.1.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        assetBundlePatterns: [
            "**/*"
        ],
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.kota113.Finey",
            googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST || "./creds/GoogleService-Info.plist",
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            package: "com.kota113.Finey",
            // change based on build
            googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./creds/GoogleService-Info.plist",
            permissions: [
                'android.permission.SCHEDULE_EXACT_ALARM'
            ]
        },
        extra: {
            eas: {
                projectId: "d044c37d-45e7-46de-8825-c82eac1365d7"
            }
        },
        plugins: [
            "@react-native-google-signin/google-signin",
            "@react-native-firebase/app",
            "@react-native-firebase/auth",
            [
                "expo-build-properties",
                {
                    "ios": {
                        "useFrameworks": "static"
                    }
                }
            ]
        ]
    }
}
