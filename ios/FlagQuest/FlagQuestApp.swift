import SwiftUI

@main
struct FlagQuestApp: App {
    var body: some Scene {
        WindowGroup {
            WebAppView()
                .background(Color("LaunchBackground"))
                .ignoresSafeArea()
        }
    }
}
