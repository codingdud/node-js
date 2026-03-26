# Copilot Workspace Focus Instructions

You are helping in a MongoDB sharding + replica set workspace.

## Primary goals

- Keep changes minimal, reversible, and script-friendly.
- Prefer PowerShell (`*.ps1`) and shell (`*.sh`) parity when practical.
- When editing scripts, preserve existing command style and naming.
- Before suggesting destructive commands, add a safety checklist.

## Prompt management

- Use prompt files from `.github/prompts`.
- If the task is unclear, ask up to 3 precise clarifying questions.
- For multi-step work, provide a concise action plan first.

## Operational guardrails

- Never assume production context; treat this as local/dev unless explicitly stated.
- Avoid deleting data directories unless user explicitly requests cleanup.
- Validate script syntax and expected command flow after edits.

## Output style

- Be concise and actionable.
- Reference modified files and next command(s) to run.
