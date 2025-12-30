#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { detectTechStack } = require('./detector');
const pkg = require('../package.json');

const program = new Command();

// Helper for formatting date
const getNow = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].slice(0, 5).replace(':', '-');
    return `${date}_${time}`;
};

program
    .name('enokmethod')
    .description('CLI for EnokMethod - Context-First Spec-Driven Development')
    .version(pkg.version);

// COMMAND: INIT
program
    .command('init')
    .description('Initialize EnokMethod in the current directory')
    .option('-a, --adapter <type>', 'Adapter to install (cursor, claude)', 'cursor')
    .action(async (options) => {
        const targetDir = process.cwd();
        const enokDir = path.join(targetDir, '.enokMethod');
        const templatesDir = path.join(__dirname, '../.enokMethod/templates');
        const promptsDir = path.join(__dirname, '../.enokMethod/prompts');

        try {
            // 1. Core Structure (Always needed)
            if (!(await fs.pathExists(enokDir))) {
                await fs.ensureDir(enokDir);
                await fs.ensureDir(path.join(enokDir, 'archive'));
                await fs.ensureDir(path.join(enokDir, 'prompts'));

                await fs.copy(
                    path.join(templatesDir, 'CONTEXT.md'),
                    path.join(enokDir, 'CONTEXT.md')
                );
                await fs.copy(
                    path.join(templatesDir, 'MEMORY.md'),
                    path.join(enokDir, 'MEMORY.md')
                );
                // Copy core prompts
                await fs.copy(promptsDir, path.join(enokDir, 'prompts'));

                // --- AUTO-DETECTION START ---
                console.log(chalk.blue('ℹ Auto-detecting tech stack...'));
                const stack = await detectTechStack(targetDir);
                const contextPath = path.join(enokDir, 'CONTEXT.md');
                let contextContent = await fs.readFile(contextPath, 'utf8');

                if (stack.language)
                    contextContent = contextContent.replace(
                        /Language\*\*:.*$/gm,
                        `Language**: ${stack.language}`
                    );
                if (stack.framework)
                    contextContent = contextContent.replace(
                        /Framework\*\*:.*$/gm,
                        `Framework**: ${stack.framework}`
                    );
                if (stack.styling)
                    contextContent = contextContent.replace(
                        /Styling\*\*:.*$/gm,
                        `Styling**: ${stack.styling}`
                    );
                if (stack.database)
                    contextContent = contextContent.replace(
                        /Database\*\*:.*$/gm,
                        `Database**: ${stack.database}`
                    );
                if (stack.state)
                    contextContent = contextContent.replace(
                        /State Mgmt\*\*:.*$/gm,
                        `State Mgmt**: ${stack.state}`
                    );
                if (stack.testing)
                    contextContent = contextContent.replace(
                        /Testing\*\*:.*$/gm,
                        `Testing**: ${stack.testing}`
                    );

                await fs.writeFile(contextPath, contextContent);
                // --- AUTO-DETECTION END ---
            } else {
                console.log(chalk.yellow('EnokMethod core is already initialized.'));
            }

            // 2. Adapter: Cursor (New format with .cursor/rules/*.mdc)
            if (options.adapter === 'cursor') {
                const cursorDir = path.join(targetDir, '.cursor');
                const cursorRulesDir = path.join(cursorDir, 'rules');
                await fs.ensureDir(cursorRulesDir);

                // Copy legacy .cursorrules for backward compatibility
                await fs.copy(
                    path.join(templatesDir, 'cursorrules'),
                    path.join(targetDir, '.cursorrules')
                );

                // Copy new .mdc format rules from templates/cursor/
                const cursorTemplatesDir = path.join(templatesDir, 'cursor');
                if (await fs.pathExists(cursorTemplatesDir)) {
                    const mdcFiles = await fs.readdir(cursorTemplatesDir);
                    for (const file of mdcFiles) {
                        if (file.endsWith('.mdc')) {
                            await fs.copy(
                                path.join(cursorTemplatesDir, file),
                                path.join(cursorRulesDir, file)
                            );
                        }
                    }
                } else {
                    // Generate .mdc files dynamically if templates don't exist
                    const roles = ['architect', 'tech-lead', 'developer', 'reviewer', 'documenter', 'debugger'];
                    for (const role of roles) {
                        const promptContent = await fs.readFile(
                            path.join(promptsDir, `${role}.md`),
                            'utf8'
                        );

                        // Create Cursor .mdc format with frontmatter
                        const mdcContent = `---
description: EnokMethod ${role} role for AI assistance
globs: ["**/*"]
alwaysApply: false
---

# ${role.charAt(0).toUpperCase() + role.slice(1)} Role

${promptContent}
`;
                        await fs.writeFile(
                            path.join(cursorRulesDir, `${role}.mdc`),
                            mdcContent
                        );
                    }

                    // Create main enokmethod.mdc rule (always apply)
                    const mainMdcContent = `---
description: EnokMethod Project Rules
globs: ["**/*"]
alwaysApply: true
---

# EnokMethod - Context-First Spec-Driven Development

You are an expert AI developer following the **EnokMethod** methodology.

## Core Mandate

Before answering any technical question, verify you have read:
- \`.enokMethod/CONTEXT.md\` - Project tech stack and conventions
- \`.enokMethod/MEMORY.md\` - Current project state and history
- \`PRD.md\` - Product Requirements Document (if exists)

If \`CURRENT_SPEC.md\` exists, your ONLY goal is to implement it.

## Available Commands

- \`enokmethod spec "title"\` - Create new specification
- \`enokmethod done "name"\` - Archive completed spec
- \`enokmethod status\` - Check project status
- \`enokmethod validate\` - Validate project structure
- \`enokmethod commit\` - Generate commit message

## Rules

1. **Context First**: Always check MEMORY.md before starting
2. **Atomic Changes**: Do not refactor unrelated code
3. **No Hallucinations**: If a library is not in Tech Stack, ASK first
4. **Clean Up**: Remove unused imports and dead code immediately
`;
                    await fs.writeFile(
                        path.join(cursorRulesDir, 'enokmethod.mdc'),
                        mainMdcContent
                    );
                }

                console.log(chalk.green('✔ Installed Cursor config (.cursorrules + .cursor/rules/*.mdc)'));
            }

            // 3. Adapter: Claude Code
            if (options.adapter === 'claude') {
                const claudeDir = path.join(targetDir, '.claude');
                await fs.ensureDir(path.join(claudeDir, 'agents'));
                await fs.ensureDir(path.join(claudeDir, 'commands'));

                // Copy CLAUDE.md template
                await fs.copy(
                    path.join(templatesDir, 'CLAUDE.md'),
                    path.join(targetDir, 'CLAUDE.md')
                );

                // Generate ALL Agent Wrappers for Claude (6 agents)
                const agents = ['architect', 'tech-lead', 'developer', 'reviewer', 'documenter', 'debugger'];
                for (const agent of agents) {
                    const promptContent = await fs.readFile(
                        path.join(promptsDir, `${agent}.md`),
                        'utf8'
                    );
                    const agentContent = `---
description: EnokMethod ${agent} agent
tools: ["bash", "grep_glob", "edit", "read_file"]
---

${promptContent}
`;
                    await fs.writeFile(path.join(claudeDir, 'agents', `${agent}.md`), agentContent);
                }

                // Generate ALL Commands for Claude
                const commands = {
                    spec: {
                        description: 'Create a new specification using EnokMethod',
                        content: `# Enok Spec
Run the following command to create a spec:
\`enokmethod spec "$1"\`

This will create a new CURRENT_SPEC.md file with the given title.`
                    },
                    done: {
                        description: 'Complete the current specification',
                        content: `# Enok Done
Run the following command to finish the spec:
\`enokmethod done "$1"\`

This will archive CURRENT_SPEC.md and update MEMORY.md.`
                    },
                    prd: {
                        description: 'Create a Product Requirements Document (PRD)',
                        content: `# Enok PRD
Run the following command to start a PRD:
\`enokmethod prd "$1"\`

If no title is provided, the CLI will initialize a blank PRD.
Your Role as Agent:
1. If the user invokes this without a title or asks for help, INTERVIEW them to gather requirements.
2. Ask about: User Goals, Key Features, Success Criteria.
3. Propose ideas if the user is stuck.
4. Once you have enough info, update \`PRD.md\` with the details.
5. Finally, update \`MEMORY.md\` and \`README.md\` to reflect the new project scope.`
                    },
                    status: {
                        description: 'Show project status and active spec',
                        content: `# Enok Status
Run the following command to see the project status:
\`enokmethod status\`

This displays the active spec, recent activity, and completed specs count.`
                    },
                    validate: {
                        description: 'Validate EnokMethod project structure',
                        content: `# Enok Validate
Run the following command to validate the project:
\`enokmethod validate\`

This checks if all required files and directories are present.`
                    },
                    context: {
                        description: 'Display project context (CONTEXT.md)',
                        content: `# Enok Context
Run the following command to view the project context:
\`enokmethod context\`

This displays the content of .enokMethod/CONTEXT.md.`
                    },
                    memory: {
                        description: 'Display project memory (MEMORY.md)',
                        content: `# Enok Memory
Run the following command to view the project memory:
\`enokmethod memory\`

This displays the content of .enokMethod/MEMORY.md.`
                    },
                    list: {
                        description: 'List archived specifications',
                        content: `# Enok List
Run the following command to list archived specs:
\`enokmethod list\`

Options:
- \`--limit <n>\`: Limit number of results (default: 10)
- \`--search <term>\`: Search in spec names`
                    },
                    commit: {
                        description: 'Generate conventional commit message',
                        content: `# Enok Commit
Run the following command to generate a commit message:
\`enokmethod commit\`

This generates a conventional commit message based on CURRENT_SPEC.md.
Options:
- \`-m <msg>\`: Use custom commit message
- \`--no-verify\`: Skip git hooks`
                    },
                    dev: {
                        description: 'Start implementing the next task in CURRENT_SPEC.md',
                        content: `# Enok Developer Mode
You are now in Developer execution mode.

1. Run this command to see your next task:
\`enokmethod dev\`

2. Look for "👉 CURRENT FOCUS" in the output.
3. IMMEDIATELY implement that specific task.
4. When done, mark it as [x] in CURRENT_SPEC.md.`
                    },
                    plan: {
                        description: 'Analyze CURRENT_SPEC.md and show what needs planning',
                        content: `# Enok Plan
Run the following command to analyze the spec:
\`enokmethod plan\`

This will:
1. Check if CURRENT_SPEC.md exists
2. Analyze which sections are complete
3. Show if Implementation Plan needs to be filled

If the plan is incomplete, ask the Tech-Lead agent to complete it.`
                    }
                };

                // Ensure enokMethod namespace directory exists for namespaced commands (/enokMethod:spec)
                const enokCommandsDir = path.join(claudeDir, 'commands', 'enokMethod');
                await fs.ensureDir(enokCommandsDir);

                for (const [cmdName, cmdData] of Object.entries(commands)) {
                    const cmdContent = `---
description: ${cmdData.description}
---
${cmdData.content}
`;
                    await fs.writeFile(path.join(enokCommandsDir, `${cmdName}.md`), cmdContent);
                }

                console.log(chalk.green('✔ Installed Claude Code config (.claude/ with 6 agents & 8 commands)'));
            }

            // 3.5 Adapter: Gemini
            if (options.adapter === 'gemini') {
                await fs.copy(
                    path.join(templatesDir, 'GEMINI.md'),
                    path.join(targetDir, 'GEMINI.md')
                );
                console.log(chalk.green('✔ Installed Gemini config (GEMINI.md)'));
            }

            // 4. Adapter: GitHub Copilot (with role-specific .instructions.md files)
            if (options.adapter === 'copilot') {
                const githubDir = path.join(targetDir, '.github');
                await fs.ensureDir(githubDir);

                // Use dedicated Copilot template if available, else generate
                const copilotTemplatePath = path.join(templatesDir, 'copilot-instructions.md');
                if (await fs.pathExists(copilotTemplatePath)) {
                    await fs.copy(copilotTemplatePath, path.join(githubDir, 'copilot-instructions.md'));
                } else {
                    // Fallback: Generate from base template
                    const cursorRulesPath = path.join(templatesDir, 'cursorrules');
                    let copilotContent = await fs.readFile(cursorRulesPath, 'utf8');
                    copilotContent = copilotContent.replace(
                        '# Cursor Rules',
                        '# GitHub Copilot Instructions'
                    );
                    await fs.writeFile(path.join(githubDir, 'copilot-instructions.md'), copilotContent);
                }

                // Generate role-specific .instructions.md files (Copilot feature)
                const roles = ['architect', 'tech-lead', 'developer', 'reviewer', 'documenter', 'debugger'];
                for (const role of roles) {
                    const promptContent = await fs.readFile(
                        path.join(promptsDir, `${role}.md`),
                        'utf8'
                    );

                    // Copilot uses simple .instructions.md files without YAML frontmatter
                    const roleInstructions = `# ${role.charAt(0).toUpperCase() + role.slice(1)} Role - EnokMethod

You are acting as the **${role}** in the EnokMethod workflow.

## Context Files (Always Read First)
- \`.enokMethod/CONTEXT.md\` - Project tech stack and conventions
- \`.enokMethod/MEMORY.md\` - Recent activity and history
- \`CURRENT_SPEC.md\` - Active specification (if exists)

## Your Responsibilities

${promptContent}

## CLI Commands Available
- \`enokmethod spec "title"\` - Create new specification
- \`enokmethod done "name"\` - Archive completed spec
- \`enokmethod status\` - Show project status
- \`enokmethod commit\` - Generate commit message
`;
                    await fs.writeFile(
                        path.join(githubDir, `${role}.instructions.md`),
                        roleInstructions
                    );
                }

                console.log(
                    chalk.green(
                        '✔ Installed GitHub Copilot config (.github/copilot-instructions.md + 6 role files)'
                    )
                );
            }

            // 5. Adapter: General / Antigravity
            if (options.adapter === 'general') {
                await fs.copy(
                    path.join(templatesDir, 'AGENT.md'),
                    path.join(targetDir, 'AGENT.md')
                );
                console.log(chalk.green('✔ Installed General AI instructions (AGENT.md)'));
            }

            // 6. Adapter: Windsurf
            if (options.adapter === 'windsurf') {
                const windsurfDir = path.join(targetDir, '.windsurf');
                await fs.ensureDir(path.join(windsurfDir, 'rules'));

                // Copy base rules
                await fs.copy(
                    path.join(templatesDir, 'windsurfrules'),
                    path.join(targetDir, '.windsurfrules')
                );

                // Generate role-specific rules for Windsurf
                const roles = ['architect', 'tech-lead', 'developer', 'reviewer', 'documenter', 'debugger'];
                for (const role of roles) {
                    const promptContent = await fs.readFile(
                        path.join(promptsDir, `${role}.md`),
                        'utf8'
                    );
                    
                    // Create Windsurf-specific rule file
                    const windsurfRule = `# Windsurf Rules - ${role.charAt(0).toUpperCase() + role.slice(1)} Role

You are an expert AI developer acting as the **${role}** in the EnokMethod workflow.

## Core Context (ALWAYS READ FIRST)

1. **.enokMethod/CONTEXT.md** - Project tech stack, architecture, and conventions
2. **.enokMethod/MEMORY.md** - Recent activity and project history
3. **PRD.md** - Product Requirements (if exists)
4. **CURRENT_SPEC.md** - Active specification (if exists)

## Your Role

${promptContent}

## EnokMethod Commands

You can use these terminal commands:
- \`enokmethod spec "Title"\` - Create new specification
- \`enokmethod done "Name"\` - Archive current spec
- \`enokmethod status\` - Show project status
- \`enokmethod validate\` - Validate project structure
- \`enokmethod context\` - View CONTEXT.md
- \`enokmethod memory\` - View MEMORY.md
- \`enokmethod list\` - List archived specs
- \`enokmethod commit\` - Generate commit message

## Rules of Engagement

1. **Context First**: Always check MEMORY.md to see what has been done recently
2. **Atomic Changes**: Do not refactor unrelated code
3. **No Hallucinations**: If a library is not in Tech Stack, ASK before installing it
4. **Clean Up**: Remove unused imports and files immediately
5. **Follow CURRENT_SPEC.md**: If it exists, implement ONLY what's specified
`;
                    await fs.writeFile(
                        path.join(windsurfDir, 'rules', `${role}.md`),
                        windsurfRule
                    );
                }

                // Create a README for Windsurf usage
                const windsurfReadme = `# Windsurf + EnokMethod

## Usage

The base rules are in \`.windsurfrules\`. For role-specific rules, you can reference:

\`\`\`
.windsurf/rules/architect.md
.windsurf/rules/tech-lead.md
.windsurf/rules/developer.md
.windsurf/rules/reviewer.md
.windsurf/rules/documenter.md
.windsurf/rules/debugger.md
\`\`\`

## Workflow

1. **Start**: Tell Windsurf "New spec: [Your idea]"
2. **Plan**: Say "Plan this spec" (uses architect/tech-lead rules)
3. **Code**: Say "Implement" (uses developer rules)
4. **Review**: Say "Review the code" (uses reviewer rules)
5. **Done**: Say "Finish spec"

## Available Roles

- **architect**: System design and architecture decisions
- **tech-lead**: Technical planning and implementation strategy
- **developer**: Code implementation
- **reviewer**: Code review and quality assurance
- **documenter**: Documentation generation
- **debugger**: Bug fixing and troubleshooting
`;
                await fs.writeFile(path.join(windsurfDir, 'README.md'), windsurfReadme);

                console.log(chalk.green('✔ Installed Windsurf config (.windsurfrules + 6 role rules)'));
            }

            // 7. Adapter: Aider
            if (options.adapter === 'aider') {
                const aiderDir = path.join(targetDir, '.aider');
                await fs.ensureDir(path.join(aiderDir, 'prompts'));

                // Copy base config
                await fs.copy(
                    path.join(templatesDir, 'aider.conf.yml'),
                    path.join(targetDir, '.aider.conf.yml')
                );

                // Generate role-specific prompt files for Aider
                // Aider uses system prompts, not agents
                const roles = ['architect', 'tech-lead', 'developer', 'reviewer', 'documenter', 'debugger'];
                for (const role of roles) {
                    const promptContent = await fs.readFile(
                        path.join(promptsDir, `${role}.md`),
                        'utf8'
                    );
                    
                    // Wrap in Aider-specific format
                    const aiderPrompt = `# EnokMethod ${role.charAt(0).toUpperCase() + role.slice(1)} Role

You are acting as the **${role}** in the EnokMethod workflow.

## Context Files
Always read these files before starting:
- .enokMethod/CONTEXT.md (project tech stack and conventions)
- .enokMethod/MEMORY.md (recent activity and history)
- CURRENT_SPEC.md (active specification, if exists)

## Your Role

${promptContent}

## Workflow
1. Read the context files listed above
2. Follow the instructions in your role description
3. Make changes according to CURRENT_SPEC.md if it exists
4. Use conventional commits when done
`;
                    await fs.writeFile(
                        path.join(aiderDir, 'prompts', `${role}.md`),
                        aiderPrompt
                    );
                }

                // Copy CONVENTIONS.md - Aider's standard format for project context
                const conventionsPath = path.join(templatesDir, 'aider', 'CONVENTIONS.md');
                if (await fs.pathExists(conventionsPath)) {
                    await fs.copy(conventionsPath, path.join(targetDir, 'CONVENTIONS.md'));
                } else {
                    // Generate CONVENTIONS.md if template doesn't exist
                    const conventionsContent = `# EnokMethod Conventions

## Context Files

Before making any changes, always read:
- \`.enokMethod/CONTEXT.md\` - Tech stack and architecture
- \`.enokMethod/MEMORY.md\` - Recent activity and history
- \`CURRENT_SPEC.md\` - Active specification (if exists)

## Methodology

You are following the **EnokMethod** - Context-First Spec-Driven Development.

## CLI Commands

\`\`\`bash
enokmethod spec "title"     # Create new specification
enokmethod done "name"      # Archive completed spec
enokmethod status           # Show project status
enokmethod commit           # Generate commit message
\`\`\`
`;
                    await fs.writeFile(path.join(targetDir, 'CONVENTIONS.md'), conventionsContent);
                }

                // Create a README for Aider usage
                const aiderReadme = `# Aider + EnokMethod

## Quick Start

\`\`\`bash
# Load conventions automatically (recommended)
aider --read CONVENTIONS.md

# Or use a specific role
aider --message-file .aider/prompts/developer.md
\`\`\`

## Available Roles

- **architect.md**: System design and architecture decisions
- **tech-lead.md**: Technical planning and implementation strategy
- **developer.md**: Code implementation
- **reviewer.md**: Code review and quality assurance
- **documenter.md**: Documentation generation
- **debugger.md**: Bug fixing and troubleshooting

## EnokMethod Commands

\`\`\`bash
enokmethod spec "title"   # Create new specification
enokmethod done "name"    # Archive completed spec
enokmethod status         # Show project status
enokmethod validate       # Validate project structure
\`\`\`
`;
                await fs.writeFile(path.join(aiderDir, 'README.md'), aiderReadme);

                console.log(chalk.green('✔ Installed Aider config (.aider.conf.yml + CONVENTIONS.md + 6 role prompts)'));
            }


            // 8. Adapter: Antigravity (Agentic IDE)
            if (options.adapter === 'antigravity') {
                const agentDir = path.join(targetDir, '.agent');
                const workflowsDir = path.join(agentDir, 'workflows');
                const rulesDir = path.join(agentDir, 'rules');

                await fs.ensureDir(workflowsDir);
                await fs.ensureDir(rulesDir);

                // 1. Generate Rules (Context)
                const ruleContent = `# EnokMethod Rules

You are working in a project that follows the **EnokMethod**.

## Core Context
1. **Always** check \`.enokMethod/CONTEXT.md\` for tech stack details.
2. **Always** check \`.enokMethod/MEMORY.md\` for project status.
3. **Check** \`PRD.md\` for product goals (if exists).
4. **Focus** on \`CURRENT_SPEC.md\` if it exists.

## Commands
Use the provided workflows to interact with the project:
- \`spec\`: Start a new task
- \`done\`: Finish a task
- \`status\`: Check status
- \`commit\`: Commit changes
`;
                await fs.writeFile(path.join(rulesDir, 'enok.md'), ruleContent);

                // 2. Generate Workflows
                const workflows = {
                    spec: {
                        desc: 'Start a new feature or task (EnokMethod)',
                        steps: `1. Analyze the user request.
2. Run the spec command with the title.
// turbo
enokmethod spec "Title of the task"
`
                    },
                    prd: {
                        desc: 'Create or update PRD (EnokMethod)',
                        steps: `1. Run prd command to init file.
// turbo
enokmethod prd
2. Read PRD.md
3. Interview user to fill sections.
4. Update PRD.md
`
                    },
                    done: {
                        desc: 'Finish the current feature (EnokMethod)',
                        steps: `1. Verify all tests pass.
2. Run the done command.
// turbo
enokmethod done "Title of the task"
`
                    },
                    status: {
                        desc: 'Check project status (EnokMethod)',
                        steps: `1. Check the current status.
// turbo
enokmethod status
`
                    },
                    commit: {
                        desc: 'Generate a conventional commit (EnokMethod)',
                        steps: `1. Generate commit message from spec.
// turbo
enokmethod commit
`
                    }
                };

                for (const [name, data] of Object.entries(workflows)) {
                    const content = `---
description: ${data.desc}
---
${data.steps}`;
                    await fs.writeFile(path.join(workflowsDir, `${name}.md`), content);
                }

                console.log(chalk.green('✔ Installed Antigravity config (.agent/rules & .agent/workflows)'));
            }

            // 9. Adapter: Gemini CLI
            if (options.adapter === 'gemini-cli') {
                // User requested file be named GEMINI.md
                // This file acts as the system instruction/context for gemini-cli
                const geminiContent = `# Gemini CLI System Instructions

You are a Gemini agent working on a project using **EnokMethod**.

## Project Structure
- \`.enokMethod/CONTEXT.md\`: Technical constraints and stack.
- \`.enokMethod/MEMORY.md\`: Project history and current status.
- \`PRD.md\`: Product Requirements (if exists).
- \`CURRENT_SPEC.md\`: The active task you should focus on.

## Operational Rules
1. **Always** read the Context and Memory files at the start of a session.
2. **Use Tools**: Use your accessible tools (File System, Terminal) to explore and edit.
3. **CLI Usage**: This project uses \`enokmethod\` CLI.
   - Start task: \`enokmethod spec "Task Name"\`
   - Check status: \`enokmethod status\`
   - Finish task: \`enokmethod done "Task Name"\`

## Your Goal
Act as a senior developer. Autonomously move the project forward by checking the status, picking up the active spec (or creating one if needed), and writing high-quality code.
`;
                await fs.writeFile(path.join(targetDir, 'GEMINI.md'), geminiContent);
                console.log(chalk.green('✔ Installed Gemini CLI config (GEMINI.md)'));
            }

            console.log(chalk.green('✔ EnokMethod successfully initialized!'));
            console.log(chalk.blue('Next steps:'));
            console.log('1. Fill out .enokMethod/CONTEXT.md with your tech stack.');
            if (options.adapter === 'claude') {
                console.log('2. Run: claude agent architect "My new app idea"');
            } else {
                console.log('2. Start your first feature with: enokmethod spec "My idea"');
            }
        } catch (err) {
            console.error(chalk.red('Initialization failed:'), err);
        }
    });



