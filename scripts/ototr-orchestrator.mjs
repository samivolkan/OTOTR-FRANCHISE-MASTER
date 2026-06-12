#!/usr/bin/env node
import fs from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const command = process.argv[2] || 'help';
const dryRun = process.argv.includes('--dry-run');
const repo = process.env.GITHUB_REPO || 'samivolkan/OTOTR-FRANCHISE-MASTER';
const model = process.env.OPENAI_MODEL || 'gpt-5.5';
const apiKey = process.env.OPENAI_API_KEY;

const systemPrompt = `
You are the OTOTR project orchestrator.
Turn messy ChatGPT notes into small GitHub issues for Codex.
Each issue must be implementable in one focused PR.
Use Turkish for user-facing text and issue titles.
Every issue must include:
- Context
- Scope
- Acceptance criteria
- Files/routes likely affected if known
- Test/check instructions
- Risk level: low/medium/high
Do not create broad issues like "finish the app".
`;

function extractTextFromResponses(data) {
  if (typeof data.output_text === 'string') return data.output_text;
  const chunks = [];
  for (const item of data.output || []) {
    for (const part of item.content || []) {
      if (part.type === 'output_text' && part.text) chunks.push(part.text);
      if (part.type === 'text' && part.text) chunks.push(part.text);
    }
  }
  return chunks.join('\n');
}

async function callOpenAI(input) {
  if (!apiKey) throw new Error('OPENAI_API_KEY is missing.');
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'ototr_issue_plan',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              issues: {
                type: 'array',
                minItems: 1,
                maxItems: 12,
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    title: { type: 'string' },
                    body: { type: 'string' },
                    labels: { type: 'array', items: { type: 'string' } },
                    priority: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] }
                  },
                  required: ['title', 'body', 'labels', 'priority']
                }
              }
            },
            required: ['issues']
          }
        }
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  const text = extractTextFromResponses(data);
  return JSON.parse(text);
}

function runGh(args, input) {
  const result = spawnSync('gh', args, {
    input,
    encoding: 'utf8',
    stdio: input ? ['pipe', 'pipe', 'pipe'] : ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    throw new Error(`gh ${args.join(' ')} failed:\n${result.stderr}`);
  }
  return result.stdout.trim();
}

async function plan() {
  const inbox = await fs.readFile('docs/AI_INBOX.md', 'utf8');
  const memory = await fs.readFile('docs/AI_PROJECT_MEMORY.md', 'utf8').catch(() => '');
  const roadmap = await fs.readFile('docs/ROADMAP_1000.md', 'utf8').catch(() => '');

  const input = `
# Project memory
${memory}

# Roadmap
${roadmap}

# New inbox notes
${inbox}

Create the next focused GitHub issues for Codex.
`;

  const plan = await callOpenAI(input);

  console.log(JSON.stringify(plan, null, 2));

  if (dryRun) return;

  for (const issue of plan.issues) {
    const labels = [...new Set(['ai-generated', 'codex-ready', issue.priority, ...issue.labels])];
    const args = [
      'issue', 'create',
      '--repo', repo,
      '--title', issue.title,
      '--body', `${issue.body}\n\n---\nCreated by OTOTR AI Orchestrator.\nTo run Codex, comment: /codex-run`,
    ];
    for (const label of labels) args.push('--label', label);
    const url = runGh(args);
    console.log(`Created: ${url}`);
  }
}

if (command === 'plan') {
  plan().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
} else {
  console.log(`Usage:
  node scripts/ototr-orchestrator.mjs plan --dry-run
  node scripts/ototr-orchestrator.mjs plan

Required:
  OPENAI_API_KEY
  gh auth login
Optional:
  OPENAI_MODEL=${model}
  GITHUB_REPO=${repo}
`);
}
