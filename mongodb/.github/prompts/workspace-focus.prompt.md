# Workspace Focus: MongoDB Operations

Use this prompt when you want Copilot to stay tightly scoped.

## Intent

Plan and execute a focused change in this MongoDB workspace with minimal risk.

## Inputs

- Objective: `${input:objective}`
- Affected files (optional): `${input:files}`
- Risk level: `${input:risk}`

## Instructions for Copilot

1. Summarize objective in one sentence.
2. Propose a short step-by-step plan.
3. Apply only necessary edits.
4. Validate with targeted commands/tests.
5. Return changed files + run/rollback commands.

## Constraints

- Do not introduce unrelated refactors.
- Prefer existing scripts (`setup-sharding.ps1`, `cleanup-sharding.ps1`, etc.).
- If commands are destructive, require explicit confirmation.
