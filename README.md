# ScreenLook

> Give Claude Code eyes. Capture your device screen and feed it directly into your AI coding workflow.

ScreenLook captures screenshots from physical devices and emulators, then pipes them into Claude Code for visual feedback. Instead of the screenshot-to-chat dance, just say **"look at my screen"** and Claude Code sees it.

## Quick Start

### CLI (instant, no setup)

```bash
npx screenlook look              # Capture screenshot
npx screenlook devices           # List devices
npx screenlook doctor            # Check prerequisites
```

### MCP (native Claude Code integration)

```bash
npm install -g screenlook
claude mcp add screenlook -- screenlook-mcp
```

Now in Claude Code, just say:
- "look at my screen" — Claude captures and sees it
- "what's wrong with this layout?" — Claude captures, analyzes, fixes

## Commands

| Command | Description |
|---------|-------------|
| `screenlook look` | Capture screenshot, save to `./screenshots/` |
| `screenlook look --base64` | Output base64-encoded image (for piping) |
| `screenlook look --device <id>` | Target specific device |
| `screenlook devices` | List all connected devices |
| `screenlook watch` | Auto-capture on file changes |
| `screenlook diff` | Before/after screenshot comparison |
| `screenlook doctor` | Check prerequisites and system status |

## MCP Tools

| Tool | Description |
|------|-------------|
| `screenlook_capture` | Capture current device screen |
| `screenlook_devices` | List connected devices |
| `screenlook_diff` | Before/after screenshot comparison |
| `screenlook_doctor` | Check system prerequisites |

## Supported Devices

- **Android** (physical + emulator) via `adb`
- **iOS Simulator** via `xcrun simctl` (macOS only)
- **iOS Physical** via `xcrun devicectl` / `idevicescreenshot` (macOS only)

## Prerequisites

Run `screenlook doctor` to check your setup.

- **Android:** [Android SDK Platform Tools](https://developer.android.com/tools/releases/platform-tools) (`adb` in PATH)
- **iOS Simulator:** Xcode installed (macOS only)
- **iOS Physical:** Xcode 15+ with device paired/trusted (macOS only)

## License

MIT
