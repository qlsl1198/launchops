import SwiftUI
#if os(iOS)
import UIKit
#else
import AppKit
#endif

struct DashboardView: View {
    @EnvironmentObject private var store: DashboardStore

    var body: some View {
        Group {
            if store.isAuthenticated {
                mobileWorkspace
            } else {
                AuthView()
            }
        }
    }

    private var mobileWorkspace: some View {
        TabView {
            OverviewScreen()
                .tabItem {
                    Label("홈", systemImage: "chart.line.uptrend.xyaxis")
                }

            EventsScreen()
                .tabItem {
                    Label("이벤트", systemImage: "dot.radiowaves.left.and.right")
                }

            IncidentsScreen()
                .tabItem {
                    Label("장애", systemImage: "bell.badge")
                }

            AccountRiskScreen()
                .tabItem {
                    Label("고객", systemImage: "person.2")
                }
        }
        .tint(.blue)
    }
}

private struct AuthView: View {
    @EnvironmentObject private var store: DashboardStore
    @State private var isRegistering = false
    @State private var name = "김수빈"
    @State private var email = "demo@launchops.kr"
    @State private var password = "password123"

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("LaunchOps")
                            .font(.largeTitle.weight(.bold))
                        Text("모바일에서도 제품 이벤트, 장애, 고객 리스크를 한 번에 확인하세요.")
                            .foregroundStyle(.secondary)
                    }

                    VStack(spacing: 14) {
                        if isRegistering {
                            TextField("이름", text: $name)
                                .textContentType(.name)
                                .textFieldStyle(.roundedBorder)
                        }
                        TextField("이메일", text: $email)
                            .textContentType(.emailAddress)
                            .emailInputStyle()
                            .textFieldStyle(.roundedBorder)
                        SecureField("비밀번호", text: $password)
                            .textContentType(.password)
                            .textFieldStyle(.roundedBorder)

                        Button {
                            Task {
                                if isRegistering {
                                    await store.register(name: name, email: email, password: password)
                                } else {
                                    await store.login(email: email, password: password)
                                }
                            }
                        } label: {
                            HStack {
                                if store.isLoading {
                                    ProgressView()
                                }
                                Text(isRegistering ? "회원가입" : "로그인")
                                    .fontWeight(.bold)
                            }
                            .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .disabled(store.isLoading)

                        Button(isRegistering ? "이미 계정이 있어요" : "새 계정 만들기") {
                            isRegistering.toggle()
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(18)
                    .background(Color.appSecondaryBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 16))

                    NoticeCard()
                }
                .padding(22)
            }
            .background(Color.appGroupedBackground)
        }
    }
}

private struct OverviewScreen: View {
    @EnvironmentObject private var store: DashboardStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    HeaderCard()
                    ProjectPicker()
                    MetricGrid(metrics: store.dashboard.metrics)
                    NoticeCard()
                    SectionCard(title: "최근 이벤트") {
                        ForEach(indexed(store.dashboard.recentEvents), id: \.offset) { _, row in
                            RowView(
                                title: value(row, "name"),
                                detail: "\(ko(value(row, "severity"))) · \(value(row, "accountId", fallback: value(row, "account_id")))"
                            )
                        }
                    }
                }
                .padding(18)
            }
            .background(Color.appGroupedBackground)
            .navigationTitle("운영 홈")
            .toolbar {
                #if os(iOS)
                ToolbarItem(placement: .topBarLeading) {
                    Button("로그아웃") {
                        Task { await store.logout() }
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        Task { await store.refresh() }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                }
                #else
                ToolbarItem(placement: .automatic) {
                    Button("로그아웃") {
                        Task { await store.logout() }
                    }
                }
                ToolbarItem(placement: .automatic) {
                    Button {
                        Task { await store.refresh() }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                }
                #endif
            }
            .refreshable {
                await store.refresh()
            }
        }
    }
}

private struct EventsScreen: View {
    @EnvironmentObject private var store: DashboardStore

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Button {
                        Task { await store.sendDemoEvent() }
                    } label: {
                        Label("모바일 테스트 이벤트 전송", systemImage: "paperplane.fill")
                    }
                    .disabled(store.isLoading)
                }

                Section("이벤트 스트림") {
                    ForEach(indexed(store.events), id: \.offset) { _, row in
                        RowView(
                            title: value(row, "name"),
                            detail: "\(ko(value(row, "severity"))) · \(value(row, "source")) · \(value(row, "accountId", fallback: value(row, "account_id")))"
                        )
                    }
                }
            }
            .navigationTitle("실시간 이벤트")
            .refreshable {
                await store.refresh()
            }
        }
    }
}

private struct IncidentsScreen: View {
    @EnvironmentObject private var store: DashboardStore

