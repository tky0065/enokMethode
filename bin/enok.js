#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { detectTechStack } = require('./detector');

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
    .version('1.0.0');

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
                    }
                };

                for (const [cmdName, cmdData] of Object.entries(commands)) {
                    const cmdContent = `---
description: ${cmdData.description}
---
${cmdData.content}
`;
                    await fs.writeFile(path.join(claudeDir, 'commands', `${cmdName}.md`), cmdContent);
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
3. **CURRENT_SPEC.md** - Active specification (if exists)

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

            const content = await fs.readFile(contextPath, 'utf8');
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

        try {
            if (!(await fs.pathExists(memoryPath))) {
                console.log(chalk.red('MEMORY.md not found.'));
                return;
            }

            const content = await fs.readFile(memoryPath, 'utf8');
            console.log(chalk.blue.bold('\n🧠 Project Memory\n'));
            console.log(content);
        } catch (err) {
            console.error(chalk.red('Failed to read memory:'), err);
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

program.parse(process.argv);
