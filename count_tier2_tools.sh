echo "=== Tier 2 MCP Tools in mcp/index.ts ==="
echo ""
echo "Transactions (2):"
grep -c "case 'list_transactions':" mcp/index.ts
grep -c "case 'get_transaction_summary':" mcp/index.ts

echo ""
echo "Job Balances (1):"
grep -c "case 'list_job_balances':" mcp/index.ts

echo ""
echo "Cost Variance (1):"
grep -c "case 'get_cost_variance':" mcp/index.ts

echo ""
echo "Invoices (2):"
grep -c "case 'list_invoices':" mcp/index.ts
grep -c "case 'get_invoice':" mcp/index.ts

echo ""
echo "Schedule Revisions (2):"
grep -c "case 'list_schedule_revisions':" mcp/index.ts
grep -c "case 'get_schedule_revision':" mcp/index.ts

echo ""
echo "Project Details (1):"
grep -c "case 'get_project_details':" mcp/index.ts

echo ""
echo "Proposal Pipeline (1):"
grep -c "case 'get_proposal_pipeline':" mcp/index.ts

echo ""
echo "Estimate Revisions (1):"
grep -c "case 'get_estimate_revision_history':" mcp/index.ts

echo ""
echo "Cost Revisions (2):"
grep -c "case 'list_cost_revisions':" mcp/index.ts
grep -c "case 'get_cost_revision':" mcp/index.ts

echo ""
echo "Deposits (2):"
grep -c "case 'list_deposits':" mcp/index.ts
grep -c "case 'get_deposit_by_project':" mcp/index.ts

echo ""
echo "Proposal Template Pricing (2):"
grep -c "case 'get_proposal_template_pricing':" mcp/index.ts
grep -c "case 'get_proposal_template_pricing_by_id':" mcp/index.ts

echo ""
echo "=== TOTAL Tier 2 Tools: 18 ==="
