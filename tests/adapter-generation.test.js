import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testDir = path.join(__dirname, 'fixtures', 'adapter-generation-test');
const CLI_PATH = path.join(__dirname, '../bin/enok.js');

describe('Adapter File Generation', () => {
    beforeEach(async () => {
        await fs.ensureDir(testDir);
    });

    afterEach(async () => {
        await fs.remove(testDir);
    });

    describe('Claude Adapter', () => {
        it('should generate 6 agents in .claude/agents/', async () => {
            execSync(`node "${CLI_PATH}" init --adapter claude`, { cwd: testDir });

            const agentsDir = path.join(testDir, '.claude', 'agents');
            const agents = await fs.readdir(agentsDir);

            expect(agents).toHaveLength(6);
            expect(agents).toContain('architect.md');
            expect(agents).toContain('tech-lead.md');
            expect(agents).toContain('developer.md');
            expect(agents).toContain('reviewer.md');
            expect(agents).toContain('documenter.md');
            expect(agents).toContain('debugger.md');
        });

        it('should generate 8 commands in .claude/commands/', async () => {
            execSync(`node "${CLI_PATH}" init --adapter claude`, { cwd: testDir });

            const commandsDir = path.join(testDir, '.claude', 'commands');
            const enokDir = path.join(commandsDir, 'enokMethod'); // New namespace dir
            
            expect(await fs.pathExists(enokDir)).toBe(true);
            const commands = await fs.readdir(enokDir);

            expect(commands).toHaveLength(9);
            expect(commands).toContain('spec.md');
            expect(commands).toContain('done.md');
            expect(commands).toContain('status.md');
            expect(commands).toContain('validate.md');
            expect(commands).toContain('context.md');
            expect(commands).toContain('memory.md');
            expect(commands).toContain('list.md');
            expect(commands).toContain('commit.md');
            expect(commands).toContain('dev.md');
        });

        it('should generate CLAUDE.md guide', async () => {
            execSync(`node "${CLI_PATH}" init --adapter claude`, { cwd: testDir });

            const claudeGuide = path.join(testDir, 'CLAUDE.md');
            expect(await fs.pathExists(claudeGuide)).toBe(true);
        });

        it('agent files should have correct frontmatter', async () => {
            execSync(`node "${CLI_PATH}" init --adapter claude`, { cwd: testDir });

            const architectFile = path.join(testDir, '.claude', 'agents', 'architect.md');
            const content = await fs.readFile(architectFile, 'utf8');

            expect(content).toContain('---');
            expect(content).toContain('description: EnokMethod architect agent');
            expect(content).toContain('tools: ["bash", "grep_glob", "edit", "read_file"]');
        });
    });

    describe('Aider Adapter', () => {
        it('should generate 6 role prompts in .aider/prompts/', async () => {
            execSync(`node "${CLI_PATH}" init --adapter aider`, { cwd: testDir });

            const promptsDir = path.join(testDir, '.aider', 'prompts');
            const prompts = await fs.readdir(promptsDir);

            expect(prompts).toHaveLength(6);
            expect(prompts).toContain('architect.md');
            expect(prompts).toContain('tech-lead.md');
            expect(prompts).toContain('developer.md');
            expect(prompts).toContain('reviewer.md');
            expect(prompts).toContain('documenter.md');
            expect(prompts).toContain('debugger.md');
        });

        it('should generate .aider.conf.yml', async () => {
            execSync(`node "${CLI_PATH}" init --adapter aider`, { cwd: testDir });

            const configFile = path.join(testDir, '.aider.conf.yml');
            expect(await fs.pathExists(configFile)).toBe(true);
        });

        it('should generate README.md in .aider/', async () => {
            execSync(`node "${CLI_PATH}" init --adapter aider`, { cwd: testDir });

            const readme = path.join(testDir, '.aider', 'README.md');
            expect(await fs.pathExists(readme)).toBe(true);

            const content = await fs.readFile(readme, 'utf8');
            expect(content).toContain('Aider + EnokMethod');
            expect(content).toContain('Quick Start');
        });

        it('role prompts should have correct structure', async () => {
            execSync(`node "${CLI_PATH}" init --adapter aider`, { cwd: testDir });

            const developerFile = path.join(testDir, '.aider', 'prompts', 'developer.md');
            const content = await fs.readFile(developerFile, 'utf8');

            expect(content).toContain('# EnokMethod Developer Role');
            expect(content).toContain('## Context Files');
            expect(content).toContain('## Your Role');
            expect(content).toContain('## Workflow');
        });
    });

    describe('Windsurf Adapter', () => {
        it('should generate 6 role rules in .windsurf/rules/', async () => {
            execSync(`node "${CLI_PATH}" init --adapter windsurf`, { cwd: testDir });

            const rulesDir = path.join(testDir, '.windsurf', 'rules');
            const rules = await fs.readdir(rulesDir);

            expect(rules).toHaveLength(6);
            expect(rules).toContain('architect.md');
            expect(rules).toContain('tech-lead.md');
            expect(rules).toContain('developer.md');
            expect(rules).toContain('reviewer.md');
            expect(rules).toContain('documenter.md');
            expect(rules).toContain('debugger.md');
        });

        it('should generate .windsurfrules', async () => {
            execSync(`node "${CLI_PATH}" init --adapter windsurf`, { cwd: testDir });

            const rulesFile = path.join(testDir, '.windsurfrules');
            expect(await fs.pathExists(rulesFile)).toBe(true);
        });

        it('should generate README.md in .windsurf/', async () => {
            execSync(`node "${CLI_PATH}" init --adapter windsurf`, { cwd: testDir });

            const readme = path.join(testDir, '.windsurf', 'README.md');
            expect(await fs.pathExists(readme)).toBe(true);

            const content = await fs.readFile(readme, 'utf8');
            expect(content).toContain('Windsurf + EnokMethod');
            expect(content).toContain('Workflow');
        });

        it('role rules should have correct structure', async () => {
            execSync(`node "${CLI_PATH}" init --adapter windsurf`, { cwd: testDir });

            const reviewerFile = path.join(testDir, '.windsurf', 'rules', 'reviewer.md');
            const content = await fs.readFile(reviewerFile, 'utf8');

            expect(content).toContain('# Windsurf Rules - Reviewer Role');
            expect(content).toContain('## Core Context (ALWAYS READ FIRST)');
            expect(content).toContain('## Your Role');
            expect(content).toContain('## EnokMethod Commands');
            expect(content).toContain('## Rules of Engagement');
        });
    });

    describe('All Adapters', () => {
        it('should always generate core .enokMethod structure', async () => {
            const adapters = ['claude', 'aider', 'windsurf', 'cursor', 'copilot', 'gemini', 'general'];

            for (const adapter of adapters) {
                await fs.remove(testDir);
                await fs.ensureDir(testDir);

                execSync(`node "${CLI_PATH}" init --adapter ${adapter}`, { cwd: testDir });

                // Check core structure
                expect(await fs.pathExists(path.join(testDir, '.enokMethod'))).toBe(true);
                expect(await fs.pathExists(path.join(testDir, '.enokMethod', 'CONTEXT.md'))).toBe(true);
                expect(await fs.pathExists(path.join(testDir, '.enokMethod', 'MEMORY.md'))).toBe(true);
                expect(await fs.pathExists(path.join(testDir, '.enokMethod', 'archive'))).toBe(true);
                expect(await fs.pathExists(path.join(testDir, '.enokMethod', 'prompts'))).toBe(true);

                // Check prompts directory has 6 files
                const promptsDir = path.join(testDir, '.enokMethod', 'prompts');
                const prompts = await fs.readdir(promptsDir);
                expect(prompts).toHaveLength(7);
            }
        });
    });

    describe('File Content Validation', () => {
        it('should include original prompt content in generated files', async () => {
            execSync(`node "${CLI_PATH}" init --adapter claude`, { cwd: testDir });

            // Read original prompt
            const originalPrompt = await fs.readFile(
                path.join(testDir, '.enokMethod', 'prompts', 'architect.md'),
                'utf8'
            );

            // Read generated agent file
            const generatedAgent = await fs.readFile(
                path.join(testDir, '.claude', 'agents', 'architect.md'),
                'utf8'
            );

            // The generated file should contain the original prompt content
            expect(generatedAgent).toContain(originalPrompt.trim());
        });

        it('should wrap prompts correctly for Aider', async () => {
            execSync(`node "${CLI_PATH}" init --adapter aider`, { cwd: testDir });

            const generatedPrompt = await fs.readFile(
                path.join(testDir, '.aider', 'prompts', 'developer.md'),
                'utf8'
            );

            // Should have Aider-specific wrapper
            expect(generatedPrompt).toContain('# EnokMethod Developer Role');
            expect(generatedPrompt).toContain('You are acting as the **developer**');
            expect(generatedPrompt).toContain('.enokMethod/CONTEXT.md');
        });

        it('should wrap rules correctly for Windsurf', async () => {
            execSync(`node "${CLI_PATH}" init --adapter windsurf`, { cwd: testDir });

            const generatedRule = await fs.readFile(
                path.join(testDir, '.windsurf', 'rules', 'tech-lead.md'),
                'utf8'
            );

            // Should have Windsurf-specific wrapper
            expect(generatedRule).toContain('# Windsurf Rules - Tech-lead Role');
            expect(generatedRule).toContain('You are an expert AI developer acting as the **tech-lead**');
            expect(generatedRule).toContain('enokmethod spec');
        });
    });
});
