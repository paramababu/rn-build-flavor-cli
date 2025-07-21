#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const androidAppPath = path.join(process.cwd(), 'android', 'app');
const flavorsPath = path.join(androidAppPath, 'src');
const iosPath = path.join(process.cwd(), 'ios');

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
    // Append new flavor
    const regex = /productFlavors\s*\{([\s\S]*?)\}/;
    const match = content.match(regex);
    if (match && !match[1].includes(flavorName)) {
      const updated = match[0].replace(/\}/, `    ${flavorName} {
        dimension "default"
        applicationIdSuffix ".${flavorName}"
        resValue "string", "app_name", "${flavorName}"
    }\n}`);
      content = content.replace(regex, updated);
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
  if (fs.existsSync(envPath)) return;

  const content = `# Environment config for ${flavorName}
API_URL=https://api.${flavorName}.example.com
APP_ENV=${flavorName.toUpperCase()}`;
  await fs.writeFile(envPath, content);
  console.log(chalk.cyan(`🧪 Created .env.${flavorName}`));
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