// COMMAND: PRD
program
    .command('prd [title]')
    .description('Create a Product Requirements Document (PRD)')
    .action(async (title) => {
        const targetDir = process.cwd();
        const prdPath = path.join(targetDir, 'PRD.md');
        const templatePath = path.join(__dirname, '../.enokMethod/templates/PRD.md');
        const memoryPath = path.join(targetDir, '.enokMethod/MEMORY.md');

        try {
            if (await fs.pathExists(prdPath)) {
                console.log(chalk.yellow('Warning: PRD.md already exists.'));
                // Unlike spec, we might not want to refuse overwrite immediately if it's just an update, 
                // but for now let's just warn and maybe let the user manually edit.
                // Or if logic requires, we could read it.
                // But the request implies creation.
                console.log(chalk.gray('Edit the existing file or remove it to start fresh.'));
                return;
            }

            // Create from template
            if (await fs.pathExists(templatePath)) {
                let content = await fs.readFile(templatePath, 'utf8');
                if (title) {
                    content = content.replace('[Project Name]', title);
                    content = content.replace('[One sentence summary of what we are building]', title); // Fallback
                } else {
                    content = content.replace('[Project Name]', 'Untitled Project');
                }
                
                await fs.writeFile(prdPath, content);
                console.log(chalk.green(`✔ Created PRD: PRD.md`));
            } else {
                // Fallback if template missing
                await fs.writeFile(prdPath, `# PRD\n\n## Goal\n${title || 'Define your project'}`);
                console.log(chalk.green(`✔ Created PRD: PRD.md (basic)`));
            }

            // Update Memory
            if (await fs.pathExists(memoryPath)) {
                const nowDisplay = new Date().toISOString().replace('T', ' ').slice(0, 16);
                const memoryAppend = `\n- [${nowDisplay}] Started PRD: ${title || 'New Project'}\n`;
                await fs.appendFile(memoryPath, memoryAppend);
                console.log(chalk.green(`✔ Updated .enokMethod/MEMORY.md`));
            }

        } catch (err) {
            console.error(chalk.red('Failed to create PRD:'), err);
        }
    });

