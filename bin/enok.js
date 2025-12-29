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

            // 2. Adapter: Cursor
            if (options.adapter === 'cursor') {
                await fs.copy(
                    path.join(templatesDir, 'cursorrules'),
                    path.join(targetDir, '.cursorrules')
                );
                console.log(chalk.green('✔ Installed Cursor rules (.cursorrules)'));
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

                // Generate Agent Wrappers for Claude
                const agents = ['architect', 'tech-lead', 'developer'];
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

                // Generate Commands for Claude
                const specCmd = `---
description: Create a new specification using EnokMethod
---
# Enok Spec
Run the following command to create a spec:
\`enokmethod spec "$1"\`
`;
                await fs.writeFile(path.join(claudeDir, 'commands', 'spec.md'), specCmd);

                const doneCmd = `---
description: Complete the current specification
---
# Enok Done
Run the following command to finish the spec:
\`enokmethod done "$1"\`
`;
                await fs.writeFile(path.join(claudeDir, 'commands', 'done.md'), doneCmd);

                console.log(chalk.green('✔ Installed Claude Code config (.claude/ & CLAUDE.md)'));
            }

            // 3.5 Adapter: Gemini
            if (options.adapter === 'gemini') {
                await fs.copy(
                    path.join(templatesDir, 'GEMINI.md'),
                    path.join(targetDir, 'GEMINI.md')
                );
                console.log(chalk.green('✔ Installed Gemini config (GEMINI.md)'));
            }

            // 4. Adapter: GitHub Copilot
            if (options.adapter === 'copilot') {
                const githubDir = path.join(targetDir, '.github');
                await fs.ensureDir(githubDir);

                // Read the cursorrules template as base for Copilot instructions
                const cursorRulesPath = path.join(templatesDir, 'cursorrules');
                let copilotContent = await fs.readFile(cursorRulesPath, 'utf8');

                // Adjust header for Copilot
                copilotContent = copilotContent.replace(
                    '# Cursor Rules',
                    '# GitHub Copilot Instructions'
                );

                await fs.writeFile(path.join(githubDir, 'copilot-instructions.md'), copilotContent);
                console.log(
                    chalk.green(
                        '✔ Installed GitHub Copilot config (.github/copilot-instructions.md)'
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

program.parse(process.argv);
