---
name: transcript-processing
description: Clean, transcribe, summarize, and extract custom sections and action items from audio, video, text, or JSON files with context checks and Gemini Batch API support.
---
# Transcript Processing

Use this skill to guide the cleaning, transcription, summarization, and action-item extraction from raw transcripts, call logs, audio, or video files.

## Workflow

### Phase 1: Auditing/Conversion
Before transcribing or summarizing, check input parameters and extract audio if necessary:
1. **File Type Detection:** Check the file extension.
   * If it is a text-based format (e.g. `.txt`, `.json`, `.md`), load and sanitize it directly by removing system headers or empty lines.
   * If it is a video (e.g. `.mp4`, `.mkv`, `.avi`) or audio (e.g. `.mp3`, `.m4a`, `.wav`) format, use `ffmpeg` to extract/normalize the audio to a standard mono WAV file at 16kHz.
2. **Standard WAV Extraction Command:**
   `ffmpeg -y -i <input_file> -vn -acodec pcm_s16le -ar 16000 -ac 1 <output_wav>`

### Phase 2: Context Verification/Transcription Selection
Verify transcription settings and protect the context window:
1. **Transcription Selection:** The user can specify the transcription method:
   * **whisper:** Executes local Whisper command or Python package to convert the extracted WAV to text.
   * **api:** Routes the audio to the model-router or uploads it to Gemini's File API to perform transcription.
2. **Context Verification:** Before calling the summarization LLM:
   * Estimate the token/character length of the transcript.
   * Compare it against the target model's limits (e.g., Kimi `moonshot-v1-128k` at 128k tokens, Gemini at 1M-2M tokens).
   * If the transcript exceeds 90% of the target model's limit, halt and warn the user.

### Phase 3: Summarization/Batch Execution
Process the transcript to generate standard and custom sections:
1. **Batch Mode Check:** If `--batch-mode` is `true`, submit the summarization request via the Gemini Batch Processing API. Otherwise, execute a synchronous request via the model-router.
2. **Prompt Construction:** Instructions to summarize must request:
   * **BLUF Summary:** High-level 2-3 sentence overview at the top.
   * **Custom Sections:** Headers dynamically added based on user-supplied options (e.g., "Attendees", "Technical Decisions", "Unresolved Questions").
   * **Action Items Table:** Standard Markdown table with columns: `Task ID`, `Description`, `Assignee`, `Deadline`, `Priority`.
