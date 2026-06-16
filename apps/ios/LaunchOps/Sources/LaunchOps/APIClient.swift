import Foundation

actor APIClient {
    private let baseURL: URL
    private let tokenKey = "launchops.ios.accessToken"
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()

    init() {
        let rawURL = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String
        self.baseURL = URL(string: rawURL ?? "http://localhost:8000")!
    }

    var hasSession: Bool {
        UserDefaults.standard.string(forKey: tokenKey) != nil
    }

    func login(email: String, password: String) async throws -> AuthResponse {
        let response: AuthResponse = try await request(
            path: "/v1/auth/login",
            method: "POST",
            body: ["email": email, "password": password],
            requiresAuth: false
        )
        persist(response: response)
        return response
    }

    func register(name: String, email: String, password: String) async throws -> AuthResponse {
        let response: AuthResponse = try await request(
            path: "/v1/auth/register",
            method: "POST",
            body: ["name": name, "email": email, "password": password],
            requiresAuth: false
        )
        persist(response: response)
        return response
    }

    func logout() {
        UserDefaults.standard.removeObject(forKey: tokenKey)
    }

    func me() async throws -> MeResponse {
        try await request(path: "/v1/me")
    }

    func dashboard(projectKey: String) async throws -> DashboardSummary {
        try await request(path: "/v1/projects/\(projectKey)/dashboard")
    }

    func events(projectKey: String) async throws -> [[String: DashboardValue]] {
        try await request(path: "/v1/events?projectKey=\(projectKey)&limit=50")
    }

    func incidents(projectKey: String) async throws -> [[String: DashboardValue]] {
        try await request(path: "/v1/incidents?projectKey=\(projectKey)")
    }

    func accountHealth(projectKey: String) async throws -> [[String: DashboardValue]] {
        try await request(path: "/v1/accounts/health?projectKey=\(projectKey)")
    }

    func createEvent(_ input: EventInput) async throws {
        let _: EventResponse = try await request(path: "/v1/events", method: "POST", body: input)
    }

    private func persist(response: AuthResponse) {
        UserDefaults.standard.set(response.accessToken, forKey: tokenKey)
    }

    private func request<Response: Decodable>(
        path: String,
        method: String = "GET",
        requiresAuth: Bool = true
    ) async throws -> Response {
        try await request(path: path, method: method, body: Optional<EmptyBody>.none, requiresAuth: requiresAuth)
    }

    private func request<Response: Decodable, Body: Encodable>(
        path: String,
        method: String = "GET",
        body: Body? = Optional<String>.none,
        requiresAuth: Bool = true
    ) async throws -> Response {
        let url = URL(string: path, relativeTo: baseURL)!
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let body {
            request.httpBody = try encoder.encode(body)
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        if requiresAuth, let token = UserDefaults.standard.string(forKey: tokenKey) {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, 200..<300 ~= httpResponse.statusCode else {
            throw URLError(.badServerResponse)
        }

        return try decoder.decode(Response.self, from: data)
    }
}

private struct EmptyBody: Encodable {}

@MainActor
final class DashboardStore: ObservableObject {
    @Published var dashboard: DashboardSummary = .demo
    @Published var events: [[String: DashboardValue]] = DemoData.events
    @Published var incidents: [[String: DashboardValue]] = DemoData.incidents
    @Published var accountRisks: [[String: DashboardValue]] = DemoData.accountRisks
    @Published var memberships: [ProjectMembership] = DemoData.memberships
    @Published var selectedProjectKey = "demo"
    @Published var user: UserProfile?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var notice = "API 연결 전에도 데모 데이터로 앱을 확인할 수 있습니다."

    private let api = APIClient()

    func restoreSession() async {
        isAuthenticated = await api.hasSession
        guard isAuthenticated else {
            user = nil
            return
        }

        await refresh()
    }

    func login(email: String, password: String) async {
        await authenticate {
            try await api.login(email: email, password: password)
        }
    }

    func register(name: String, email: String, password: String) async {
        await authenticate {
            try await api.register(name: name, email: email, password: password)
        }
    }

    func logout() async {
        await api.logout()
        isAuthenticated = false
        user = nil
        dashboard = .demo
        events = DemoData.events
        incidents = DemoData.incidents
        accountRisks = DemoData.accountRisks
        memberships = DemoData.memberships
        notice = "로그아웃되었습니다. 데모 데이터로 앱을 확인할 수 있습니다."
    }

    func refresh() async {
        isLoading = true
        defer { isLoading = false }

        do {
            if isAuthenticated {
                let me = try await api.me()
                user = me.user
                memberships = me.memberships
                if !me.memberships.contains(where: { $0.project.projectKey == selectedProjectKey }) {
                    selectedProjectKey = me.memberships.first?.project.projectKey ?? "demo"
                }
            }

            async let dashboardRequest = api.dashboard(projectKey: selectedProjectKey)
            async let eventsRequest = api.events(projectKey: selectedProjectKey)
            async let incidentsRequest = api.incidents(projectKey: selectedProjectKey)
            async let accountHealthRequest = api.accountHealth(projectKey: selectedProjectKey)

            dashboard = try await dashboardRequest
            events = try await eventsRequest
            incidents = try await incidentsRequest
            accountRisks = try await accountHealthRequest
            errorMessage = nil
            notice = "서버 데이터가 최신 상태입니다."
        } catch {
            dashboard = .demo
            events = DemoData.events
            incidents = DemoData.incidents
            accountRisks = DemoData.accountRisks
            errorMessage = "API 연결에 실패해 데모 데이터로 전환했습니다."
            notice = "로컬 또는 배포 API 주소와 로그인 상태를 확인하세요."
        }
    }

    func sendDemoEvent() async {
        isLoading = true
        defer { isLoading = false }

        do {
            try await api.createEvent(
                EventInput(
                    projectKey: selectedProjectKey,
                    accountId: "mobile-user",
                    userId: user?.id,
                    name: "모바일 앱에서 이벤트 전송",
                    source: "ios",
                    severity: "info",
                    durationMs: 180,
                    properties: ["channel": "ios", "screen": "dashboard"]
                )
            )
            notice = "모바일 테스트 이벤트를 전송했습니다."
            await refresh()
        } catch {
            errorMessage = "이벤트 전송에 실패했습니다."
            notice = "API 연결 또는 인증 상태를 확인하세요."
        }
    }

    private func authenticate(_ action: () async throws -> AuthResponse) async {
        isLoading = true
        defer { isLoading = false }

        do {
            let response = try await action()
            user = response.user
            isAuthenticated = true
            errorMessage = nil
            notice = "\(response.user.name)님, 다시 오신 것을 환영합니다."
            await refresh()
        } catch {
            errorMessage = "로그인 또는 회원가입에 실패했습니다."
            notice = "API 주소와 계정 정보를 확인하세요."
        }
    }
}
