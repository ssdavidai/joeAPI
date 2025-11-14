# JoeAPI Evaluation System Summary

## What We Built

A comprehensive evaluation system for testing the 18 fully-functional MCP workflow prompts.

## Components

### 1. Workflow Step Extraction (`extract-workflow-steps.js`)

- Parses `mcp/index.ts` GetPromptRequestSchema handler
- Extracts all workflow cases and their STEP instructions
- Outputs `workflow-steps.json` with structured step data
- **Run:** `node eval/extract-workflow-steps.js`

### 2. Test Prompts (`test-prompts.json`)

- 5 realistic human prompts per workflow (90 total prompts)
- Mimics real user requests (often vague, missing context)
- Examples:
  - "show me all the jobs we're working on right now"
  - "how much are we over budget on the Smith project?"
  - "what action items are overdue?"

### 3. Evaluation Runner (`run-evals.ts`)

Full TypeScript evaluation framework that:

1. **Loads workflow steps** from workflow-steps.json
2. **Loads test prompts** from test-prompts.json
3. **Runs each workflow N times** (default: 10) with random prompts
4. **Calls your endpoint** (you define this)
5. **Extracts tool calls** from response traces
6. **Compares actual vs expected** steps
7. **Calculates accuracy** (% of steps completed)
8. **Generates reports:**
   - Per-task JSON with all runs
   - Per-task CSV with step-by-step results
   - Heatmap JSON (18 columns x N rows)
   - Heatmap CSV for visualization

**Run:** `npx tsx eval/run-evals.ts`

## Output Format

### Per-Task CSV

Columns: Run ID, Prompt, Timestamp, Accuracy, %, Step 1, Step 2, Step 3, ...

```csv
Run ID,Prompt,Timestamp,Accuracy,%,Step 1,Step 2,Step 3,Step 4,Step 5
work_in_process_report_123,"show me all jobs",2025-01-15T10:30:00Z,0.8,80.0%,TRUE,TRUE,FALSE,TRUE,TRUE
```

### Heatmap CSV

Columns: Run ID, Timestamp, Median Accuracy, [18 workflow columns]

```csv
Run ID,Timestamp,Median Accuracy,work_in_process_report,detailed_budget_tracking,...
run_1,2025-01-15T10:30:00Z,85.5,92.3,78.9,...
run_2,2025-01-15T10:31:00Z,88.2,95.1,82.4,...
```

Import this into Google Sheets, Excel, or Python to create a GitHub-style heatmap where:
- **Green cells** = High accuracy (task working well)
- **Red cells** = Low accuracy (task needs work)
- **Columns** = 18 tasks
- **Rows** = Evaluation runs

## Usage

### Step 1: Extract Steps

```bash
node eval/extract-workflow-steps.js
```

### Step 2: Configure Endpoint

You need to implement the `callEndpoint()` method in `run-evals.ts`:

```typescript
private async callEndpoint(prompt: string): Promise<any> {
  // YOUR IMPLEMENTATION HERE
  // Must return: { trace: [{ name: 'tool_name', ... }] }
}
```

Set environment variables:

```bash
export EVAL_ENDPOINT="https://your-endpoint.com/chat"
export EVAL_API_KEY="your-api-key"  # Optional
export RUNS_PER_PROMPT=10  # Default: 10
```

### Step 3: Run Evaluations

```bash
npx tsx eval/run-evals.ts
```

Output will be in `eval/results/`:
- `{workflow}_{timestamp}.json` - Detailed per-task results
- `{workflow}_{timestamp}.csv` - Per-task step matrix
- `heatmap_{timestamp}.json` - Heatmap data
- `heatmap_{timestamp}.csv` - Heatmap for visualization

## What Gets Evaluated

### The 18 Workflows

1. work_in_process_report (5 steps)
2. detailed_budget_tracking (4 steps)
3. deposit_tracking (4 steps)
4. cost_to_estimate_report (4 steps)
5. receivables_report (4 steps)
6. gross_receipts_forecast (4 steps)
7. job_queue_summary (3 steps)
8. projected_income (3 steps)
9. revised_estimate_analysis (3 steps)
10. job_benchmarking (3 steps)
11. cost_per_square_foot_report (2 steps)
12. change_order_tracking (4 steps)
13. upgrade_pricing (4 steps)
14. update_schedule (3 steps)
15. missed_action_items_alert (2 steps)
16. blind_spots_report (3 steps)
17. generate_job_status_report (2 steps)
18. plan_analysis (0 steps - uses Claude vision)

### Accuracy Metric

For each run:
- **Accuracy** = (Steps executed correctly) / (Total expected steps)
- **Step Result** = TRUE if expected tool was called, FALSE otherwise
- We **ignore** extra tool calls (only check expected steps)

## Example Results

### Good Workflow (85% accuracy)

```
work_in_process_report: 85.2% average accuracy
  Run 1: 100% - All 5 steps executed
  Run 2: 80%  - Missed step 3 (list_action_items)
  Run 3: 100% - All 5 steps executed
  ...
```

### Problematic Workflow (45% accuracy)

```
upgrade_pricing: 45.8% average accuracy
  Run 1: 50%  - Only executed 2 of 4 steps
  Run 2: 25%  - Only executed 1 of 4 steps
  Run 3: 75%  - Executed 3 of 4 steps
  ...
```

This tells you the workflow needs improvement (unclear prompts or instructions).

## Next Steps

1. **Implement callEndpoint()** - Connect to your Claude/MCP testing environment
2. **Run baseline evaluation** - Get initial accuracy metrics
3. **Iterate on prompts** - If accuracy is low, improve test prompts
4. **Iterate on instructions** - If steps are skipped, clarify workflow instructions
5. **Visualize results** - Create heatmap from CSV
6. **Set up CI/CD** - Run evals automatically on code changes

## Files Created

```
eval/
├── README.md                      # Full documentation
├── EVAL_SYSTEM_SUMMARY.md        # This file
├── extract-workflow-steps.js     # Step extractor
├── run-evals.ts                  # Evaluation runner
├── test-prompts.json             # 90 test prompts (5 per workflow)
├── workflow-steps.json           # Extracted workflow steps
└── results/                      # Output directory (created on first run)
    ├── {workflow}_{timestamp}.json
    ├── {workflow}_{timestamp}.csv
    ├── heatmap_{timestamp}.json
    └── heatmap_{timestamp}.csv
```

## Key Features

✅ **Automated** - Run 180 evaluations with one command
✅ **Realistic** - Uses human-like prompts (vague, incomplete)
✅ **Detailed** - Step-by-step accuracy tracking
✅ **Visualizable** - CSV export for heatmap charts
✅ **Flexible** - Works with any Claude/MCP endpoint
✅ **Reproducible** - Deterministic step comparison

## The Big Picture

This evaluation system lets you:

1. **Test if workflows work** - Does Claude follow the instructions?
2. **Identify weak spots** - Which workflows have low accuracy?
3. **Track improvements** - Run evals before/after changes
4. **Visualize quality** - Heatmap shows all 18 workflows at a glance
5. **Ensure reliability** - Catch regressions in CI/CD

The goal is to achieve **>80% accuracy** on all 18 workflows, meaning Claude reliably executes the correct sequence of tools for each construction management task.
