#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const androidAppPath = path.join(process.cwd(), 'android', 'app');
const flavorsPath = path.join(androidAppPath, 'src');
const iosPath = path.join(process.cwd(), 'ios');
const templatesPath = path.join(__dirname, 'templates');

const createFlavor = async ({ name, packageName, appName }) => {
  const flavorDir = path.join(flavorsPath, name);
  const resDir = path.join(flavorDir, 'res', 'values');
  const manifestPath = path.join(flavorDir, 'AndroidManifest.xml');
  const stringsXmlPath = path.join(resDir, 'strings.xml');

  if (fs.existsSync(flavorDir)) {
    console.log(chalk.red(`Flavor '${name}' already exists.`));
    return;
  }

  await fs.ensureDir(resDir);

  const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName}">

    <application android:label="@string/app_name">
        <!-- Additional config if needed -->
    </application>

</manifest>`;

  const stringsXmlContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${appName}</string>
</resources>`;

  await fs.writeFile(manifestPath, manifestContent);
  await fs.writeFile(stringsXmlPath, stringsXmlContent);

  await updateBuildGradle(name);
  await createIosFolder(name);
  await createEnvFile(name);

  console.log(chalk.green(`✅ Flavor '${name}' created successfully!`));
};

const updateBuildGradle = async (flavorName) => {
  const buildGradlePath = path.join(androidAppPath, 'build.gradle');
  if (!fs.existsSync(buildGradlePath)) {
    console.log(chalk.yellow('⚠️  build.gradle not found. Skipping flavor injection.'));
    return;
  }

  let content = await fs.readFile(buildGradlePath, 'utf8');

  if (!content.includes('productFlavors')) {
    const insertIndex = content.indexOf('defaultConfig {');
    const flavorBlock = `
    flavorDimensions "default"
    productFlavors {
        ${flavorName} {
            dimension "default"
            applicationIdSuffix ".${flavorName}"
            resValue "string", "app_name", "${flavorName}"
        }
    }
`;
    content = content.slice(0, insertIndex) + flavorBlock + content.slice(insertIndex);
  } else {
    const regex = /productFlavors\s*\{([\s\S]*?)\}/m;
    const match = content.match(regex);
    if (match && !match[1].includes(flavorName)) {
      const insertPos = match.index + match[0].lastIndexOf('}');
      const flavorBlock = `    ${flavorName} {
        dimension "default"
        applicationIdSuffix ".${flavorName}"
        resValue "string", "app_name", "${flavorName}"
    }\n`;
      content = content.slice(0, insertPos) + flavorBlock + content.slice(insertPos);
    }
  }

  await fs.writeFile(buildGradlePath, content);
  console.log(chalk.blue(`🛠️  Updated build.gradle with '${flavorName}' flavor.`));
};

const createIosFolder = async (flavorName) => {
  const plistPath = path.join(iosPath, `GoogleService-Info-${flavorName}.plist`);
  if (!fs.existsSync(iosPath)) {
    console.log(chalk.yellow('⚠️  iOS folder not found. Skipping iOS flavor support.'));
    return;
  }
  await fs.writeFile(plistPath, `<!-- Add your GoogleService-Info.plist for ${flavorName} -->`);
  console.log(chalk.magenta(`📱 Created placeholder iOS plist for '${flavorName}'`));
};

const createEnvFile = async (flavorName) => {
  const envPath = path.join(process.cwd(), `.env.${flavorName}`);
  const templatePath = path.join(templatesPath, 'env.example');

  if (fs.existsSync(envPath)) return;

  let content = `# Environment config for ${flavorName}\nAPI_URL=https://api.${flavorName}.example.com\nAPP_ENV=${flavorName.toUpperCase()}`;
  if (fs.existsSync(templatePath)) {
    content = await fs.readFile(templatePath, 'utf8');
    content = content.replace(/YOUR_FLAVOR/g, flavorName);
  }

  await fs.writeFile(envPath, content);
  console.log(chalk.cyan(`🧪 Created .env.${flavorName}`));

  const dotenvImport = `require('react-native-config');`;
  const appJsPath = fs.existsSync(path.join(process.cwd(), 'App.tsx')) ? path.join(process.cwd(), 'App.tsx') : path.join(process.cwd(), 'App.js');
  if (fs.existsSync(appJsPath)) {
    const appContent = await fs.readFile(appJsPath, 'utf8');
    if (!appContent.includes("react-native-config")) {
      const updatedContent = `${dotenvImport}\n\n${appContent}`;
      await fs.writeFile(appJsPath, updatedContent);
      console.log(chalk.green(`✅ Injected react-native-config import into ${path.basename(appJsPath)}`));
    const { execSync } = require('child_process');
      try {
        execSync('npm list react-native-config', { stdio: 'ignore' });
        console.log(chalk.green(`✅ react-native-config is already installed.`));
      } catch {
        console.log(chalk.yellow(`📦 Installing react-native-config...`));
        try {
          const hasYarn = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));
const hasPnpm = fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'));
const installCmd = hasYarn ? 'yarn add react-native-config' : hasPnpm ? 'pnpm add react-native-config' : 'npm install react-native-config';
console.log(chalk.blueBright(`🔧 Used: ${installCmd}`));
execSync(installCmd, { stdio: 'inherit' });
          console.log(chalk.green(`✅ Successfully installed react-native-config.`));
        } catch (installErr) {
          console.log(chalk.red(`❌ Failed to install react-native-config. Please install it manually.`));
        }
      }
    }
  }
};

program
  .command('create <flavorName>')
  .description('Create a new React Native build flavor')
  .option('-p, --package <packageName>', 'Package name (e.g., com.myapp.dev)')
  .option('-n, --name <appName>', 'App Name for this flavor')
  .action(async (flavorName, options) => {
    const { package: pkg, name: appName } = options;

    if (!pkg || !appName) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'packageName',
          message: 'Enter the package name (e.g., com.myapp.dev):',
          when: () => !pkg
        },
        {
          type: 'input',
          name: 'appName',
          message: 'Enter the app name:',
          when: () => !appName
        }
      ]);

      await createFlavor({
        name: flavorName,
        packageName: pkg || answers.packageName,
        appName: appName || answers.appName,
      });
    } else {
      await createFlavor({
        name: flavorName,
        packageName: pkg,
        appName,
      });
    }
  });

program.parse(process.argv);