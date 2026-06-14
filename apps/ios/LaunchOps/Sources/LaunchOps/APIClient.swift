import Foundation

actor APIClient {
    private let baseURL: URL

    init() {
        let rawURL = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String
        self.baseURL = URL(string: rawURL ?? "http://localhost:8000")!
    }

    func dashboard(projectKey: String = "demo") async throws -> DashboardSummary {
        let url = baseURL.appending(path: "/v1/projects/\(projectKey)/dashboard")
        let (data, response) = try await URLSession.shared.data(from: url)
        guard let httpResponse = response as? HTTPURLResponse, 200..<300 ~= httpResponse.statusCode else {
            throw URLError(.badServerResponse)
        }
        return try JSONDecoder().decode(DashboardSummary.self, from: data)
    }
}

@MainActor
final class DashboardStore: ObservableObject {
    @Published var dashboard: DashboardSummary = .demo
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let api = APIClient()

    func refresh() async {
        isLoading = true
        defer { isLoading = false }

        do {
            dashboard = try await api.dashboard()
            errorMessage = nil
        } catch {
            dashboard = .demo
            errorMessage = "Showing demo data until the API is reachable."
        }
    }
}

