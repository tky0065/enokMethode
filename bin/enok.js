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

program.parse(process.argv);
