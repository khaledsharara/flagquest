import SwiftUI
import UIKit
import WebKit

/// Hosts the bundled web app (the `web` folder) in a full-screen WKWebView.
struct WebAppView: UIViewRepresentable {
    func makeCoordinator() -> NativeBridge {
        NativeBridge()
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.setURLSchemeHandler(BundleSchemeHandler(), forURLScheme: BundleSchemeHandler.scheme)

        let contentController = configuration.userContentController
        contentController.addUserScript(
            WKUserScript(
                source: context.coordinator.bootstrapScript(),
                injectionTime: .atDocumentStart,
                forMainFrameOnly: true
            )
        )
        for name in NativeBridge.handlerNames {
            contentController.add(context.coordinator, name: name)
        }

        let webView = WKWebView(frame: .zero, configuration: configuration)
        let background = UIColor(named: "LaunchBackground") ?? .systemBackground
        webView.isOpaque = false
        webView.backgroundColor = background
        webView.scrollView.backgroundColor = background
        // The page lays itself out with CSS safe-area insets and never scrolls as a whole.
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.bounces = false
        webView.allowsLinkPreview = false
        if #available(iOS 16.4, *) {
            webView.isInspectable = true
        }

        webView.load(URLRequest(url: BundleSchemeHandler.startURL))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

/// Receives messages from JavaScript: persistent storage and haptic feedback.
final class NativeBridge: NSObject, WKScriptMessageHandler {
    static let handlerNames = ["store", "haptic"]
    private let defaultsKey = "webStore"

    private var store: [String: String] {
        get { UserDefaults.standard.dictionary(forKey: defaultsKey) as? [String: String] ?? [:] }
        set { UserDefaults.standard.set(newValue, forKey: defaultsKey) }
    }

    /// Makes previously saved values available to the page before any of its scripts run.
    func bootstrapScript() -> String {
        let data = (try? JSONSerialization.data(withJSONObject: store)) ?? Data("{}".utf8)
        let json = String(data: data, encoding: .utf8) ?? "{}"
        return "window.__NATIVE_STORE__ = \(json);"
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        switch message.name {
        case "store":
            guard let body = message.body as? [String: Any],
                  let key = body["key"] as? String,
                  let value = body["value"] as? String else { return }
            var current = store
            current[key] = value
            store = current
        case "haptic":
            switch message.body as? String {
            case "success":
                UINotificationFeedbackGenerator().notificationOccurred(.success)
            case "error":
                UINotificationFeedbackGenerator().notificationOccurred(.error)
            default:
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
            }
        default:
            break
        }
    }
}

/// Serves files from the app bundle's `web` folder under `flagquest://localhost/`, so ES modules
/// and fetch() work exactly like on a web server, fully offline.
final class BundleSchemeHandler: NSObject, WKURLSchemeHandler {
    static let scheme = "flagquest"
    static let startURL = URL(string: "\(scheme)://localhost/index.html")!

    private let root: URL = Bundle.main.resourceURL!
        .appendingPathComponent("web", isDirectory: true)
        .standardizedFileURL

    private static let mimeTypes = [
        "html": "text/html; charset=utf-8",
        "js": "text/javascript; charset=utf-8",
        "css": "text/css; charset=utf-8",
        "json": "application/json; charset=utf-8",
        "svg": "image/svg+xml",
        "png": "image/png",
        "ico": "image/x-icon",
        "woff2": "font/woff2",
    ]

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url else {
            urlSchemeTask.didFailWithError(URLError(.badURL))
            return
        }
        let path = url.path.isEmpty || url.path == "/" ? "index.html" : String(url.path.dropFirst())
        let fileURL = root.appendingPathComponent(path).standardizedFileURL

        // Only serve files inside the web folder.
        guard fileURL.path.hasPrefix(root.path + "/"), let data = try? Data(contentsOf: fileURL) else {
            respond(urlSchemeTask, url: url, status: 404, mimeType: "text/plain", data: Data())
            return
        }
        let mimeType = Self.mimeTypes[fileURL.pathExtension.lowercased()] ?? "application/octet-stream"
        respond(urlSchemeTask, url: url, status: 200, mimeType: mimeType, data: data)
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}

    private func respond(_ task: WKURLSchemeTask, url: URL, status: Int, mimeType: String, data: Data) {
        let headers = [
            "Content-Type": mimeType,
            "Content-Length": String(data.count),
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Origin": "*",
        ]
        guard let response = HTTPURLResponse(url: url, statusCode: status, httpVersion: "HTTP/1.1", headerFields: headers) else {
            task.didFailWithError(URLError(.cannotParseResponse))
            return
        }
        task.didReceive(response)
        task.didReceive(data)
        task.didFinish()
    }
}
