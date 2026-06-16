import Foundation

struct AuthResponse: Decodable {
    let accessToken: String
    let tokenType: String
    let user: UserProfile
}

struct UserProfile: Decodable {
    let id: String
    let name: String
    let email: String
    let role: String
}

struct DashboardSummary: Decodable {
    var metrics: [DashboardMetric]
    var recentEvents: [[String: DashboardValue]]
    var accountRisks: [[String: DashboardValue]]
    var incidents: [[String: DashboardValue]]
    var tasks: [[String: DashboardValue]]
}

struct DashboardMetric: Decodable, Identifiable {
    var id: String { label }
    let label: String
    let value: String
    let delta: String
    let tone: String
}

struct Project: Decodable, Identifiable {
    let id: String
    let name: String
    let projectKey: String
    let environment: String
    let createdAt: String?
}

struct ProjectMembership: Decodable, Identifiable {
    var id: String { project.id }
    let project: Project
    let role: String
}

struct MeResponse: Decodable {
    let user: UserProfile
    let memberships: [ProjectMembership]
}

struct EventInput: Encodable {
    let projectKey: String
    let accountId: String
    let userId: String?
    let name: String
    let source: String
    let severity: String
    let durationMs: Int
    let properties: [String: String]
}

struct EventResponse: Decodable {
    let id: String
    let accepted: Bool
}

enum DashboardValue: Decodable, CustomStringConvertible {
    case string(String)
    case number(Double)
    case bool(Bool)
    case null

    var description: String {
        switch self {
        case .string(let value):
            return value
        case .number(let value):
            return value.truncatingRemainder(dividingBy: 1) == 0 ? String(Int(value)) : String(value)
        case .bool(let value):
            return value ? "true" : "false"
        case .null:
            return "-"
        }
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() {
            self = .null
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode(Double.self) {
            self = .number(value)
        } else {
            self = .bool(try container.decode(Bool.self))
        }
    }
}

extension DashboardSummary {
    static let demo = DashboardSummary(
        metrics: [
            DashboardMetric(label: "24시간 이벤트", value: "18,420", delta: "어제보다 +12.4%", tone: "good"),
            DashboardMetric(label: "오류율", value: "1.8%", delta: "알림 기준 이하", tone: "good"),
            DashboardMetric(label: "평균 지연", value: "246ms", delta: "p95 안정적", tone: "neutral"),
            DashboardMetric(label: "열린 장애", value: "2", delta: "1건 담당자 필요", tone: "warning")
        ],
        recentEvents: DemoData.events,
        accountRisks: DemoData.accountRisks,
        incidents: DemoData.incidents,
        tasks: DemoData.tasks
    )
}

enum DemoData {
    static let user = UserProfile(id: "demo-user", name: "김수빈", email: "demo@launchops.kr", role: "OWNER")

    static let project = Project(
        id: "demo",
        name: "런치옵스 데모",
        projectKey: "demo",
        environment: "운영",
        createdAt: ISO8601DateFormatter().string(from: Date())
    )

    static let events: [[String: DashboardValue]] = [
        ["name": .string("결제 완료"), "severity": .string("info"), "accountId": .string("acme"), "source": .string("web")],
        ["name": .string("결제 웹훅 실패"), "severity": .string("error"), "accountId": .string("orbit"), "source": .string("stripe")],
        ["name": .string("검색 시간 초과"), "severity": .string("warning"), "accountId": .string("northstar"), "source": .string("api")]
    ]

    static let accountRisks: [[String: DashboardValue]] = [
        ["accountId": .string("orbit"), "riskScore": .number(78), "summary": .string("웹훅 실패로 청구서 전달이 지연되고 있습니다.")],
        ["accountId": .string("northstar"), "riskScore": .number(61), "summary": .string("배포 이후 검색 지연 시간이 증가했습니다.")]
    ]

    static let incidents: [[String: DashboardValue]] = [
        ["title": .string("결제 웹훅 재시도 급증"), "severity": .string("sev2"), "status": .string("investigating"), "owner": .string("백엔드")],
        ["title": .string("검색 p95 지연 증가"), "severity": .string("sev3"), "status": .string("monitoring"), "owner": .string("플랫폼")]
    ]

    static let tasks: [[String: DashboardValue]] = [
        ["title": .string("결제 워커에 멱등성 키 추가"), "priority": .string("high"), "status": .string("todo")],
        ["title": .string("고객 공지용 상태 업데이트 발행"), "priority": .string("medium"), "status": .string("doing")]
    ]

    static let memberships = [
        ProjectMembership(project: project, role: "OWNER")
    ]
}
