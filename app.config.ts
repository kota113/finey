const googleServicesJson: string = '/mnt/c/Users/iwa12/WebstormProjects/Finey/creds/google-services.json'
const googleServiceInfoPlist: string = '/mnt/c/Users/iwa12/WebstormProjects/Finey/creds/GoogleService-Info.plist'
const versionString: string = '1.0.3'

export default {
    expo: {
        name: "Finey",
        slug: "Finey",
        version: versionString,
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
            googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST || googleServiceInfoPlist,
            buildNumber: versionString,
            associatedDomains: [
                "applinks:finey.kota113.com"
            ]
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff",
                monochromeImage: './assets/monochrome-icon.png'
            },
            package: "com.kota113.Finey",
            // change based on build
            googleServicesFile: process.env.GOOGLE_SERVICES_JSON || googleServicesJson,
            permissions: [
                'android.permission.SCHEDULE_EXACT_ALARM'
            ],
            versionCode: 5,
            intentFilters: [
                {
                    action: "VIEW",
                    autoVerify: true,
                    data: [
                        {
                            scheme: "https",
                            host: "finey.kota113.com",
                            pathPrefix: "/app"
                        }
                    ],
                    category: ["BROWSABLE", "DEFAULT"]
                }
            ]
        },
        extra: {
            eas: {
                projectId: "d044c37d-45e7-46de-8825-c82eac1365d7"
            }
        },
        plugins: [
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
