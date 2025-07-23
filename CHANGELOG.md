# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# Changelog

All notable changes to this project will be documented in this file.

## [1.0.7] - 2025-07-23
### Added
- Flavor creation with `.env`, Android `build.gradle`, iOS plist, and App.js/ts config injection
- Automatic installation of `react-native-config` based on lock files (npm/yarn/pnpm)
- `--dry-run` support for previewing changes before applying
- `remove <flavor>` command with cleanup of Android src, .env files, scripts, and App.js preview
- Run script auto-generation in `package.json` for created flavors
- Dry-run preview for removal with summary
- Auto-detect App.js or App.tsx
- App name injection in `strings.xml` and `build.gradle`
- Warning on invalid flavor names like `test`

### Fixed
- Metro bundler crash on dynamic `require` of package.json
- Incorrect namespace vs. manifest `package` mismatch

### Changed
- Better logging (used npm/yarn, actions done, etc.)
- Refactored script structure for maintainability


### [1.0.4](https://github.com/paramababu/rn-build-flavor-cli/compare/v1.0.2...v1.0.4) (2025-07-21)

### 1.0.3 (2025-07-21)
