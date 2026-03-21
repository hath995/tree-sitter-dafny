// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterDafny",
    products: [
        .library(name: "TreeSitterDafny", targets: ["TreeSitterDafny"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterDafny",
            dependencies: [],
            path: ".",
            sources: [
                "src/parser.c",
                // NOTE: if your language has an external scanner, add it here.
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterDafnyTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterDafny",
            ],
            path: "bindings/swift/TreeSitterDafnyTests"
        )
    ],
    cLanguageStandard: .c11
)
