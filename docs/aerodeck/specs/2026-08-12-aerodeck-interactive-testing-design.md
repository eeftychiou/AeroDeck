# AeroDeck Interactive Testing Design

## Overview
We will interactively test every feature of AeroDeck using a component-by-component approach. This involves running small, isolated tasks to validate each skill and feature independently.

## Testing Phases

### Phase 1: Core Workflow Engine
Validate the fundamental planning and execution loops.
- **Brainstorming & Planning**: Trigger `brainstorming` and `writing-plans` with a dummy task.
- **Isolated Workspaces**: Test `using-isolated-workspaces` by branching the workspace.
- **Subagent Pipelines & Model Router**: Use `subagent-driven-task-pipeline` to dispatch a worker and reviewer subagent. Systematically test the **Model Router** and validate **session memory** to ensure the model maintains context memory to carry out multistep tasks.
- **Execution & Completion**: Run `executing-plans` and `completing-a-task-pipeline` to simulate task delivery.
- **Scheduling & Fallback**: Test `background-task-scheduling` with a timer and `resilient-model-fallback` using a simulated failure.

### Phase 2: QA & Delivery Refinement
Validate the review and refinement processes.
- **Criteria-Driven Refinement**: Execute a Red-Green-Refactor loop on a dummy file.
- **Review Loop**: Request a task review (`requesting-task-review`), receive feedback (`receiving-task-review`), and verify delivery (`verification-before-delivery`).

### Phase 3: Problem Solving
Validate diagnostic capabilities.
- **Systematic Problem Solving**: Introduce a logic or missing file/data error and follow the 4-phase root-cause investigation. (Aerodeck operates as a general assistant, rather than a purely coding agent).
- **Parallel Dispatch**: Use `dispatching-parallel-tasks` to run two isolated background scripts concurrently.

### Phase 4: Operations & Automation
Validate specialized MCP and script integrations.
- **Research & Synthesis**: Perform `systematic-research` and `document-synthesis` on a given topic.
- **Data Processing**: Create a mock CSV and run `data-processing`.
- **Web Navigation**: Use `browser-automation` via `web-navigation-workflow`. Test **form completion and password authentication**. The tests will explicitly trigger both headless and non-headless modes to allow authentication.
- **Google Drive Integration**: Test the `google-drive` MCP server. Ensure the system is able to use Google Drive for systematic research based on provided instructions, including querying the user's internal database.
- **Email/Outlook**: Test the `outlook-mail-research` capability to ensure the Outlook archive can be searched and used for research (e.g. querying terms such as "ICAO Assembly"). *Note: We will verify if the local environment permits this, and inform the user if any setup is required to address it.*

### Phase 5: Skill Meta
Validate the skill creation and usage framework.
- **Using Aerodeck**: Ensure this skill correctly gates actions.
- **Writing Skills**: Use `writing-skills` to draft a mock skill and verify its behavior.

## Verification Methods
- **Artifact & Tool Validation**: Each phase will be verified by observing the agent's adherence to the checklist, successful tool invocations (e.g., `invoke_subagent`, `browser-automation`), and the correct generation of expected artifacts/files.
- **Log Checking**: We will check the generated logs for each component (utilizing the new explicit metadata headers and logging functionality). **Logging must be enabled at the debugging level** throughout the testing process.
