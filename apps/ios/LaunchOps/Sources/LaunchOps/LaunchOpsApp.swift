import SwiftUI

@main
struct LaunchOpsApp: App {
    @StateObject private var store = DashboardStore()

    var body: some Scene {
        WindowGroup {
            DashboardView()
                .environmentObject(store)
                .task {
                    await store.refresh()
                }
        }
    }
}

