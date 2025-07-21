# rn-build-flavor-cli

A simple and powerful CLI tool to generate and manage multiple build flavors (dev, staging, prod, etc.) for React Native apps.

---

## 🚀 Features

- 📱 Creates Android and iOS flavor folders
- 🛠️ Automatically injects productFlavors into `build.gradle`
- 🌍 Generates environment-specific `.env` files
- ⚡ Fast setup using one-liner CLI command

---

## 📦 Installation

```bash
npm install -g rn-build-flavor-cli
```

Or use it directly with NPX:

```bash
npx rn-build-flavor create dev --package=com.myapp.dev --name="MyApp Dev"
```

---

## 🛠️ Usage

### Create a new flavor

```bash
rn-build-flavor create <flavorName> \
  --package=com.myapp.<flavorName> \
  --name="MyApp <FlavorName>"
```

**Example:**

```bash
rn-build-flavor create staging \
  --package=com.myapp.staging \
  --name="MyApp Staging"
```

---

## 🔧 What It Does

✅ Adds a new Android flavor folder at `android/app/src/<flavorName>`  
✅ Injects `productFlavors` block into `android/app/build.gradle`  
✅ Creates `.env.<flavorName>` file  
✅ Creates `GoogleService-Info-<flavorName>.plist` in iOS folder  

---

## 📁 Folder Output

```
android/
└── app/
    └── src/
        └── dev/
            ├── AndroidManifest.xml
            └── res/values/strings.xml

ios/
└── GoogleService-Info-dev.plist

.env.dev
```

---

## 🧑‍💻 Contributing

PRs welcome! Please file an issue for any bug or feature suggestion.

---

## 📄 License

MIT