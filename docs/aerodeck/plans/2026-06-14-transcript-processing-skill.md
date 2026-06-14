# Transcript Processing Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use aerodeck:subagent-driven-task-pipeline (recommended) or aerodeck:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the `transcript-processing` skill in AeroDeck to clean, transcribe, summarize, and extract custom sections and action items from audio, video, text, or JSON files with context checks and Gemini Batch API support.

**Architecture/Workflow:** The skill uses a script-first design where the agent writes a temporary Python script in `scratch/` to handle media checking, conversion via `ffmpeg`, transcription selection, token limit verification, and Gemini/model-router summarization.

**Tech Stack/Tools:** Python 3, `ffmpeg` (system-level), Google GenAI SDK or model-router server, AeroDeck plugins folder.

---

### Task 1: Setup Baseline Files & RED Verification Check

**Targets:**
- Create: `scratch/test-transcript.txt`
- Create: `scratch/test-verification.py`

- [ ] **Step 1: Write/Define success criteria**
  Create `scratch/test-transcript.txt` with mock meeting transcript text and `scratch/test-verification.py` containing a script that checks for the transcript processing result structure (BLUF, Custom Sections, and Action Items table).
  
- [ ] **Step 2: Verify current state fails/lacks criteria**
  Run: `python scratch/test-verification.py`
  Expected: FAIL (The skill files do not exist, and no transcript processing script has been run)

- [ ] **Step 3: Perform minimal implementation / worker action**
  Write mock test transcript file and a verification script:
  `scratch/test-transcript.txt`:
  ```text
  [00:01:00] Alice: Let's assign Bob to draft the API spec by next Tuesday.
  [00:01:30] Bob: Sure, I will do that.
  ```

  `scratch/test-verification.py`:
  ```python
  import os
  import sys

  if not os.path.exists("skills/transcript-processing/SKILL.md"):
      print("RED Check passed: Skill file does not exist yet")
      sys.exit(0)
  else:
      print("Error: Skill file already exists")
      sys.exit(1)
  ```

- [ ] **Step 4: Verify state passes criteria**
  Run: `python scratch/test-verification.py`
  Expected: PASS (Prints "RED Check passed")

- [ ] **Step 5: Save/Checkpoint**
  Verify files are staged or saved in the `scratch/` folder.

---

### Task 2: Implement Transcript Processing Skill File

**Targets:**
- Create: `skills/transcript-processing/SKILL.md`

- [ ] **Step 1: Write/Define success criteria**
  The skill file must define the exact three-phase workflow (Auditing/Conversion, Context Verification/Transcription Selection, and Summarization/Batch Execution).

- [ ] **Step 2: Verify current state fails**
  Check if `skills/transcript-processing/SKILL.md` exists.
  Expected: FAIL (File missing)

- [ ] **Step 3: Perform minimal implementation / worker action**
  Create `skills/transcript-processing/SKILL.md` with:
  ```markdown
  ---
  name: transcript-processing
  description: Clean, transcribe, summarize, and extract custom sections and action items from audio, video, text, or JSON files with context checks and Gemini Batch API support.
  ---
  # Transcript Processing

  ## Workflow

  ### Phase 1: Media Conversion & Parsing
  * Detect input type. If video/audio, convert/extract audio to 16kHz mono WAV using `ffmpeg`.
  * If text/JSON, sanitize/clean transcript formatting.

  ### Phase 2: Transcription & Context Limits
  * Choose between local Whisper or API-based transcription.
  * Count character/token length. If length exceeds active model context limit, warn and halt.

  ### Phase 3: Summarization & Batch Execution
  * Request summary via model-router or Gemini Batch API.
  * Output: BLUF overview, custom-requested headers, and structured Action Items table.
  ```

- [ ] **Step 4: Verify state passes criteria**
  Verify file `skills/transcript-processing/SKILL.md` exists and is formatted correctly.
  Expected: PASS

- [ ] **Step 5: Save/Checkpoint**
  Save the file.

---

### Task 3: Create Integration Python Script & GREEN Verification

**Targets:**
- Create: `scratch/transcript_processor.py`
- Modify: `scratch/test-verification.py`

- [ ] **Step 1: Write/Define success criteria**
  The script `scratch/transcript_processor.py` must support `--input-file`, `--transcribe-method`, `--summary-model`, `--custom-sections`, and `--batch-mode`.
  Update `scratch/test-verification.py` to run the processor script on `scratch/test-transcript.txt` and verify that the output format has BLUF, custom sections, and action items.

- [ ] **Step 2: Verify current state fails**
  Run: `python scratch/test-verification.py` (updated to verify green success criteria)
  Expected: FAIL (Python processor script does not exist)

- [ ] **Step 3: Perform minimal implementation / worker action**
  Write the Python script `scratch/transcript_processor.py` to handle files, context check, and call the model-router tool `route_task`.
  Write the verification script to run it and inspect the outputs.

- [ ] **Step 4: Verify state passes criteria**
  Run: `python scratch/test-verification.py`
  Expected: PASS (Successfully processes test transcript and outputs expected formats)

- [ ] **Step 5: Save/Checkpoint**
  Clean up temporary files in `scratch/`.
