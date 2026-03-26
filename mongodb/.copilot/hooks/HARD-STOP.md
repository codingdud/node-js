# Hard Stop Hook Policy

Use this checklist before destructive or environment-reset operations.

## Trigger Conditions

- Commands containing `cleanup`, `drop`, `rm`, `remove`, `wipe`, or `reset`
- Any edit targeting data folders (`mongo-data/`, `mongo1/`, `mongo2/`)

## Enforcement

Require all of the following before continuing:

1. Explicit user confirmation in current chat turn.
2. Safety checklist printed and acknowledged.
3. Rollback note included (or "not possible" stated clearly).

## Safety Checklist

- Confirm environment is local/dev.
- Confirm exact targets (folders, DBs, collections).
- Confirm backup/snapshot need.
- Confirm restart/reseed command path.
