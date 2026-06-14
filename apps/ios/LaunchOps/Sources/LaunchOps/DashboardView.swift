import SwiftUI

struct DashboardView: View {
    @EnvironmentObject private var store: DashboardStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    header
                    metricGrid
                    SectionCard(title: "Incidents") {
                        VStack(spacing: 10) {
                            ForEach(Array(store.dashboard.incidents.enumerated()), id: \.offset) { _, row in
                                RowView(title: row["title"]?.description ?? "-", detail: "\(row["severity"]?.description ?? "-") · \(row["status"]?.description ?? "-")")
                            }
                        }
                    }
                    SectionCard(title: "Account risk") {
                        VStack(spacing: 10) {
                            ForEach(Array(store.dashboard.accountRisks.enumerated()), id: \.offset) { _, row in
                                RowView(title: row["account_id"]?.description ?? "-", detail: row["summary"]?.description ?? "-")
                            }
                        }
                    }
                    SectionCard(title: "Recent events") {
                        VStack(spacing: 10) {
                            ForEach(Array(store.dashboard.recentEvents.enumerated()), id: \.offset) { _, row in
                                RowView(title: row["name"]?.description ?? "-", detail: "\(row["severity"]?.description ?? "-") · \(row["account_id"]?.description ?? "-")")
                            }
                        }
                    }
                }
                .padding(18)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("LaunchOps")
            .toolbar {
                Button {
                    Task { await store.refresh() }
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Product operations")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.blue)
            Text("Signal, incidents, and customer health on mobile.")
                .font(.title2.weight(.bold))
            if let error = store.errorMessage {
                Text(error)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var metricGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            ForEach(store.dashboard.metrics) { metric in
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
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 8))
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
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 8))
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

#Preview {
    DashboardView()
        .environmentObject(DashboardStore())
}

