# ScreenLook

> Give your AI coding agent eyes. Capture your device screen and feed it directly into your workflow.

ScreenLook captures screenshots from physical devices and emulators, then pipes them into your AI coding agent for visual feedback. Instead of the screenshot-to-chat dance, just say **"look at my screen"** and your agent sees it.

Works with Claude Code, Cursor, VS Code Copilot, Antigravity, and any MCP-compatible tool.

## Quick Start

```bash
npm install -g screenlook
screenlook setup
```

That's it. `setup` auto-detects your installed IDEs and configures ScreenLook for all of them. Restart your IDE and start talking.

Supports: **Claude Code**, **Cursor**, **VS Code (Copilot)**, **Antigravity**, and any MCP-compatible tool.

<details>
<summary>Manual setup (if you prefer)</summary>

#### Claude Code

```bash
claude mcp add screenlook -- screenlook-mcp
```

#### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "screenlook": {
      "command": "npx",
      "args": ["-y", "-p", "screenlook", "screenlook-mcp"]
    }
  }
}
```

#### VS Code (GitHub Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "screenlook": {
      "command": "npx",
      "args": ["-y", "-p", "screenlook", "screenlook-mcp"]
    }
  }
}
```

#### Antigravity

Add to `~/.gemini/antigravity/mcp_config.json` (macOS) or `%USERPROFILE%\.gemini\antigravity\mcp_config.json` (Windows):

```json
{
  "mcpServers": {
    "screenlook": {
      "command": "npx",
      "args": ["-y", "-p", "screenlook", "screenlook-mcp"]
    }
  }
}
```

#### Any MCP-Compatible Tool

```bash
npx -y -p screenlook screenlook-mcp
```

</details>

---

## Just Talk

Once installed, no commands to remember. Just talk in plain English:

```
You: "look at my screen"
Agent: *captures your phone screen* "I can see the login page. The button
       is overlapping the text field. Let me fix the styles..."

You: "is it fixed now?"
Agent: *captures again* "Yes, the button is properly spaced now."

You: "check both my phone and emulator"
Agent: *captures both devices* "Phone looks good. The emulator has a
       slight overflow on the card component, let me fix..."

You: "compare before and after, I'm changing the header"
Agent: *captures before, waits for hot reload, captures after*
       "The new blue header looks good but the white text is low contrast.
       Try #1E40AF instead."
```

## CLI (Alternative)

If you prefer commands over MCP:

```bash
npx screenlook look              # Capture screenshot
npx screenlook look --base64     # Output base64 (for piping)
npx screenlook devices           # List connected devices
npx screenlook watch             # Auto-capture on file changes
npx screenlook diff              # Before/after comparison
npx screenlook doctor            # Check prerequisites
```

## Supported Devices

| Device | Platform | How |
|--------|----------|-----|
| Android phone/tablet | Windows, macOS, Linux | USB + `adb` |
| Android emulator | Windows, macOS, Linux | `adb` (auto-detected) |
| iOS Simulator | macOS only | `xcrun simctl` |
| iOS physical | macOS only | `xcrun devicectl` |

## Prerequisites

- **Android:** [Android SDK Platform Tools](https://developer.android.com/tools/releases/platform-tools) — `adb` must be in your PATH
- **iOS Simulator:** Xcode installed (macOS only)
- **iOS Physical:** Xcode 15+ with device paired/trusted (macOS only)

Run `screenlook doctor` to verify your setup.

## How It Works

1. Detects connected devices via `adb` / `xcrun`
2. Captures the current screen (streams directly, no temp files on Android)
3. Optimizes the image (resizes to 1280px, compresses to ~300KB JPEG)
4. Returns it to your agent — it literally sees your screen

No cloud. No API keys. Everything runs locally.

## License

MIT
