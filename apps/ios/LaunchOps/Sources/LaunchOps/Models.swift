import Foundation

struct DashboardSummary: Decodable {
    var metrics: [DashboardMetric]
    var recentEvents: [[String: DashboardValue]]
    var accountRisks: [[String: DashboardValue]]
    var incidents: [[String: DashboardValue]]
    var tasks: [[String: DashboardValue]]

    enum CodingKeys: String, CodingKey {
        case metrics
        case recentEvents
        case accountRisks
        case incidents
        case tasks
    }
}

struct DashboardMetric: Decodable, Identifiable {
    var id: String { label }
    let label: String
    let value: String
    let delta: String
    let tone: String
}

enum DashboardValue: Decodable, CustomStringConvertible {
    case string(String)
    case number(Double)
    case null

    var description: String {
        switch self {
        case .string(let value):
            return value
        case .number(let value):
            return value.truncatingRemainder(dividingBy: 1) == 0 ? String(Int(value)) : String(value)
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
        } else {
            self = .number(try container.decode(Double.self))
        }
    }
}

extension DashboardSummary {
    static let demo = DashboardSummary(
        metrics: [
            DashboardMetric(label: "Events 24h", value: "18,420", delta: "+12.4%", tone: "good"),
            DashboardMetric(label: "Error rate", value: "1.8%", delta: "healthy", tone: "good"),
            DashboardMetric(label: "Latency", value: "246ms", delta: "stable", tone: "neutral"),
            DashboardMetric(label: "Incidents", value: "2", delta: "1 needs owner", tone: "warning")
        ],
        recentEvents: [
            ["name": .string("checkout.completed"), "severity": .string("info"), "account_id": .string("acme")],
            ["name": .string("billing.webhook_failed"), "severity": .string("error"), "account_id": .string("orbit")]
        ],
        accountRisks: [
            ["account_id": .string("orbit"), "risk_score": .number(78), "summary": .string("Webhook failures affecting invoices.")],
            ["account_id": .string("northstar"), "risk_score": .number(61), "summary": .string("Search latency increased.")]
        ],
        incidents: [
            ["title": .string("Billing webhooks retry storm"), "severity": .string("sev2"), "status": .string("investigating")],
            ["title": .string("Search p95 latency elevated"), "severity": .string("sev3"), "status": .string("monitoring")]
        ],
        tasks: [
            ["title": .string("Add idempotency key"), "priority": .string("high"), "status": .string("todo")]
        ]
    )
}