// COMMAND: SPEC
program
    .command('spec <title>')
    .description('Create a new specification')
    .action(async (title) => {
        const targetDir = process.cwd();
        const specPath = path.join(targetDir, 'CURRENT_SPEC.md');
        const templatePath = path.join(__dirname, '../.enokMethod/templates/SPEC.md');

        try {
            if (await fs.pathExists(specPath)) {
                const overwrite = await fs.readFile(specPath, 'utf8');
                console.log(
                    chalk.yellow('Warning: CURRENT_SPEC.md already exists. Refusing to overwrite.')
                );
                return;
            }

            let content = await fs.readFile(templatePath, 'utf8');
            content = content.replace('[Clear, one-sentence goal of this task]', title);

            await fs.writeFile(specPath, content);
            console.log(chalk.green(`✔ Created new spec: CURRENT_SPEC.md`));
        } catch (err) {
            console.error(chalk.red('Failed to create spec:'), err);
        }
    });

// COMMAND: PLAN
program
    .command('plan')
    .description('Analyze CURRENT_SPEC.md and show what needs planning')
    .action(async () => {
        const targetDir = process.cwd();
        const specPath = path.join(targetDir, 'CURRENT_SPEC.md');

        try {
            console.log(chalk.blue.bold('\n📋 EnokMethod Planning Assistant\n'));

            if (!(await fs.pathExists(specPath))) {
                console.log(chalk.red('❌ No CURRENT_SPEC.md found.'));
                console.log(chalk.gray('   Run: enokmethod spec "Your idea" first.'));
                return;
            }

            const specContent = await fs.readFile(specPath, 'utf8');

            // Extract Title
            const titleMatch = specContent.match(/\*\*Goal\*\*:\s*(.+)/);
            const title = titleMatch ? titleMatch[1].trim() : 'Untitled Spec';
            console.log(chalk.white(`📝 Spec: ${chalk.bold(title)}\n`));

            // Check sections
            const sections = {
                'Objective': /## 1\. Objective/,
                'Requirements': /## 2\. Detailed Requirements/,
                'Technical Impact': /## 3\. Technical Impact/,
                'Acceptance Criteria': /## 4\. Acceptance Criteria/,
                'Implementation Plan': /## 5\. Implementation Plan/
            };

            console.log(chalk.cyan('📊 Section Analysis:\n'));

            let needsPlanning = false;

            for (const [name, regex] of Object.entries(sections)) {
                const hasSection = regex.test(specContent);
                
                if (hasSection) {
                    // Check if section has content (not just placeholders)
                    const sectionStart = specContent.search(regex);
                    const nextSectionRegex = /## \d+\./g;
                    nextSectionRegex.lastIndex = sectionStart + 10;
                    const nextMatch = nextSectionRegex.exec(specContent);
                    const sectionEnd = nextMatch ? nextMatch.index : specContent.length;
                    const sectionContent = specContent.slice(sectionStart, sectionEnd);
                    
                    // Check for placeholder content
                    const hasPlaceholders = /\[.*\]/.test(sectionContent) && !/\[x\]/.test(sectionContent);
                    const hasEmptyChecklist = /- \[ \] Step 1\s*\n- \[ \] Step 2/.test(sectionContent);
                    
                    if (hasPlaceholders || hasEmptyChecklist) {
                        console.log(chalk.yellow('⚠'), name, chalk.gray('(needs content)'));
                        if (name === 'Implementation Plan') needsPlanning = true;
                    } else {
                        console.log(chalk.green('✓'), name);
                    }
                } else {
                    console.log(chalk.red('✗'), name, chalk.gray('(missing)'));
                    if (name === 'Implementation Plan') needsPlanning = true;
                }
            }

            console.log('');

            if (needsPlanning) {
                console.log(chalk.yellow.bold('⚠️  Implementation Plan needs completion!\n'));
                console.log(chalk.cyan('The Tech-Lead agent should:'));
                console.log(chalk.white('  1. Analyze which files need to be created/modified'));
                console.log(chalk.white('  2. Break down into small, atomic steps'));
                console.log(chalk.white('  3. List the Context Pack (files Developer needs)'));
                console.log('');
                console.log(chalk.gray('Tip: Ask your AI agent to "Complete the implementation plan"'));
            } else {
                console.log(chalk.green.bold('✅ Spec is ready for implementation!'));
                console.log(chalk.cyan('   Run: enokmethod dev'));
            }

        } catch (err) {
            console.error(chalk.red('Failed to analyze spec:'), err);
        }
    });

