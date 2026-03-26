# Workspace Focus: Prompt Management + MCP + Skills + Hooks + Tool Sets

This workspace includes a practical scaffold to manage Copilot prompts and tools in a focused way.

## What Was Added

- Prompt management: `.github/prompts/workspace-focus.prompt.md`
- Workspace instructions: `.github/copilot-instructions.md`
- MCP template config: `.vscode/mcp.json`
- Skill: `.copilot/skills/mongodb-sharding/SKILL.md`
- Hooks: `.copilot/hooks/HARD-STOP.md`, `.copilot/hooks/preflight-focus.ps1`
- Tool sets: `.copilot/toolsets/toolsets.json`
- VS Code task: `.vscode/tasks.json` (`Workspace Focus: Preflight`)

## How To Use

1. In Copilot Chat, open **Configure Tools** and pick tools matching your current task.
2. Use the workspace prompt in `.github/prompts/workspace-focus.prompt.md` as your session starter.
3. Enable MCP servers from `.vscode/mcp.json` (install extensions/servers as needed).
4. Apply the skill behavior from `.copilot/skills/mongodb-sharding/SKILL.md` for sharding tasks.
5. For destructive operations, enforce `.copilot/hooks/HARD-STOP.md`.

## Preflight Command

Run this before high-risk or multi-step sessions:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .copilot/hooks/preflight-focus.ps1
```

Or run VS Code task: `Workspace Focus: Preflight`.

## MCP Environment Variables

Set these if using the MCP templates:

- `GITHUB_TOKEN`
- `MONGODB_URI`

## Notes

- The `toolsets.json` file is a workspace convention file to organize preferred tool combinations.
- If your extension expects a different schema, keep the IDs/concepts and map them in extension settings.
