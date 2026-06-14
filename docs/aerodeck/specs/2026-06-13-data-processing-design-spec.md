# Design Specification: Tabular Data Processing Skill

**Date:** 2026-06-13  
**Status:** Approved  
**Topic:** `data-processing` Skill  

## Triggering Conditions

* **Name:** `data-processing`
* **Triggering Description:** Use when asked to process, clean, sanitize, summarize, or calculate statistics (sums, averages, counts, maximums) from tabular datasets (CSV, TSV, or Excel files).

## Core Phases & Workflow

### Phase 1: Dataset Auditing & Script Generation
Before performing any calculation or rendering tables, the assistant must inspect the target file and create a script:
1. **Metadata Inspection:** Check the file location, format (CSV/Excel), and read the first 3 lines (headers and sample row) to identify column names and data types.
2. **Write Parser Script:** Write a temporary Python script (saving it in `scratch/`) that imports the standard `csv` library. The script must:
   * **Sanitize Columns:** Trim whitespace, handle missing values (fill with `N/A` or `0`), and cast numeric strings to floats/ints.
   * **Compute Statistics:** Programmatically compute sums, averages, counts, or groupings using Python arithmetic.
   * **Print Results:** Print the sanitized data records and the computed summary statistics in a structured JSON string or plain text.

### Phase 2: Execution & Validation
The assistant executes the script and validates the output:
1. **Execute Script:** Run the temporary parser script using `run_command` in the terminal.
2. **Collect Output:** Capture the stdout containing the sanitized rows and the exact computed statistics.
3. **Delete Script:** Clean up the temporary parser script from the `scratch/` directory.

### Phase 3: Formatting & Presentation
The assistant presents the results to the user following these styling standards:
1. **BLUF Summary:** Highlight the key aggregate findings (e.g., *"Total Sales: $45,230 (Average of $1,250 per transaction)"*) at the very top of the response.
2. **Tabular Render:** Create a formatted Markdown table representing the records.
   * If the table is long (>20 rows), only display the top 10 and bottom 5 records, indicating that middle rows are truncated.
3. **Statistics Block:** Include a separate, styled summary block (e.g. using quotes or a bold list) displaying all calculated metrics (Sum, Mean, Min, Max, Count).