// COMMAND: DONE
program
    .command('done <name>')
    .description('Finish the current spec and archive it')
    .action(async (name) => {
        const targetDir = process.cwd();
        const specPath = path.join(targetDir, 'CURRENT_SPEC.md');
        const archiveDir = path.join(targetDir, '.enokMethod/archive');
        const memoryPath = path.join(targetDir, '.enokMethod/MEMORY.md');

        try {
            if (!(await fs.pathExists(specPath))) {
                console.log(chalk.red('Error: CURRENT_SPEC.md not found.'));
                return;
            }

            const timestamp = getNow();
            const archiveName = `${timestamp}-${name.replace(/\s+/g, '-')}.md`;
            const archivePath = path.join(archiveDir, archiveName);

            // Move to archive
            await fs.move(specPath, archivePath);

            // Simple Memory Update (Append)
            if (await fs.pathExists(memoryPath)) {
                const nowDisplay = new Date().toISOString().replace('T', ' ').slice(0, 16);
                const memoryAppend = `\n- [${nowDisplay}] Completed: ${name}\n`;
                await fs.appendFile(memoryPath, memoryAppend);
            }

            console.log(chalk.green(`✔ Archived spec to: .enokMethod/archive/${archiveName}`));
            console.log(chalk.green(`✔ Updated .enokMethod/MEMORY.md`));
        } catch (err) {
            console.error(chalk.red('Failed to finish spec:'), err);
        }
    });