    var body: some View {
        NavigationStack {
            List {
                Section("열린 장애") {
                    ForEach(indexed(store.incidents), id: \.offset) { _, row in
                        RowView(
                            title: value(row, "title"),
                            detail: "\(ko(value(row, "severity"))) · \(ko(value(row, "status"))) · 담당 \(value(row, "owner"))"
                        )
                    }
                }

                Section("운영 작업") {
                    ForEach(indexed(store.dashboard.tasks), id: \.offset) { _, row in
                        RowView(
                            title: value(row, "title"),
                            detail: "\(ko(value(row, "priority"))) · \(ko(value(row, "status")))"
                        )
                    }
                }
            }
            .navigationTitle("장애 관리")
            .refreshable {
                await store.refresh()
            }
        }
    }
}

private struct AccountRiskScreen: View {
    @EnvironmentObject private var store: DashboardStore

    var body: some View {
        NavigationStack {
            List {
                Section("고객 리스크") {
                    ForEach(indexed(store.accountRisks), id: \.offset) { _, row in
                        VStack(alignment: .leading, spacing: 10) {
                            HStack {
                                Text(value(row, "accountId", fallback: value(row, "account_id")))
                                    .font(.headline)
                                Spacer()
                                Text("리스크 \(value(row, "riskScore", fallback: value(row, "risk_score")))")
                                    .font(.caption.weight(.bold))
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 5)
                                    .background(Color.orange.opacity(0.15))
                                    .clipShape(Capsule())
                            }
                            Text(value(row, "summary"))
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.vertical, 6)
                    }
                }
            }
            .navigationTitle("고객 상태")
            .refreshable {
                await store.refresh()
            }
        }
    }
}

private struct HeaderCard: View {
    @EnvironmentObject private var store: DashboardStore

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("한국형 SaaS 운영 앱")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.blue)
            Text("\(store.user?.name ?? "운영자")님, 오늘의 제품 상태입니다.")
                .font(.title2.weight(.bold))
            Text("이벤트 수집부터 장애 대응, 고객 리스크까지 모바일에서 바로 확인합니다.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(18)
        .background(Color.appSecondaryBackground)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

private struct ProjectPicker: View {
    @EnvironmentObject private var store: DashboardStore

    var body: some View {
        Picker("프로젝트", selection: $store.selectedProjectKey) {
            ForEach(store.memberships) { membership in
                Text(membership.project.name).tag(membership.project.projectKey)
            }
        }
        .pickerStyle(.menu)
        .onChange(of: store.selectedProjectKey) {
            Task { await store.refresh() }
        }
    }
}

private struct MetricGrid: View {
    let metrics: [DashboardMetric]

    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            ForEach(metrics) { metric in
                MetricTile(metric: metric)
            }
        }
    }
}

private struct MetricTile: View {
    let metric: DashboardMetric

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(metric.label)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(metric.value)
                .font(.title2.weight(.bold))
            Text(metric.delta)
                .font(.caption)
                .foregroundStyle(tint)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(Color.appSecondaryBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var tint: Color {
        switch metric.tone {
        case "good":
            return .green
        case "warning":
            return .orange
        case "danger":
            return .red
        default:
            return .blue
        }
    }
}

private struct NoticeCard: View {
    @EnvironmentObject private var store: DashboardStore

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(store.notice)
                .font(.subheadline.weight(.semibold))
            if let error = store.errorMessage {
                Text(error)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(Color.blue.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

private struct SectionCard<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
            content
        }
        .padding(14)
        .background(Color.appSecondaryBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

private struct RowView: View {
    let title: String
    let detail: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.subheadline.weight(.semibold))
            Text(detail)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

private func indexed(_ rows: [[String: DashboardValue]]) -> [(offset: Int, element: [String: DashboardValue])] {
    Array(rows.enumerated())
}

private func value(_ row: [String: DashboardValue], _ key: String, fallback: String = "-") -> String {
    row[key]?.description ?? fallback
}

private func ko(_ value: String) -> String {
    let dictionary = [
        "info": "정보",
        "warning": "경고",
        "error": "오류",
        "critical": "치명",
        "sev1": "1등급",
        "sev2": "2등급",
        "sev3": "3등급",
        "open": "열림",
        "investigating": "조사 중",
        "monitoring": "모니터링",
        "resolved": "해결",
        "todo": "할 일",
        "doing": "진행 중",
        "done": "완료",
        "high": "높음",
        "medium": "보통",
        "low": "낮음"
    ]
    return dictionary[value] ?? value
}

private extension View {
    @ViewBuilder
    func emailInputStyle() -> some View {
        #if os(iOS)
        self
            .textInputAutocapitalization(.never)
            .keyboardType(.emailAddress)
        #else
        self
        #endif
    }
}

private extension Color {
    static var appGroupedBackground: Color {
        #if os(iOS)
        Color(uiColor: .systemGroupedBackground)
        #else
        Color(nsColor: .windowBackgroundColor)
        #endif
    }

    static var appSecondaryBackground: Color {
        #if os(iOS)
        Color(uiColor: .secondarySystemGroupedBackground)
        #else
        Color(nsColor: .controlBackgroundColor)
        #endif
    }
}

struct DashboardViewPreviews: PreviewProvider {
    static var previews: some View {
        DashboardView()
            .environmentObject(DashboardStore())
    }
}
