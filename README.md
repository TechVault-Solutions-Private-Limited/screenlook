# ScreenLook

> Give Claude Code eyes. Capture your device screen and feed it directly into your AI coding workflow.

ScreenLook captures screenshots from physical devices and emulators, then pipes them into Claude Code for visual feedback. Instead of the screenshot-to-chat dance, just say **"look at my screen"** and Claude Code sees it.

## Quick Start (MCP — Recommended)

The best way to use ScreenLook is as an MCP server. No commands to remember — just talk to Claude in plain English.

```bash
# Install
npm install -g screenlook

# Register with Claude Code
claude mcp add screenlook -- screenlook-mcp

# Restart Claude Code — done!
```

### Just talk:

```
You: "look at my screen"
Claude: *captures your phone screen* "I can see the login page. The button
        is overlapping the text field. Let me fix the styles..."

You: "is it fixed now?"
Claude: *captures again* "Yes, the button is properly spaced now."

You: "check both my phone and emulator"
Claude: *captures both devices* "Phone looks good. The emulator has a
        slight overflow on the card component, let me fix..."

You: "compare before and after, I'm changing the header"
Claude: *captures before, waits for hot reload, captures after*
        "The new blue header looks good but the white text is low contrast.
        Try #1E40AF instead."
```

No special syntax. No commands. Just describe what you want.

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

1. ScreenLook detects connected devices via `adb` / `xcrun`
2. Captures the current screen (streams directly, no temp files on Android)
3. Optimizes the image (resizes to 1280px, compresses to ~300KB JPEG)
4. Returns it to Claude Code — Claude literally sees your screen

No cloud. No API keys. Everything runs locally.

## License

MIT
