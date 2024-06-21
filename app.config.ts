import * as path from "node:path";

export default {
    expo: {
        name: "Finey",
        slug: "Finey",
        version: "1.0.0a",
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
            googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST || path.resolve("./creds/GoogleService-Info.plist"),
            buildNumber: "1.0.0a",
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff",
                monochromeImage: './assets/monochrome-icon.png'
            },
            package: "com.kota113.Finey",
            // change based on build
            googleServicesFile: process.env.GOOGLE_SERVICES_JSON || path.resolve("./creds/google-services.json"),
            permissions: [
                'android.permission.SCHEDULE_EXACT_ALARM'
            ],
            versionCode: 2
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
