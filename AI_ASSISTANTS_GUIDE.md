# AI Coding Assistants Setup Guide (DeepSeek V4 Pro)

This project heavily leverages **DeepSeek V4 Pro** for telemetry and AI operations. To ensure a seamless developer experience, you can point popular terminal-based AI coding assistants (like Claude Code, OpenCode, and OpenClaw) directly to the DeepSeek API.

This ensures that the AI agents have the same high-level reasoning capabilities (DeepSeek V4 Pro) that power the CEO Dashboard.

---

## 1. Automated Setup (Windows Recommended)

For Windows users, we have created a bootstrap script that automatically extracts your `DEEPSEEK_API_KEY` from `.env.local` and injects the required environment variables into your active PowerShell session.

**Run this in your terminal:**
```powershell
.\scripts\setup-deepseek-agents.ps1
```

Once executed, you can immediately type `claude` or `opencode` in that terminal window and it will use DeepSeek.

---

## 2. Manual Configuration

If you prefer to configure your environment variables manually, use the commands below based on your operating system.

### Windows (PowerShell)
```powershell
$env:ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="<your DeepSeek API Key>"
$env:ANTHROPIC_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL="deepseek-v4-flash"
$env:CLAUDE_CODE_SUBAGENT_MODEL="deepseek-v4-flash"
$env:CLAUDE_CODE_EFFORT_LEVEL="max"
```

### Linux / macOS
```bash
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
export ANTHROPIC_AUTH_TOKEN="<your DeepSeek API Key>"
export ANTHROPIC_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_OPUS_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_SONNET_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_HAIKU_MODEL=deepseek-v4-flash
export CLAUDE_CODE_SUBAGENT_MODEL=deepseek-v4-flash
export CLAUDE_CODE_EFFORT_LEVEL=max
```

---

## 3. Installing the Agents

If you do not already have the agents installed, follow these instructions.

### Claude Code
1. Install Node.js 18+
2. Run `npm install -g @anthropic-ai/claude-code`
3. Verify with `claude --version`
4. Launch with `claude`

### OpenCode
1. Download from the [OpenCode release page](https://github.com/opencode).
2. Ensure version is >= v1.14.24.
3. Run `opencode`. Type `/connect`, select `deepseek`, and input your API key.

### OpenClaw
1. Windows Install: `iwr -useb https://openclaw.ai/install.ps1 | iex`
2. Mac/Linux Install: `curl -fsSL https://openclaw.ai/install.sh | bash`
3. When prompted during setup, select `DeepSeek` as the provider and `deepseek-v4-pro` as the default model.
4. Launch with `openclaw terminal` or `openclaw dashboard`.
