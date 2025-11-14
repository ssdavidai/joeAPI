/**
 * Extract workflow steps from mcp/index.ts GetPromptRequestSchema handler
 * This parses the switch statement to extract STEP 1, STEP 2, etc. and the tools used
 */

const fs = require('fs');
const path = require('path');

const MCP_INDEX_PATH = path.join(__dirname, '../mcp/index.ts');

// Read the MCP index file
const content = fs.readFileSync(MCP_INDEX_PATH, 'utf8');

// Extract the GetPromptRequestSchema handler
const handlerMatch = content.match(/server\.setRequestHandler\(GetPromptRequestSchema,[\s\S]*?switch \(name\) \{([\s\S]*?)\n    \}\n  \}\);/);

if (!handlerMatch) {
  console.error('Could not find GetPromptRequestSchema handler');
  process.exit(1);
}

const switchContent = handlerMatch[1];

// Extract each case statement
const caseRegex = /case '([^']+)':\s*instructions = `([\s\S]*?)`;\s*break;/g;
const workflows = {};

let match;
while ((match = caseRegex.exec(switchContent)) !== null) {
  const workflowName = match[1];
  const instructions = match[2];

  // Extract steps from instructions
  const steps = [];
  const stepRegex = /STEP (\d+): Use ([^\n]+)\nContext: ([^\n]+)\nValidation: ([^\n]+)/g;

  let stepMatch;
  while ((stepMatch = stepRegex.exec(instructions)) !== null) {
    steps.push({
      stepNumber: parseInt(stepMatch[1]),
      tool: stepMatch[2].trim(),
      context: stepMatch[3].trim(),
      validation: stepMatch[4].trim()
    });
  }

  workflows[workflowName] = {
    name: workflowName,
    totalSteps: steps.length,
    steps: steps
  };
}

// Output the extracted workflows
console.log(`Extracted ${Object.keys(workflows).length} workflows\n`);

// Write to JSON file
const outputPath = path.join(__dirname, 'workflow-steps.json');
fs.writeFileSync(outputPath, JSON.stringify(workflows, null, 2));
console.log(`Written to: ${outputPath}\n`);

// Print summary
for (const [name, workflow] of Object.entries(workflows)) {
  console.log(`${workflow.name}: ${workflow.totalSteps} steps`);
  workflow.steps.forEach(step => {
    console.log(`  STEP ${step.stepNumber}: ${step.tool}`);
  });
  console.log('');
}
