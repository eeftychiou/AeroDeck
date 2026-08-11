---
name: background-task-scheduling
description: Use when scheduling background timers, monitoring long-running processes, setting up recurring cron jobs, or handling reactive notifications using the native Antigravity schedule tool
---

# Background Task Scheduling & Monitoring

This skill provides guidelines and operational patterns for scheduling background timers, monitoring long-running processes, setting up recurring cron jobs, and handling background notification wakeups in **Antigravity 2.0**.

## Tool Primitive: `schedule`

Antigravity 2.0 provides a native background timer tool (`schedule`). It supports two primary modes:

### 1. One-Shot Timers (`DurationSeconds`)
Sets a single notification timer that fires after a specified duration in seconds.

**Timer Conditions (`TimerCondition`):**
- `'never'` (default): Unconditional timer; fires after `DurationSeconds` unless explicitly cancelled.
- `'any'`: Cancels early if ANY message is received from any subagent or background task before duration.
- `<sender-id>`: Cancels early if a message is received from that specific subagent conversation ID or task ID.

**Example Use Cases:**
- *Checking background task progress:* `DurationSeconds=600`, `TimerCondition="task-123"`, `Prompt="Check on background command status"`
- *Reminding user:* `DurationSeconds=1800`, `TimerCondition="never"`, `Prompt="Send status report to user"`

### 2. Recurring Cron Schedules (`CronExpression`)
Sets a recurring background schedule using a standard 5-field cron expression (e.g. `*/5 * * * *` for every 5 minutes).

**Daemon Flag (`IsDaemon`):**
- `IsDaemon=false` (default): Cron schedule is part of finishing the current task (e.g. polling a job until complete). The task remains active.
- `IsDaemon=true`: Cron schedule is an independent standing job that should continue running after current task finishes (e.g. daily report generation).

---

## Workflow Rules

1. **Never use `sleep` shell commands**: Do NOT invoke `run_command` with `sleep 300` or `Start-Sleep`. Always use the native `schedule` tool.
2. **Immediate Return**: The `schedule` tool call returns immediately. After calling `schedule`, proceed with other work or stop calling tools to end your turn.
3. **Reactive Wakeup**: The system automatically resumes your context when the timer expires or when a background notification arrives. Do NOT poll in a loop.
4. **Cancel When Complete**: When a background job or subagent task completes early, use `manage_task` with action `kill` to cancel obsolete timers.
