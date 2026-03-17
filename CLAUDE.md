# CLAUDE.md — ScreenLook

## Project Overview
ScreenLook is a developer tool that captures device/emulator screenshots and feeds them to Claude Code.
It ships as both a CLI (`npx screenlook`) and an MCP server (`screenlook-mcp`).

**Spec:** `screenlook-spec.md`

## Workflow Rules

### Plan First, Build Second
- ALWAYS enter plan mode before starting any non-trivial implementation
- Use the brainstorming skill before any creative/feature work
- Read the spec section relevant to whatever you're building before writing code
- Explore existing code thoroughly before proposing changes

### No Over-Engineering
- Do NOT add features, abstractions, or "improvements" beyond what's requested
- Three similar lines > a premature abstraction
- No speculative generality — build for current requirements, not hypothetical futures
- No unnecessary error handling for impossible scenarios
- No feature flags unless explicitly requested
- If the user asks for X, deliver X — not X + Y + Z

### Code Quality
- Keep functions small and focused (single responsibility)
- Prefer composition over inheritance
- Write self-documenting code; only add comments for non-obvious "why" decisions
- Don't add docstrings/comments/type annotations to code you didn't change

## Tech Stack
- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js >= 18
- **Build:** tsup (for dual ESM/CJS output)
- **MCP SDK:** @modelcontextprotocol/sdk
- **CLI Framework:** commander
- **Image Processing:** sharp (resize/compress before sending to Claude)
- **Testing:** vitest
- **Linting:** eslint + prettier

## Architecture Principles
1. **Core is shared** — All capture logic lives in `src/core/`. Both CLI and MCP import from here.
2. **Zero config by default** — Auto-detect connected devices, pick the right capture method.
3. **Fail gracefully** — Missing `adb`? Say so clearly. No device? List what's needed.
4. **Fast captures** — Use `adb exec-out` (streams directly, no temp file on device). Compress images before returning.
5. **MCP-safe logging** — Never write to stdout in MCP mode (breaks JSON-RPC). Use stderr for all logs.

## Device Capture Methods

### Android (Physical + Emulator)
- **Detection:** `adb devices` — parse output for device serials
- **Capture:** `adb exec-out screencap -p` — streams PNG to stdout, no temp file
- **Multiple devices:** Use `adb -s <serial>` to target specific device
- **Emulator vs Physical:** Both use same adb commands, differentiated by serial format
  - Emulators: `emulator-5554`, `emulator-5556`, etc.
  - Physical: alphanumeric serial like `R5CT32XXXXX`

### iOS Simulator
- **Detection:** `xcrun simctl list devices booted --json` — lists running simulators
- **Capture:** `xcrun simctl io <device-udid> screenshot <path>.png`
- **Note:** Only works on macOS with Xcode installed

### iOS Physical Device (iOS 17+)
- **Requires:** `sudo pymobiledevice3 remote tunneld --protocol tcp --daemonize` running in background
  - Creates CoreDevice TCP tunnel (needs sudo for TUN/TAP interface)
  - Must stay running while using screenlook
- **Capture:** `pymobiledevice3 developer dvt screenshot <path> --tunnel <udid>`
  - Tries `pymobiledevice3` binary, then `python3 -m pymobiledevice3`, then `/opt/homebrew/bin/python3 -m pymobiledevice3`
- **Fallback:** `idevicescreenshot` for pre-iOS 17 devices
- **Note:** `xcrun devicectl` does NOT have a screenshot subcommand
- **Note:** `idevicescreenshot` is broken for iOS 17+ (Apple removed `screenshotr` service)

## Commands & Tools

### CLI Commands
| Command | Description |
|---------|-------------|
| `screenlook look` | Capture screenshot, save to `./screenshots/`, print path + metadata |
| `screenlook look --base64` | Output base64-encoded image (for piping to Claude Code) |
| `screenlook look --device <serial>` | Target specific device |
| `screenlook devices` | List all connected devices with type/status |
| `screenlook watch` | Watch for file changes, auto-capture on save (pairs with hot reload) |
| `screenlook diff` | Capture two screenshots with a prompt between, output side-by-side |
| `screenlook doctor` | Check prerequisites (adb, xcrun, etc.) and report status |

### MCP Tools
| Tool | Description | Parameters |
|------|-------------|------------|
| `screenlook_capture` | Capture current device screen | `device_id?: string` |
| `screenlook_devices` | List connected devices | — |
| `screenlook_diff` | Capture before/after screenshots | `device_id?: string, wait_seconds?: number` |
| `screenlook_doctor` | Check system prerequisites | — |

## Code Style & Conventions
- Use `async/await` everywhere, no callbacks
- All shell commands via `child_process.execFile` (not `exec` — avoids shell injection)
- Timeout all device commands at 10 seconds
- Type-safe device detection — use discriminated unions for device types
- Error messages should always suggest a fix
- TypeScript: `kebab-case.ts` for files
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Never force push to main

### Image Optimization Pipeline
1. Read raw screenshot (PNG from device, often 5-15MB)
2. Resize to max 1280px on longest side (preserves aspect ratio)
3. Convert to JPEG at quality 80 (reduces to ~200-400KB)
4. Encode as base64 for MCP response

### Device Detection Priority
1. Check for single connected device → use it
2. Multiple devices → prompt user (CLI) or return list (MCP)
3. No devices → clear error with setup instructions

## Testing Strategy
- Unit tests for device detection parsing (mock adb/xcrun output)
- Unit tests for image optimization pipeline
- Integration tests with mock device connections
- Tests in `test/` directory mirroring `src/` structure

## Dependencies
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.x",
    "commander": "^12.x",
    "sharp": "^0.33.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "tsup": "^8.x",
    "typescript": "^5.x",
    "vitest": "^2.x",
    "eslint": "^9.x",
    "prettier": "^3.x"
  }
}
```

## Skill Usage
- `/brainstorming` — Before any new feature or creative decision
- `/mcp-builder` — For MCP server implementation guidance
- `/find-skills` — To discover additional skills as needed

## Key Decisions Log
| Date | Decision | Context |
|------|----------|---------|
| 2026-03-16 | Project initialized | Spec defined, CLAUDE.md created |