// COMMAND: STATUS
program
    .command('status')
    .description('Display current project status')
    .action(async () => {
        const targetDir = process.cwd();
        const enokDir = path.join(targetDir, '.enokMethod');
        const specPath = path.join(targetDir, 'CURRENT_SPEC.md');
        const memoryPath = path.join(enokDir, 'MEMORY.md');
        const archiveDir = path.join(enokDir, 'archive');

        try {
            console.log(chalk.blue.bold('\n📊 EnokMethod Status\n'));

            // Check if initialized
            if (!(await fs.pathExists(enokDir))) {
                console.log(chalk.red('❌ EnokMethod not initialized in this directory.'));
                console.log(chalk.yellow('   Run: enokmethod init'));
                return;
            }

            console.log(chalk.green('✓ EnokMethod initialized\n'));

            // Active Spec
            if (await fs.pathExists(specPath)) {
                const specContent = await fs.readFile(specPath, 'utf8');
                const titleMatch = specContent.match(/\*\*Goal\*\*:\s*(.+)/);
                const title = titleMatch ? titleMatch[1] : 'Unknown';

                console.log(chalk.cyan('📝 Active Spec:'));
                console.log(`   ${title}\n`);
            } else {
                console.log(chalk.yellow('📝 No active spec'));
                console.log(chalk.gray('   Run: enokmethod spec "Your idea"\n'));
            }

            // Recent Memory
            if (await fs.pathExists(memoryPath)) {
                const memoryContent = await fs.readFile(memoryPath, 'utf8');
                const lines = memoryContent.split('\n').filter((l) => l.trim().startsWith('- ['));
                const recent = lines.slice(-3).reverse();

                if (recent.length > 0) {
                    console.log(chalk.cyan('🧠 Recent Activity:'));
                    recent.forEach((line) => console.log(`   ${line}`));
                    console.log('');
                }
            }

            // Archive Stats
            if (await fs.pathExists(archiveDir)) {
                const archiveFiles = await fs.readdir(archiveDir);
                console.log(chalk.cyan('📦 Completed Specs:'), archiveFiles.length);
            }
        } catch (err) {
            console.error(chalk.red('Failed to get status:'), err);
        }
    });

