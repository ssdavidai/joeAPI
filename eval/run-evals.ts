/**
 * Evaluation runner for JoeAPI MCP workflows
 *
 * This script:
 * 1. Loads workflow steps and test prompts
 * 2. Runs each prompt N times against the specified endpoint
 * 3. Extracts tool calls from traces
 * 4. Compares actual vs expected steps
 * 5. Generates accuracy reports and heatmap data
 */

import * as fs from 'fs';
import * as path from 'path';

interface WorkflowStep {
  stepNumber: number;
  tool: string;
  context: string;
  validation: string;
}

interface Workflow {
  name: string;
  totalSteps: number;
  steps: WorkflowStep[];
}

interface TestPrompt {
  workflow: string;
  humanPrompts: string[];
}

interface EvalConfig {
  endpoint: string;
  apiKey?: string;
  runsPerPrompt: number;
  maxConcurrentRuns: number;
}

interface ToolCall {
  name: string;
  timestamp: string;
  arguments?: any;
}

interface EvalRun {
  runId: string;
  workflow: string;
  prompt: string;
  timestamp: string;
  toolCalls: ToolCall[];
  stepResults: { [stepNumber: number]: boolean };
  accuracy: number;
  responseTime: number;
  error?: string;
}

interface TaskReport {
  workflow: string;
  totalRuns: number;
  averageAccuracy: number;
  medianAccuracy: number;
  runs: EvalRun[];
}

interface HeatmapData {
  runId: string;
  timestamp: string;
  taskAccuracies: { [workflow: string]: number };
  medianAccuracy: number;
}

class EvalRunner {
  private workflows: { [name: string]: Workflow };
  private testPrompts: TestPrompt[];
  private config: EvalConfig;
  private results: EvalRun[] = [];

  constructor(config: EvalConfig) {
    this.config = config;

    // Load workflow steps
    const workflowsPath = path.join(__dirname, 'workflow-steps.json');
    this.workflows = JSON.parse(fs.readFileSync(workflowsPath, 'utf8'));

    // Load test prompts
    const promptsPath = path.join(__dirname, 'test-prompts.json');
    const promptsData = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
    this.testPrompts = promptsData.prompts;

    console.log(`Loaded ${Object.keys(this.workflows).length} workflows`);
    console.log(`Loaded ${this.testPrompts.length} test prompt sets`);
  }

  /**
   * Run all evaluations
   */
  async runAll(): Promise<void> {
    console.log(`\n=== Starting Evaluation ===`);
    console.log(`Endpoint: ${this.config.endpoint}`);
    console.log(`Runs per prompt: ${this.config.runsPerPrompt}`);
    console.log(`Total evaluations: ${this.testPrompts.length * this.config.runsPerPrompt}\n`);

    for (const testPromptSet of this.testPrompts) {
      await this.runWorkflowEvals(testPromptSet);
    }

    console.log(`\n=== Evaluation Complete ===`);
    console.log(`Total runs: ${this.results.length}`);

    this.generateReports();
  }

  /**
   * Run evaluations for a single workflow
   */
  private async runWorkflowEvals(testPromptSet: TestPrompt): Promise<void> {
    const workflow = this.workflows[testPromptSet.workflow];
    if (!workflow) {
      console.error(`Workflow not found: ${testPromptSet.workflow}`);
      return;
    }

    console.log(`\n--- ${workflow.name} (${workflow.totalSteps} steps) ---`);

    // Run each prompt multiple times
    for (let i = 0; i < this.config.runsPerPrompt; i++) {
      // Pick a random prompt from the set
      const promptIndex = Math.floor(Math.random() * testPromptSet.humanPrompts.length);
      const prompt = testPromptSet.humanPrompts[promptIndex];

      console.log(`  Run ${i + 1}/${this.config.runsPerPrompt}: "${prompt.substring(0, 50)}..."`);

      try {
        const result = await this.runSingleEval(workflow, prompt);
        this.results.push(result);

        console.log(`    → Accuracy: ${(result.accuracy * 100).toFixed(1)}% (${result.responseTime}ms)`);
      } catch (error: any) {
        console.error(`    → Error: ${error.message}`);
      }

      // Add small delay between runs to avoid rate limiting
      await this.sleep(500);
    }
  }

