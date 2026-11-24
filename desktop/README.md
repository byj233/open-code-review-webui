# Open Code Review Desktop

Windows x64 desktop app with a bundled Go service and Electron shell. The NSIS
wizard includes branded artwork, an installation directory picker, shortcuts,
English / Simplified Chinese language selection, and launch after installation.

Requirements: Windows, Node.js 22+, Go (the version specified in `go.mod`), and
Git for repository operations. End users need Git but do not need Node.js or Go.

```powershell
npm --prefix frontend ci
npm --prefix desktop ci
npm --prefix desktop run dist
```

Output: `dist/desktop/OpenCodeReview-0.1.1-x64-Setup.exe`.
The unpacked application is in `dist/desktop/win-unpacked/`.
The installer is unsigned; release distribution should use a code-signing certificate.

```powershell
npm --prefix desktop test
npm --prefix desktop run build
npm --prefix desktop start
```

The service binds an OS-selected loopback port. The desktop reads its readiness
message before opening the window, uses the existing per-process API token, and
terminates the service process tree on exit. Renderer Node.js access is disabled.
The initial repository directory is the user's home; use the repository picker
to select a project. User configuration remains in the existing OCR location.

Installer copy is configured in `resources/installer.nsh`; artwork is in
`resources/sidebar.bmp`, `resources/header.bmp` and `resources/icon.ico`.

## Updates and releases

Installed builds check the public GitHub Releases feed on startup. Use
Application > Check for updates to check manually. Downloads require consent;
installation requires a separate restart confirmation. Choosing Later preserves
the downloaded update for the next manual check without restarting automatically.
The existing 0.1.0 build needs a manual upgrade to 0.1.1 to enable this feature.

Update files are hosted in `byj233/open-code-review-webui`. Keep `latest.yml`,
the matching `.exe`, and `.exe.blockmap` together in each published release.
The updater verifies download hashes. Code signature verification is disabled
until a Windows signing certificate is configured for the application.

For a subsequent release, update `desktop/package.json` and its lockfile to a
new version, commit, and push a matching `desktop-v<version>` tag. The Desktop
Release workflow builds on Windows and publishes the installer and metadata.
Manual workflow runs build downloadable artifacts without publishing a release.
