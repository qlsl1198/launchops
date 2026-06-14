# LaunchOps iOS

Native SwiftUI client for the LaunchOps backend.

## Scope

- Executive mobile dashboard
- Incident and account-risk overview
- Shared backend contract with the web app
- TestFlight/App Store deployment path via fastlane

## Local run

The source is intentionally simple SwiftUI and can be added to a new Xcode iOS App target:

1. Open Xcode.
2. Create a new iOS App named `LaunchOps`.
3. Set bundle identifier, for example `com.yourname.launchops`.
4. Add files in `Sources/LaunchOps`.
5. Add `API_BASE_URL` to `Info.plist` or use the default local URL.

For a polished production setup, generate an Xcode project with XcodeGen using `project.yml`.

```bash
brew install xcodegen
cd apps/ios/LaunchOps
xcodegen generate
open LaunchOps.xcodeproj
```

## TestFlight deployment

Apple App Store/TestFlight distribution requires an Apple Developer Program account.
After signing is configured in Xcode:

```bash
bundle install
bundle exec fastlane beta
```

