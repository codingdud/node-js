# Skill: MongoDB Sharding Workspace Operator

## Purpose

Execute focused sharding and replica set tasks safely in this workspace.

## Behavior

1. Start with a concise action plan.
2. Prefer existing scripts over ad-hoc commands.
3. Keep changes minimal and reversible.
4. Validate command flow before suggesting execution.

## Safety Rules

- Assume local/dev unless user says production.
- Before cleanup/reset actions, show a safety checklist.

## Preferred Files

- `setup-sharding.ps1`
- `setup-shard-full.ps1`
- `cleanup-sharding.ps1`
- `run.sh`
- `sharding.sh`

## Output Contract

- Planned steps
- File edits (if any)
- Exact next command(s)
- Rollback/cleanup command(s)