// COMMAND: LIST
program
    .command('list')
    .description('List archived specifications')
    .option('-l, --limit <n>', 'Limit number of results', '10')
    .option('-s, --search <term>', 'Search in spec names')
    .action(async (options) => {
        const targetDir = process.cwd();
        const archiveDir = path.join(targetDir, '.enokMethod/archive');

        try {
            if (!(await fs.pathExists(archiveDir))) {
                console.log(chalk.yellow('No archived specs found.'));
                return;
            }

            let files = await fs.readdir(archiveDir);

            // Filter by search term
            if (options.search) {
                const term = options.search.toLowerCase();
                files = files.filter((f) => f.toLowerCase().includes(term));
            }

            // Sort by date (newest first)
            files.sort().reverse();

            // Limit results
            const limit = parseInt(options.limit);
            files = files.slice(0, limit);

            if (files.length === 0) {
                console.log(chalk.yellow('No specs found.'));
                return;
            }

            console.log(chalk.blue.bold(`\n📚 Archived Specs (${files.length})\n`));

            files.forEach((file, index) => {
                // Parse filename: YYYY-MM-DD_HH-mm-Name.md
                const match = file.match(/^(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2})-(.+)\.md$/);
                if (match) {
                    const [, date, time, name] = match;
                    const displayName = name.replace(/-/g, ' ');
                    console.log(
                        chalk.cyan(`${index + 1}.`),
                        chalk.white(displayName),
                        chalk.gray(`(${date} ${time.replace('-', ':')})`)
                    );
                } else {
                    console.log(chalk.cyan(`${index + 1}.`), chalk.white(file));
                }
            });

            console.log('');
        } catch (err) {
            console.error(chalk.red('Failed to list specs:'), err);
        }
    });

// COMMAND: CONTEXT
program
    .command('context')
    .description('Display project context (CONTEXT.md)')
    .action(async () => {
        const targetDir = process.cwd();
        const contextPath = path.join(targetDir, '.enokMethod/CONTEXT.md');

        try {
            if (!(await fs.pathExists(contextPath))) {
                console.log(chalk.red('CONTEXT.md not found.'));
                return;
            }

            // AUTO-UPDATE LOGIC
            console.log(chalk.gray('ℹ Scanning project for tech stack updates...'));
            const stack = await detectTechStack(targetDir);
            let content = await fs.readFile(contextPath, 'utf8');
            let updated = false;

            const updateSection = (name, value) => {
                const regex = new RegExp(`${name}\\*\\*:.*$`, 'gm');
                // Only update if value exists and is different (ignoring case/spaces might be safer but strict check ok)
                if (value && !content.includes(`${name}**: ${value}`)) {
                     if (content.match(regex)) {
                         content = content.replace(regex, `${name}**: ${value}`);
                         updated = true;
                     }
                }
            };
            
            updateSection('Language', stack.language);
            updateSection('Framework', stack.framework);
            updateSection('Styling', stack.styling);
            updateSection('Database', stack.database);
            updateSection('State Mgmt', stack.state);
            updateSection('Testing', stack.testing);

            if (updated) {
                await fs.writeFile(contextPath, content);
                console.log(chalk.green('✔ CONTEXT.md auto-updated with fresh tech stack scan.'));
            } else {
                console.log(chalk.gray('✔ CONTEXT.md Tech Stack is up to date.'));
            }

            console.log(chalk.blue.bold('\n📋 Project Context\n'));
            console.log(content);
        } catch (err) {
            console.error(chalk.red('Failed to read context:'), err);
        }
    });

