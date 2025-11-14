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
  model?: string;
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
   * Call the evaluation endpoint using OpenRouter with MCP tools
   */
  private async callEndpoint(prompt: string): Promise<any> {
    const messages: any[] = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    const toolCalls: ToolCall[] = [];
    let iterations = 0;
    const maxIterations = 20; // Prevent infinite loops

    // Tool calling loop
    while (iterations < maxIterations) {
      iterations++;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': 'https://github.com/ssdavidai/joeapi',
          'X-Title': 'JoeAPI Eval System',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model || 'anthropic/claude-3.5-sonnet',
          messages,
          tools: this.getMCPTools(),
          tool_choice: 'auto',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const choice = data.choices[0];
      const message = choice.message;

      // Add assistant message to conversation
      messages.push(message);

      // Check if there are tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        // Record tool calls
        for (const toolCall of message.tool_calls) {
          toolCalls.push({
            name: toolCall.function.name,
            timestamp: new Date().toISOString(),
            arguments: JSON.parse(toolCall.function.arguments),
          });

          // Execute the tool call via JoeAPI
          const toolResult = await this.executeMCPTool(
            toolCall.function.name,
            JSON.parse(toolCall.function.arguments)
          );

          // Add tool result to conversation
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });
        }
      } else {
        // No more tool calls, conversation complete
        break;
      }
    }

    return {
      trace: toolCalls,
      finalMessage: messages[messages.length - 1],
      iterations,
    };
  }

  /**
   * Get MCP tools in OpenAI function calling format
   */
  private getMCPTools(): any[] {
    // This would need to be loaded from your MCP server
    // For now, return a subset of critical tools
    // TODO: Load this from the actual MCP server tools list
    return [
      {
        type: 'function',
        function: {
          name: 'list_project_managements',
          description: 'List all project management records with pagination and filters',
          parameters: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              status: { type: 'string' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'list_project_schedule_tasks',
          description: 'List project schedule tasks',
          parameters: {
            type: 'object',
            properties: {
              scheduleId: { type: 'string' },
              page: { type: 'number' },
              limit: { type: 'number' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'list_action_items',
          description: 'List action items with filters',
          parameters: {
            type: 'object',
            properties: {
              projectId: { type: 'string' },
              actionTypeId: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'list_transactions',
          description: 'List QuickBooks transactions',
          parameters: {
            type: 'object',
            properties: {
              classId: { type: 'string' },
              startDate: { type: 'string' },
              endDate: { type: 'string' },
              page: { type: 'number' },
              limit: { type: 'number' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'list_job_balances',
          description: 'List job balances for projects',
          parameters: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
            },
          },
        },
      },
      // Add more tools as needed...
    ];
  }

  /**
   * Execute an MCP tool by calling the JoeAPI endpoint
   */
  private async executeMCPTool(toolName: string, args: any): Promise<any> {
    const apiEndpoint = this.config.endpoint || 'https://joeapi.fly.dev';

    // Map MCP tool names to API endpoints
    const endpointMap: { [key: string]: string } = {
      'list_project_managements': '/api/v1/projectmanagements',
      'list_project_schedule_tasks': '/api/v1/projectscheduletasks',
      'list_action_items': '/api/v1/actionitems',
      'list_transactions': '/api/v1/transactions',
      'list_job_balances': '/api/v1/job-balances',
      'list_estimates': '/api/v1/estimates',
      'list_cost_revisions': '/api/v1/cost-revisions',
      'list_deposits': '/api/v1/deposits',
      'list_invoices': '/api/v1/invoices',
      'list_clients': '/api/v1/clients',
      'list_proposals': '/api/v1/proposals',
      'list_proposal_lines': '/api/v1/proposallines',
      'get_cost_variance': '/api/v1/cost-variance',
      'get_project_details': '/api/v1/project-details',
      'get_proposal_pipeline': '/api/v1/proposal-pipeline',
      // Add more mappings as needed...
    };

    const endpoint = endpointMap[toolName];
    if (!endpoint) {
      return { error: `Unknown tool: ${toolName}` };
    }

    // Build query string from args
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    }

    const url = `${apiEndpoint}${endpoint}?${queryParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return { error: `API error: ${response.status}` };
      }
      return await response.json();
    } catch (error: any) {
      return { error: error.message };
    }
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
  const config: EvalConfig = {
    endpoint: process.env.EVAL_ENDPOINT || 'https://joeapi.fly.dev',
    apiKey: process.env.EVAL_API_KEY || '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',
    model: process.env.EVAL_MODEL || 'anthropic/claude-3.5-sonnet',
    runsPerPrompt: parseInt(process.env.RUNS_PER_PROMPT || '10'),
    maxConcurrentRuns: parseInt(process.env.MAX_CONCURRENT || '3'),
  };

  console.log('Configuration:');
  console.log(`  API Endpoint: ${config.endpoint}`);
  console.log(`  Model: ${config.model}`);
  console.log(`  Runs per prompt: ${config.runsPerPrompt}`);
  console.log(`  API Key: ${config.apiKey?.substring(0, 20)}...`);

  const runner = new EvalRunner(config);
  await runner.runAll();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { EvalRunner, EvalConfig, EvalRun, TaskReport, HeatmapData };
