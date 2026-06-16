# LaunchOps iOS

LaunchOps 백엔드와 같은 계약을 사용하는 SwiftUI iOS 앱입니다. 웹 관리자 콘솔과 별개로, 모바일에서 제품 상태를 빠르게 확인하고 테스트 이벤트를 전송하는 운영자용 앱을 목표로 합니다.

## 구현 범위

- 한국어 로그인 / 회원가입 화면
- 인증 토큰 기반 API 호출
- 프로젝트 멤버십 기반 프로젝트 선택
- 모바일 대시보드, 실시간 이벤트 목록, 장애 관리, 고객 리스크 탭
- API 미연결 상황에서도 확인 가능한 데모 데이터 fallback
- 모바일 테스트 이벤트 전송 액션
- XcodeGen 프로젝트 생성 경로
- fastlane TestFlight 배포 lane

## 로컬 실행

현재 저장소에는 Xcode 프로젝트 파일을 직접 커밋하지 않고, `project.yml`로 재생성하는 방식을 사용합니다.

```bash
brew install xcodegen
cd apps/ios/LaunchOps
xcodegen generate
open LaunchOps.xcodeproj
```

Xcode에서 `LaunchOps` scheme을 선택한 뒤 iPhone 시뮬레이터로 실행합니다.

## API 연결

`Sources/LaunchOps/Info.plist`의 `API_BASE_URL` 값이 앱이 호출할 백엔드 주소입니다.

```xml
<key>API_BASE_URL</key>
<string>http://localhost:8000</string>
```

로컬 시뮬레이터에서 Spring Boot API를 함께 실행할 때는 `http://localhost:8000`을 사용할 수 있습니다. 실제 기기 또는 배포 API를 사용할 때는 Render, Fly.io, Railway 등 HTTPS 주소로 바꿔 빌드합니다.

## 검증

이 작업 환경에는 Xcode/iOS SDK가 없어 실제 iOS 빌드는 Xcode에서 실행해야 합니다. 대신 Swift 문법과 타입은 아래 명령으로 확인했습니다.

```bash
cd apps/ios/LaunchOps
swiftc -module-cache-path /private/tmp/launchops-swift-module-cache -typecheck Sources/LaunchOps/*.swift
```

## TestFlight 배포

App Store Connect 배포에는 Apple Developer Program 계정과 signing 설정이 필요합니다. Xcode에서 팀, bundle id, provisioning profile을 설정한 뒤 다음 명령을 실행합니다.

```bash
cd apps/ios/LaunchOps
bundle install
bundle exec fastlane beta
```

`fastlane/Fastfile`의 `beta` lane은 build number를 올리고, app-store export 방식으로 빌드한 뒤 TestFlight에 업로드합니다.