// COMMAND: MEMORY
program
    .command('memory')
    .description('Display project memory (MEMORY.md)')
    .action(async () => {
        const targetDir = process.cwd();
        const memoryPath = path.join(targetDir, '.enokMethod/MEMORY.md');
        const specPath = path.join(targetDir, 'CURRENT_SPEC.md');

        try {
            if (!(await fs.pathExists(memoryPath))) {
                console.log(chalk.red('MEMORY.md not found.'));
                return;
            }

            // READ STATE
            let content = await fs.readFile(memoryPath, 'utf8');
            const hasSpec = await fs.pathExists(specPath);
            let updated = false;

            // SYNC ACTIVE SPEC
            if (hasSpec) {
                const specContent = await fs.readFile(specPath, 'utf8');
                const titleMatch = specContent.match(/\*\*Goal\*\*:\s*(.+)/);
                const title = titleMatch ? titleMatch[1].trim() : 'Unknown Spec';
                
                // If MEMORY says None or different, update it
                const activeSpecRegex = /Active Spec:\s*(.*)/;
                const match = content.match(activeSpecRegex);
                
                if (match) {
                    const currentMemorySpec = match[1].trim();
                    // Basic check to see if we need to update
                    if (currentMemorySpec !== title && !currentMemorySpec.includes(title)) {
                        content = content.replace(activeSpecRegex, `Active Spec: ${title}`);
                        updated = true;
                    }
                }
            } else {
                // No spec file -> Active Spec should be "None"
                const activeSpecRegex = /Active Spec:\s*(.*)/;
                const match = content.match(activeSpecRegex);
                 if (match && match[1].trim() !== 'None') {
                    content = content.replace(activeSpecRegex, `Active Spec: None`);
                    updated = true;
                }
            }

            if (updated) {
                await fs.writeFile(memoryPath, content);
                console.log(chalk.green('✔ MEMORY.md synced with project state.'));
            } else {
                console.log(chalk.gray('✔ MEMORY.md is in sync.'));
            }

            console.log(chalk.blue.bold('\n🧠 Project Memory\n'));
            console.log(content);
        } catch (err) {
            console.error(chalk.red('Failed to read/update memory:'), err);
        }
    });

// COMMAND: VALIDATE
program
    .command('validate')
    .description('Validate EnokMethod structure')
    .action(async () => {
        const targetDir = process.cwd();
        const enokDir = path.join(targetDir, '.enokMethod');

        console.log(chalk.blue.bold('\n🔍 Validating EnokMethod Structure\n'));

        const checks = [
            {
                name: '.enokMethod directory',
                path: enokDir,
                type: 'dir',
            },
            {
                name: 'CONTEXT.md',
                path: path.join(enokDir, 'CONTEXT.md'),
                type: 'file',
            },
            {
                name: 'MEMORY.md',
                path: path.join(enokDir, 'MEMORY.md'),
                type: 'file',
            },
            {
                name: 'archive directory',
                path: path.join(enokDir, 'archive'),
                type: 'dir',
            },
            {
                name: 'prompts directory',
                path: path.join(enokDir, 'prompts'),
                type: 'dir',
            },
        ];

        let allValid = true;

        for (const check of checks) {
            const exists = await fs.pathExists(check.path);
            if (exists) {
                console.log(chalk.green('✓'), check.name);
            } else {
                console.log(chalk.red('✗'), check.name, chalk.gray('(missing)'));
                allValid = false;
            }
        }

        // Check CONTEXT.md content
        const contextPath = path.join(enokDir, 'CONTEXT.md');
        if (await fs.pathExists(contextPath)) {
            const content = await fs.readFile(contextPath, 'utf8');
            const requiredSections = [
                '## 1. Project Overview',
                '## 2. Tech Stack',
                '## 3. Core Architecture',
                '## 4. Coding Conventions',
                '## 5. Rules of Engagement',
            ];

            console.log(chalk.blue('\n📄 CONTEXT.md sections:'));
            for (const section of requiredSections) {
                if (content.includes(section)) {
                    console.log(chalk.green('✓'), section);
                } else {
                    console.log(chalk.yellow('⚠'), section, chalk.gray('(missing)'));
                }
            }
        }

        console.log('');
        if (allValid) {
            console.log(chalk.green.bold('✅ Structure is valid!'));
        } else {
            console.log(chalk.yellow.bold('⚠️  Some files are missing. Run: enokmethod init'));
        }
    });

// COMMAND: COMMIT
program
    .command('commit')
    .description('Generate a conventional commit message based on CURRENT_SPEC.md')
    .option('-m, --message <msg>', 'Custom commit message')
    .option('--no-verify', 'Skip git hooks')
    .action(async (options) => {
        const targetDir = process.cwd();
        const specPath = path.join(targetDir, 'CURRENT_SPEC.md');

        try {
            let commitMessage = '';

            // If custom message provided, use it
            if (options.message) {
                commitMessage = options.message;
            } else if (await fs.pathExists(specPath)) {
                // Generate from CURRENT_SPEC.md
                const specContent = await fs.readFile(specPath, 'utf8');

                // Extract title/goal
                const goalMatch = specContent.match(/\*\*Goal\*\*:\s*(.+)/);
                const goal = goalMatch ? goalMatch[1].trim() : 'Update';

                // Extract requirements
                const reqMatches = specContent.match(/^- \[x\] (.+)$/gm) || [];
                const completedReqs = reqMatches.map((r) => r.replace(/^- \[x\] /, '- '));

                // Determine type
                let type = 'feat';
                if (goal.toLowerCase().includes('fix')) type = 'fix';
                if (goal.toLowerCase().includes('doc')) type = 'docs';
                if (goal.toLowerCase().includes('refactor')) type = 'refactor';
                if (goal.toLowerCase().includes('test')) type = 'test';

                // Build commit message
                commitMessage = `${type}: ${goal}`;
                if (completedReqs.length > 0) {
                    commitMessage += '\n\n' + completedReqs.join('\n');
                }
            } else {
                console.log(
                    chalk.yellow('No CURRENT_SPEC.md found and no custom message provided.')
                );
                console.log(chalk.gray('Usage: enokmethod commit -m "your message"'));
                return;
            }

            // Display proposed message
            console.log(chalk.blue.bold('\n📝 Proposed Commit Message:\n'));
            console.log(chalk.white(commitMessage));
            console.log('');

            // Ask for confirmation (simplified - in real use, would use inquirer)
            console.log(chalk.yellow('Run this command to commit:'));
            const verifyFlag = options.verify === false ? ' --no-verify' : '';
            console.log(
                chalk.cyan(`git commit -m "${commitMessage.replace(/\n/g, '\\n')}"${verifyFlag}`)
            );
        } catch (err) {
            console.error(chalk.red('Failed to generate commit message:'), err);
        }
    });

