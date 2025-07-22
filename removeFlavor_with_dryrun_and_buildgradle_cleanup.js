const removeFlavor = async (flavorName, dryRun = false) => {
  const flavorDir = path.join(flavorsPath, flavorName);
  if (fs.existsSync(flavorDir)) {
    if (dryRun) {
      console.log(chalk.cyan(`[DRY RUN] Would remove Android src for '${flavorName}'`));
    } else {
      await fs.remove(flavorDir);
      console.log(chalk.yellow(`🧹 Removed Android src for '${flavorName}'`));
    }
  }

  const envPath = path.join(process.cwd(), `.env.${flavorName}`);
  if (fs.existsSync(envPath)) {
    if (dryRun) {
      console.log(chalk.cyan(`[DRY RUN] Would remove .env.${flavorName}`));
    } else {
      await fs.remove(envPath);
      console.log(chalk.yellow(`🧹 Removed .env.${flavorName}`));
    }
  }

  const pkg = require(packageJsonPath);
  if (pkg.scripts && pkg.scripts[`android-${flavorName}`]) {
    if (dryRun) {
      console.log(chalk.cyan(`[DRY RUN] Would remove script: android-${flavorName}`));
    } else {
      delete pkg.scripts[`android-${flavorName}`];
      await fs.writeJson(packageJsonPath, pkg, { spaces: 2 });
      console.log(chalk.yellow(`🧹 Removed script: android-${flavorName}`));
    }
  }

  // Remove from build.gradle
  const gradlePath = path.join(androidAppPath, 'build.gradle');
  if (fs.existsSync(gradlePath)) {
    let content = await fs.readFile(gradlePath, 'utf8');
    const flavorRegex = new RegExp(`\s+${flavorName}\s*{[^}]*}`, 'g');
    if (flavorRegex.test(content)) {
      if (dryRun) {
        console.log(chalk.cyan(`[DRY RUN] Would remove flavor '${flavorName}' from build.gradle`));
      } else {
        content = content.replace(flavorRegex, '');
        await fs.writeFile(gradlePath, content);
        console.log(chalk.yellow(`🧹 Removed flavor '${flavorName}' from build.gradle`));
      }
    }
  }

  if (!dryRun) {
    console.log(chalk.green(`✅ Flavor '${flavorName}' removed.`));
  }
};