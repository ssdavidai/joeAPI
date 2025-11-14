# JoeAPI MCP Workflow Evaluation System

Automated evaluation system for testing the 18 fully-functional construction management workflows.

## Overview

This system tests whether Claude correctly executes the workflow instructions by:

1. **Sending realistic human prompts** (e.g., "show me all jobs we're working on")
2. **Tracking which tools were called** from the execution trace
3. **Comparing actual vs expected steps** from the workflow instructions
4. **Calculating accuracy** (% of expected steps that were executed)
5. **Generating reports** with per-task and aggregate statistics

## Files

### Core Files

- **`workflow-steps.json`** - Extracted steps for all 18 workflows (auto-generated)
- **`test-prompts.json`** - 5 realistic human prompts per workflow
- **`run-evals.ts`** - Main evaluation runner
- **`extract-workflow-steps.js`** - Script to extract steps from mcp/index.ts

### Output Files (in `results/`)

- **`{workflow}_{timestamp}.json`** - Detailed results per task
- **`{workflow}_{timestamp}.csv`** - CSV with Run ID, Prompt, Step1, Step2, etc.
- **`heatmap_{timestamp}.json`** - Heatmap data (18 columns x N rows)
- **`heatmap_{timestamp}.csv`** - CSV for visualization

## Quick Start

### 1. Extract Workflow Steps

```bash
node eval/extract-workflow-steps.js
```

This parses `mcp/index.ts` and creates `workflow-steps.json`.

### 2. Configure Endpoint

Set your evaluation endpoint (the URL where Claude can access the MCP server):

```bash
export EVAL_ENDPOINT="https://your-endpoint.com/chat"
export EVAL_API_KEY="your-api-key"  # Optional
export RUNS_PER_PROMPT=10  # Default: 10
```

### 3. Implement the Endpoint Integration

Edit `run-evals.ts` and implement the `callEndpoint()` method for your specific endpoint. This method needs to:

- Send the prompt to Claude with MCP access
- Return the response including tool call traces
- Format: `{ trace: [{ name: 'tool_name', timestamp: '...', arguments: {...} }] }`

### 4. Run Evaluations

```bash
npx tsx eval/run-evals.ts
```

This will:
- Run 10 iterations per workflow (180 total runs)
- Extract tool calls from traces
- Compare with expected steps
- Generate reports

## Output Format

### Per-Task Report JSON

```json
{
  "workflow": "work_in_process_report",
  "totalRuns": 10,
  "averageAccuracy": 0.92,
  "medianAccuracy": 0.95,
  "runs": [
    {
      "runId": "work_in_process_report_1234567890_abc123",
      "workflow": "work_in_process_report",
      "prompt": "show me all the jobs we're working on right now",
      "timestamp": "2025-01-15T10:30:00.000Z",
      "toolCalls": [
        { "name": "list_project_managements", "timestamp": "..." },
        { "name": "list_project_schedule_tasks", "timestamp": "..." }
      ],
      "stepResults": {
        "1": true,
        "2": true,
        "3": false,
        "4": true,
        "5": true
      },
      "accuracy": 0.8,
      "responseTime": 3450
    }
  ]
}
```

### Per-Task Report CSV

```
Run ID,Prompt,Timestamp,Accuracy,%,Step 1,Step 2,Step 3,Step 4,Step 5
work_in_process_report_123_abc,"show me all jobs",2025-01-15T10:30:00Z,0.8,80.0%,TRUE,TRUE,FALSE,TRUE,TRUE
```

### Heatmap CSV

Columns = 18 workflows, Rows = evaluation runs

```
Run ID,Timestamp,Median Accuracy,work_in_process_report,detailed_budget_tracking,deposit_tracking,...
run_1,2025-01-15T10:30:00Z,85.5,92.3,78.9,81.2,...
run_2,2025-01-15T10:31:00Z,88.2,95.1,82.4,86.5,...
```

You can import this CSV into any visualization tool to create a GitHub-style heatmap where:
- **Columns** = Tasks (18 total)
- **Rows** = Runs (N total)
- **Color** = Accuracy (red = low, green = high)

## Workflow Steps

The 18 workflows and their step counts:

1. **work_in_process_report** - 5 steps
2. **detailed_budget_tracking** - 4 steps
3. **deposit_tracking** - 4 steps
4. **cost_to_estimate_report** - 4 steps
5. **receivables_report** - 4 steps
6. **gross_receipts_forecast** - 4 steps
7. **job_queue_summary** - 3 steps
8. **projected_income** - 3 steps
9. **revised_estimate_analysis** - 3 steps
10. **job_benchmarking** - 3 steps
11. **cost_per_square_foot_report** - 2 steps
12. **change_order_tracking** - 4 steps
13. **upgrade_pricing** - 4 steps
14. **update_schedule** - 3 steps
15. **missed_action_items_alert** - 2 steps
16. **blind_spots_report** - 3 steps
17. **generate_job_status_report** - 2 steps
18. **plan_analysis** - 0 steps (uses Claude vision, no tool calls)

## Accuracy Calculation

For each run:
- **Accuracy** = (Number of expected steps executed) / (Total expected steps)
- **Step Result** = TRUE if the expected tool was called, FALSE if not

We **only** check if the expected steps were executed. Extra tool calls (not in the workflow) are ignored.

## Interpreting Results

### Good Results (80%+ accuracy)
- Workflow is working as designed
- Claude follows the instructions correctly
- Prompts are clear enough

### Medium Results (50-80% accuracy)
- Some steps being skipped
- Prompts might be ambiguous
- Instructions might need clarification

### Poor Results (<50% accuracy)
- Workflow not working as intended
- Instructions unclear or incorrect
- Prompts don't match the workflow

## Customization

### Adding More Prompts

Edit `test-prompts.json` and add more prompts to the `humanPrompts` array for any workflow.

### Changing Runs Per Prompt

```bash
export RUNS_PER_PROMPT=20  # Default: 10
```

### Custom Endpoints

You can test against different endpoints:
- Smithery chat
- Claude Desktop with MCP
- Custom Claude API integration
- Local MCP server via stdio

Just implement the `callEndpoint()` method accordingly.

## Next Steps

1. **Implement callEndpoint()** for your specific testing environment
2. **Run initial evaluation** to establish baseline
3. **Iterate on prompts** if accuracy is low
4. **Iterate on instructions** if steps are being skipped
5. **Create visualization** from heatmap CSV
6. **Set up CI/CD** to run evals on every MCP server change

## Example Visualization

Import the `heatmap_{timestamp}.csv` into:
- **Google Sheets** - Conditional formatting with color scale
- **Excel** - Heat map chart
- **Python** - seaborn heatmap
- **Observable** - D3.js visualization
- **Tableau** - Heatmap visualization

The ideal outcome is a GitHub-style contribution graph where you can quickly see which tasks are performing well (green) vs poorly (red) across multiple evaluation runs.
