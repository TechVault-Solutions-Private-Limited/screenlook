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

Once installed, no commands to remember. Just describe what you see or what you want — in plain English.

### Fix UI bugs without describing them

> **You:** "look at my screen, the login button is behind the keyboard"
>
> **Agent:** *captures screen* "I see it — the button isn't in a ScrollView so it gets hidden when the keyboard opens. Fixing..."

### Change styles visually

> **You:** "check my phone — make the header red and the font bigger"
>
> **Agent:** *captures screen* "Got it. The header is currently #3B82F6 (blue) with 16px font. Changing to red and bumping to 20px..."
>
> **You:** "look again"
>
> **Agent:** *captures screen* "Done — red header with larger font looks good. Want me to adjust the shade?"

### Debug layout issues

> **You:** "the card component looks weird on my phone, can you see it?"
>
> **Agent:** *captures screen* "I can see the issue — the card is overflowing off the right edge. The padding is 24px but the card width is set to 100vw. Changing to 100%..."

### Compare before and after

> **You:** "I'm about to change the nav bar, compare before and after"
>
> **Agent:** *captures before, waits for hot reload, captures after*
> "The new bottom nav looks cleaner. But the icons are slightly misaligned — the home icon is 2px lower than the others. Let me fix..."

### Test across devices

> **You:** "does it look right on both my phone and the emulator?"
>
> **Agent:** *captures both* "Pixel 7 looks perfect. On the emulator the text is clipping on smaller screen — adding `numberOfLines` prop to fix..."

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
| iOS Simulator | macOS only | `xcrun simctl` (requires Xcode) |
| iOS physical | macOS only | `pymobiledevice3` (no Xcode needed) |

## Prerequisites

- **Android:** [Android SDK Platform Tools](https://developer.android.com/tools/releases/platform-tools) — `adb` must be in your PATH
- **iOS Simulator:** Xcode required (macOS only)
- **iOS Physical:** No Xcode needed — uses `pymobiledevice3` (see below)

### iOS Physical Device (iOS 17+)

Apple removed the legacy screenshot service in iOS 17. You need `pymobiledevice3` which uses Apple's CoreDevice protocol:

```bash
# Install
pip3 install pymobiledevice3

# Start the tunnel in the background (requires sudo)
sudo pymobiledevice3 remote tunneld --protocol tcp --daemonize
```

Once the tunnel is running, screenlook captures work automatically — just say "look at my screen".

> **Why sudo and tcp?** Apple's CoreDevice protocol requires creating a virtual network interface (TUN/TAP), which needs root privileges. Using `--protocol tcp` ensures that standard users on macOS can connect to the tunnel, bypassing strict certificate restrictions of the default QUIC protocol. The tunnel runs locally — no data leaves your machine.

Run `screenlook doctor` to verify your setup.

## How It Works

1. Detects connected devices via `adb` / `xcrun`
2. Captures the current screen (streams directly, no temp files on Android)
3. Optimizes the image (resizes to 1280px, compresses to ~300KB JPEG)
4. Returns it to your agent — it literally sees your screen

No cloud. No API keys. Everything runs locally.

## License

MIT