// COMMAND: DEV (DASHBOARD)
program
    .command('dev')
    .description('Show development dashboard, progress, and current proactive task')
    .action(async () => {
        const targetDir = process.cwd();
        const specPath = path.join(targetDir, 'CURRENT_SPEC.md');

        try {
            console.log(chalk.blue.bold('\n🚀 EnokMethod Dev Dashboard\n'));

            if (!(await fs.pathExists(specPath))) {
                console.log(chalk.yellow('⚠️  No active specification found.'));
                console.log(chalk.gray('   To start, run: enokmethod spec "Your Goal"'));
                return;
            }

            const specContent = await fs.readFile(specPath, 'utf8');
            
            // Extract Title
            const titleMatch = specContent.match(/\*\*Goal\*\*:\s*(.+)/);
            const title = titleMatch ? titleMatch[1].trim() : 'Untitled Spec';

            // Extract Tasks (- [ ] or - [x])
            const taskRegex = /^\s*-\s*\[([ xX])\]\s*(.+)$/gm;
            let match;
            let total = 0;
            let completed = 0;
            let nextTask = null;

            while ((match = taskRegex.exec(specContent)) !== null) {
                total++;
                const isDone = match[1].toLowerCase() === 'x';
                const taskText = match[2].trim();

                if (isDone) {
                    completed++;
                } else if (!nextTask) {
                    // First unchecked task is the active focus
                    nextTask = taskText;
                }
            }

            // Calculate Progress
            const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
            const barLength = 20;
            const filledLength = Math.round((barLength * percentage) / 100);
            const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

            // Display
            console.log(chalk.white(`📝 Spec: ${chalk.bold(title)}`));
            
            // Progress Bar
            let colorFn = chalk.red;
            if (percentage > 30) colorFn = chalk.yellow;
            if (percentage > 70) colorFn = chalk.green;
            
            console.log(chalk.gray(`   Progress: `) + colorFn(`[${bar}] ${percentage}%`) + chalk.gray(` (${completed}/${total})`));

            console.log(''); // Spacer

            // Current Focus
            if (nextTask) {
                console.log(chalk.green.bold('👉 CURRENT FOCUS:'));
                console.log(chalk.white(`   [ ] ${nextTask}`));
                console.log('');
                console.log(chalk.gray('   (Implement this task, then mark it [x] in CURRENT_SPEC.md)'));
            } else if (total > 0 && percentage === 100) {
                console.log(chalk.green.bold('🎉 ALL TASKS COMPLETED!'));
                console.log(chalk.cyan('   Run: enokmethod done "' + title + '"'));
                console.log(chalk.cyan('   Run: enokmethod commit'));
            } else {
                console.log(chalk.yellow('   No checklist found in CURRENT_SPEC.md'));
                console.log(chalk.gray('   Add tasks like: - [ ] Task description'));
            }
            console.log('');

        } catch (err) {
            console.error(chalk.red('Failed to load dashboard:'), err);
        }
    });

// COMMAND: DEBUG
program
    .command('debug <issue>')
    .description('Create a bug fix specification')
    .action(async (issue) => {
        const targetDir = process.cwd();
        const specPath = path.join(targetDir, 'CURRENT_SPEC.md');

        try {
            if (await fs.pathExists(specPath)) {
                console.log(chalk.yellow('Warning: CURRENT_SPEC.md already exists.'));
                console.log(chalk.gray('Finish or archive current spec first: enokmethod done "Name"'));
                return;
            }

            const debugSpec = `# Bug Fix Specification

> **Type**: Bug Fix
> **Created**: ${new Date().toISOString().replace('T', ' ').slice(0, 16)}

## 1. Issue Description
**Problem**: ${issue}
**Reported By**: [User/Test/Monitor]
**Severity**: [Critical/High/Medium/Low]

## 2. Reproduction Steps
- [ ] Step 1: [How to trigger the bug]
- [ ] Step 2: [Expected vs Actual behavior]

## 3. Root Cause Analysis
<!-- Debugger agent will fill this -->
- **Location**: [File:Line]
- **Cause**: [Why it happens]

## 4. Fix Plan
- [ ] Identify affected code
- [ ] Implement minimal fix
- [ ] Add regression test
- [ ] Verify fix doesn't break other features

## 5. Acceptance Criteria
- [ ] Bug no longer reproducible
- [ ] Regression test passes
- [ ] No new issues introduced
`;

            await fs.writeFile(specPath, debugSpec);
            console.log(chalk.green('✔ Created bug fix spec: CURRENT_SPEC.md'));
            console.log(chalk.blue('\nNext steps:'));
            console.log(chalk.gray('1. Fill in reproduction steps'));
            console.log(chalk.gray('2. Ask AI to analyze and fix (Debugger role)'));
            console.log(chalk.gray('3. Run: enokmethod done "Fix: ' + issue.slice(0, 30) + '..."'));

        } catch (err) {
            console.error(chalk.red('Failed to create debug spec:'), err);
        }
    });

// COMMAND: DOCS
program
    .command('docs')
    .description('Show documentation status and suggestions')
    .option('--readme', 'Focus on README.md updates')
    .option('--changelog', 'Focus on CHANGELOG.md updates')
    .action(async (options) => {
        const targetDir = process.cwd();
        const readmePath = path.join(targetDir, 'README.md');
        const changelogPath = path.join(targetDir, 'CHANGELOG.md');
        const specPath = path.join(targetDir, 'CURRENT_SPEC.md');
        const archiveDir = path.join(targetDir, '.enokMethod/archive');

        try {
            console.log(chalk.blue.bold('\n📚 EnokMethod Documentation Status\n'));

            // Check README
            if (await fs.pathExists(readmePath)) {
                const stats = await fs.stat(readmePath);
                const lastModified = stats.mtime.toISOString().split('T')[0];
                console.log(chalk.green('✓'), 'README.md', chalk.gray(`(last modified: ${lastModified})`));
            } else {
                console.log(chalk.red('✗'), 'README.md', chalk.gray('(missing)'));
            }

            // Check CHANGELOG
            if (await fs.pathExists(changelogPath)) {
                const stats = await fs.stat(changelogPath);
                const lastModified = stats.mtime.toISOString().split('T')[0];
                console.log(chalk.green('✓'), 'CHANGELOG.md', chalk.gray(`(last modified: ${lastModified})`));
            } else {
                console.log(chalk.yellow('⚠'), 'CHANGELOG.md', chalk.gray('(not found - consider creating one)'));
            }

            // Check for recent completed specs that might need documentation
            if (await fs.pathExists(archiveDir)) {
                const archiveFiles = await fs.readdir(archiveDir);
                const recentSpecs = archiveFiles.slice(-3).reverse();
                
                if (recentSpecs.length > 0) {
                    console.log(chalk.cyan('\n📝 Recently Completed Features (may need docs):'));
                    for (const file of recentSpecs) {
                        const match = file.match(/^(\d{4}-\d{2}-\d{2})_\d{2}-\d{2}-(.+)\.md$/);
                        if (match) {
                            const [, date, name] = match;
                            console.log(chalk.gray(`   - ${name.replace(/-/g, ' ')} (${date})`));
                        }
                    }
                }
            }

            // Suggestions
            console.log(chalk.cyan('\n💡 Suggestions:'));
            
            if (await fs.pathExists(specPath)) {
                console.log(chalk.white('   • Document current feature after completion'));
            }
            
            console.log(chalk.white('   • Ask AI: "Update README with recent changes"'));
            console.log(chalk.white('   • Ask AI: "Generate CHANGELOG entry for latest feature"'));
            console.log('');

        } catch (err) {
            console.error(chalk.red('Failed to check docs:'), err);
        }
    });

program.parse(process.argv);

