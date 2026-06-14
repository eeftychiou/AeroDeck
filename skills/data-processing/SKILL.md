---
name: data-processing
description: Use when asked to process, clean, sanitize, summarize, or calculate statistics (sums, averages, counts, maximums) from tabular datasets (CSV, TSV, or Excel files).
---
# Tabular Data Processing

Use this skill to guide the cleaning, sanitization, and programmatic analysis of flat tabular datasets (CSV/TSV/Excel).

## Workflow

### Phase 1: Dataset Auditing & Script Generation
Before performing any calculation, check file parameters and write a local parser script:
1. **Metadata Inspection:** Read the first 3 lines (headers and sample row) to identify column names and types.
2. **Write Parser Script:** Write a temporary Python script (in the `scratch/` folder) that imports the standard `csv` library. The script must:
   * **Sanitize Columns:** Trim whitespace, handle missing values (fill with `N/A` or `0`), and cast values.
   * **Compute Statistics:** Programmatically compute sums, averages, counts, or groupings using Python math.
   * **Print Results:** Print the sanitized data records and computed statistics in a structured JSON or plain text format.

### Phase 2: Execution & Validation
1. **Execute Script:** Run the temporary parser script using `run_command`.
2. **Collect Output:** Capture the stdout containing the sanitized rows and exact computed statistics.
3. **Delete Script:** Clean up the parser script from the `scratch/` directory.

### Phase 3: Formatting & Presentation
Present results to the user following these styling standards:
1. **BLUF Summary:** Highlight key aggregate findings (e.g., *"Total Sales: $X (Average of $Y per transaction)"*) at the top of the response.
2. **Tabular Render:** Create a formatted Markdown table representing the records.
   * If the table is long (>20 rows), only display the top 10 and bottom 5 records, indicating that middle rows are truncated.
3. **Statistics Block:** Include a separate, styled summary block (e.g. quotes or bold list) displaying all calculated metrics (Sum, Mean, Min, Max, Count).
