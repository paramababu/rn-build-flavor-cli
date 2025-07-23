# rn-build-flavor-cli

[![npm version](https://badge.fury.io/js/rn-build-flavor-cli.svg)](https://www.npmjs.com/package/rn-build-flavor-cli)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/paramababu/rn-build-flavor-cli?style=social)](https://github.com/paramababu/rn-build-flavor-cli)

CLI to automatically create Android/iOS build flavors for React Native projects with `.env` support and `react-native-config` integration.

---

## 🚀 Features

- 📁 Creates `android/app/src/<flavor>` folder with manifest and strings
- 📜 Injects flavor into `build.gradle` (`productFlavors`)
- 🍏 Generates `ios/GoogleService-Info-<flavor>.plist`
- 🌱 Creates `.env.<flavor>` file using a customizable template
- 🧠 Injects `require('react-native-config')` into `App.js` or `App.tsx`
- 📦 Auto-installs `react-native-config` using npm/yarn/pnpm (based on lock files)
- 📜 Automatically adds run script to `package.json` like:  
  ```json
  "android-staging": "npx react-native run-android --variant=stagingDebug"
  ```

---

## 📦 Installation

```bash
npm install -g rn-build-flavor-cli
```

---

## 🛠️ Usage

### Create a new flavor

```bash
npx rn-build-flavor-cli create staging \
  --package=com.myapp.staging \
  --name="MyApp Staging"
```

---

## 📲 How to Run a Flavor

Once created, a script is added to your `package.json`. You can run the app using:

```bash
yarn android-staging
# or
npm run android-staging
```

This will internally run:

```bash
npx react-native run-android --variant=stagingDebug
```

⚠️ **Note:** Do not name your flavor `test` — it's a reserved word in Gradle and will break the build.

---

## 📁 Resulting Structure

```
android/app/src/staging/
├── AndroidManifest.xml
└── res/values/strings.xml

ios/
└── GoogleService-Info-staging.plist

.env.staging

App.js (or App.tsx)
└── require('react-native-config') injected
```

---

## 🧪 Template Support

You can customize `.env` by creating:
```
templates/env.example
```

```env
API_URL=https://api.YOUR_FLAVOR.example.com
APP_ENV=YOUR_FLAVOR
```

This will be used and replaced automatically.

---

## 🔧 Auto Dependency Detection

The CLI will detect your project setup and use:
- `yarn add react-native-config`
- `pnpm add react-native-config`
- `npm install react-native-config`

---

## 📄 License

MIT © [paramababu](https://github.com/paramababu)