  /**
   * Run a single evaluation
   */
  private async runSingleEval(workflow: Workflow, prompt: string): Promise<EvalRun> {
    const startTime = Date.now();
    const runId = `${workflow.name}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      // TODO: Make actual API call to the endpoint
      // For now, this is a placeholder that you'll need to implement based on your endpoint
      const response = await this.callEndpoint(prompt);

      const toolCalls = this.extractToolCalls(response);
      const stepResults = this.compareSteps(workflow, toolCalls);
      const accuracy = this.calculateAccuracy(stepResults, workflow.totalSteps);

      return {
        runId,
        workflow: workflow.name,
        prompt,
        timestamp: new Date().toISOString(),
        toolCalls,
        stepResults,
        accuracy,
        responseTime: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        runId,
        workflow: workflow.name,
        prompt,
        timestamp: new Date().toISOString(),
        toolCalls: [],
        stepResults: {},
        accuracy: 0,
        responseTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Call the evaluation endpoint
   * TODO: Implement this based on your specific endpoint
   */
  private async callEndpoint(prompt: string): Promise<any> {
    // PLACEHOLDER: You'll need to implement this
    // This should call your Claude/MCP endpoint and return the response with traces

    throw new Error('callEndpoint not implemented - you need to define the endpoint');

    // Example implementation:
    // const response = await fetch(this.config.endpoint, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${this.config.apiKey}`,
    //   },
    //   body: JSON.stringify({ prompt }),
    // });
    // return response.json();
  }

  /**
   * Extract tool calls from the response
   */
  private extractToolCalls(response: any): ToolCall[] {
    // PLACEHOLDER: Extract tool calls from the response format
    // This depends on how your endpoint returns traces

    // Example: If response has a 'trace' or 'toolCalls' array
    if (response.trace) {
      return response.trace.map((call: any) => ({
        name: call.toolName || call.name,
        timestamp: call.timestamp || new Date().toISOString(),
        arguments: call.arguments || call.params,
      }));
    }

    return [];
  }

  /**
   * Compare actual tool calls against expected workflow steps
   */
  private compareSteps(workflow: Workflow, toolCalls: ToolCall[]): { [stepNumber: number]: boolean } {
    const results: { [stepNumber: number]: boolean } = {};

    for (const step of workflow.steps) {
      // Check if any tool call matches this step
      const expectedTool = this.normalizeToolName(step.tool);
      const found = toolCalls.some(call => {
        const actualTool = this.normalizeToolName(call.name);
        return actualTool === expectedTool;
      });

      results[step.stepNumber] = found;
    }

    return results;
  }

  /**
   * Normalize tool names for comparison
   */
  private normalizeToolName(toolName: string): string {
    // Remove whitespace, convert to lowercase, remove parenthetical notes
    return toolName
      .toLowerCase()
      .replace(/\s*\([^)]*\)/g, '') // Remove (Cost Change), (Schedule Change), etc.
      .trim();
  }

  /**
   * Calculate accuracy percentage
   */
  private calculateAccuracy(stepResults: { [stepNumber: number]: boolean }, totalSteps: number): number {
    if (totalSteps === 0) return 0;

    const completedSteps = Object.values(stepResults).filter(result => result).length;
    return completedSteps / totalSteps;
  }

  /**
   * Generate all reports
   */
  private generateReports(): void {
    console.log('\n=== Generating Reports ===\n');

    // Group results by workflow
    const taskReports = this.generateTaskReports();
    const heatmapData = this.generateHeatmapData();

    // Write reports to files
    const reportsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Write task reports
    for (const report of taskReports) {
      const filename = path.join(reportsDir, `${report.workflow}_${timestamp}.json`);
      fs.writeFileSync(filename, JSON.stringify(report, null, 2));
      console.log(`Task report: ${filename}`);
      console.log(`  Average accuracy: ${(report.averageAccuracy * 100).toFixed(1)}%`);
      console.log(`  Median accuracy: ${(report.medianAccuracy * 100).toFixed(1)}%`);
    }

    // Write heatmap data
    const heatmapFile = path.join(reportsDir, `heatmap_${timestamp}.json`);
    fs.writeFileSync(heatmapFile, JSON.stringify(heatmapData, null, 2));
    console.log(`\nHeatmap data: ${heatmapFile}`);

    // Write CSV for easy import
    this.generateCSVReports(reportsDir, timestamp, taskReports, heatmapData);

    // Print summary
    this.printSummary(taskReports);
  }

  /**
   * Generate per-task accuracy reports
   */
  private generateTaskReports(): TaskReport[] {
    const reports: TaskReport[] = [];

    for (const workflow of Object.values(this.workflows)) {
      const workflowRuns = this.results.filter(r => r.workflow === workflow.name);

      if (workflowRuns.length === 0) continue;

      const accuracies = workflowRuns.map(r => r.accuracy).sort((a, b) => a - b);
      const average = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
      const median = accuracies[Math.floor(accuracies.length / 2)];

      reports.push({
        workflow: workflow.name,
        totalRuns: workflowRuns.length,
        averageAccuracy: average,
        medianAccuracy: median,
        runs: workflowRuns,
      });
    }

    return reports;
  }

  /**
   * Generate heatmap data (columns = tasks, rows = runs)
   */
  private generateHeatmapData(): HeatmapData[] {
    const heatmapData: HeatmapData[] = [];

    // Group results by run timestamp (within 1-second windows for concurrent runs)
    const runGroups = new Map<string, EvalRun[]>();

    for (const result of this.results) {
      const roundedTime = Math.floor(new Date(result.timestamp).getTime() / 1000) * 1000;
      const key = new Date(roundedTime).toISOString();

      if (!runGroups.has(key)) {
        runGroups.set(key, []);
      }
      runGroups.get(key)!.push(result);
    }

    // Create heatmap rows
    let runIndex = 0;
    for (const [timestamp, runs] of runGroups) {
      const taskAccuracies: { [workflow: string]: number } = {};

      for (const run of runs) {
        taskAccuracies[run.workflow] = run.accuracy;
      }

      const accuracyValues = Object.values(taskAccuracies);
      const medianAccuracy = accuracyValues.length > 0
        ? accuracyValues.sort((a, b) => a - b)[Math.floor(accuracyValues.length / 2)]
        : 0;

      heatmapData.push({
        runId: `run_${++runIndex}`,
        timestamp,
        taskAccuracies,
        medianAccuracy,
      });
    }

    return heatmapData;
  }

  /**
   * Generate CSV reports for easy analysis
   */
  private generateCSVReports(
    reportsDir: string,
    timestamp: string,
    taskReports: TaskReport[],
    heatmapData: HeatmapData[]
  ): void {
    // Per-task detailed CSV
    for (const report of taskReports) {
      const csvLines = ['Run ID,Prompt,Timestamp,Accuracy,%,' +
        report.runs[0].workflow
          ? Object.keys(report.runs[0].stepResults).map(s => `Step ${s}`).join(',')
          : ''];

      for (const run of report.runs) {
        const stepCols = Object.entries(run.stepResults)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([_, result]) => result ? 'TRUE' : 'FALSE')
          .join(',');

        csvLines.push(
          `${run.runId},"${run.prompt.replace(/"/g, '""')}",${run.timestamp},${run.accuracy},${(run.accuracy * 100).toFixed(1)}%,${stepCols}`
        );
      }

      const csvFile = path.join(reportsDir, `${report.workflow}_${timestamp}.csv`);
      fs.writeFileSync(csvFile, csvLines.join('\n'));
      console.log(`CSV report: ${csvFile}`);
    }

    // Heatmap CSV (rows = runs, columns = tasks)
    const workflows = Object.keys(this.workflows);
    const heatmapCsvLines = ['Run ID,Timestamp,Median Accuracy,' + workflows.join(',')];

    for (const row of heatmapData) {
      const taskCols = workflows.map(w =>
        row.taskAccuracies[w] !== undefined
          ? (row.taskAccuracies[w] * 100).toFixed(1)
          : ''
      ).join(',');

      heatmapCsvLines.push(
        `${row.runId},${row.timestamp},${(row.medianAccuracy * 100).toFixed(1)},${taskCols}`
      );
    }

    const heatmapCsvFile = path.join(reportsDir, `heatmap_${timestamp}.csv`);
    fs.writeFileSync(heatmapCsvFile, heatmapCsvLines.join('\n'));
    console.log(`Heatmap CSV: ${heatmapCsvFile}`);
  }

  /**
   * Print summary statistics
   */
  private printSummary(taskReports: TaskReport[]): void {
    console.log('\n=== Summary Statistics ===\n');

    const overallAccuracies = taskReports.map(r => r.averageAccuracy);
    const overallAverage = overallAccuracies.reduce((sum, acc) => sum + acc, 0) / overallAccuracies.length;
    const overallMedian = overallAccuracies.sort((a, b) => a - b)[Math.floor(overallAccuracies.length / 2)];

    console.log(`Overall average accuracy: ${(overallAverage * 100).toFixed(1)}%`);
    console.log(`Overall median accuracy: ${(overallMedian * 100).toFixed(1)}%`);
    console.log('\nPer-task accuracy:');

    for (const report of taskReports.sort((a, b) => b.averageAccuracy - a.averageAccuracy)) {
      const bar = '█'.repeat(Math.floor(report.averageAccuracy * 20));
      console.log(`  ${report.workflow.padEnd(30)} ${(report.averageAccuracy * 100).toFixed(1).padStart(5)}% ${bar}`);
    }
  }

  /**
   * Utility: Sleep for ms
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  // TODO: Configure your endpoint here
  const config: EvalConfig = {
    endpoint: process.env.EVAL_ENDPOINT || 'PLACEHOLDER',
    apiKey: process.env.EVAL_API_KEY,
    runsPerPrompt: parseInt(process.env.RUNS_PER_PROMPT || '10'),
    maxConcurrentRuns: parseInt(process.env.MAX_CONCURRENT || '3'),
  };

  if (config.endpoint === 'PLACEHOLDER') {
    console.error('ERROR: You must set EVAL_ENDPOINT environment variable');
    console.error('Example: export EVAL_ENDPOINT="https://your-endpoint.com/chat"');
    process.exit(1);
  }

  const runner = new EvalRunner(config);
  await runner.runAll();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { EvalRunner, EvalConfig, EvalRun, TaskReport, HeatmapData };
