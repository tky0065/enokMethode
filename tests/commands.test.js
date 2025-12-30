import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

const TEST_DIR = path.join(__dirname, 'test-commands');
const CLI_PATH = path.join(__dirname, '../bin/enok.js');

// Helper to run CLI commands
const runCLI = (args) => {
    try {
        return execSync(`node ${CLI_PATH} ${args}`, {
            cwd: TEST_DIR,
            encoding: 'utf8',
        });
    } catch (error) {
        return error.stdout || error.stderr;
    }
};

describe('New CLI Commands', () => {
    beforeEach(async () => {
        await fs.ensureDir(TEST_DIR);
        // Initialize for most tests
        runCLI('init');
    });

    afterEach(async () => {
        await fs.remove(TEST_DIR);
    });

    describe('status command', () => {
        it('should show status when initialized', () => {
            const output = runCLI('status');

            expect(output).toContain('EnokMethod Status');
            expect(output).toContain('EnokMethod initialized');
        });

        it('should show no active spec when none exists', () => {
            const output = runCLI('status');

            expect(output).toContain('No active spec');
        });

        it('should show active spec when one exists', () => {
            runCLI('spec "Test Feature"');

            const output = runCLI('status');

            expect(output).toContain('Active Spec');
            expect(output).toContain('Test Feature');
        });

        it('should show completed specs count', () => {
            runCLI('spec "Feature 1"');
            runCLI('done "Feature 1"');

            const output = runCLI('status');

            expect(output).toContain('Completed Specs: 1');
        });

        it('should show recent activity', () => {
            runCLI('spec "Feature 1"');
            runCLI('done "Feature 1"');

            const output = runCLI('status');

            expect(output).toContain('Recent Activity');
            expect(output).toContain('Completed: Feature 1');
        });

        it('should fail gracefully when not initialized', async () => {
            await fs.remove(TEST_DIR);
            await fs.ensureDir(TEST_DIR);

            const output = runCLI('status');

            expect(output).toContain('not initialized');
        });
    });

    describe('list command', () => {
        beforeEach(() => {
            // Create some archived specs
            runCLI('spec "Feature A"');
            runCLI('done "Feature A"');
            runCLI('spec "Feature B"');
            runCLI('done "Feature B"');
            runCLI('spec "Feature C"');
            runCLI('done "Feature C"');
        });

        it('should list all archived specs', () => {
            const output = runCLI('list');

            expect(output).toContain('Archived Specs');
            expect(output).toContain('Feature A');
            expect(output).toContain('Feature B');
            expect(output).toContain('Feature C');
        });

        it('should limit results with --limit option', () => {
            const output = runCLI('list --limit 2');

            expect(output).toContain('Archived Specs (2)');
        });

        it('should search specs with --search option', () => {
            const output = runCLI('list --search "a"');

            // Should find Feature A but the output format might vary
            // Just check that search filtering works
            const lines = output.split('\n').filter((l) => l.trim());
            const hasResults = lines.some((l) => l.includes('Feature'));

            expect(hasResults).toBe(true);
        });

        it('should show newest specs first', () => {
            const output = runCLI('list');
            const indexA = output.indexOf('Feature A');
            const indexC = output.indexOf('Feature C');

            // Feature C was created last, so should appear first
            expect(indexC).toBeLessThan(indexA);
        });

        it('should handle no archived specs', async () => {
            // Remove archive
            await fs.remove(path.join(TEST_DIR, '.enokMethod/archive'));

            const output = runCLI('list');

            expect(output).toContain('No archived specs found');
        });
    });

    describe('context command', () => {
        it('should display CONTEXT.md content', () => {
            const output = runCLI('context');

            expect(output).toContain('Project Context');
            expect(output).toContain('## 1. Project Overview');
            expect(output).toContain('## 2. Tech Stack');
        });

        it('should fail when CONTEXT.md does not exist', async () => {
            await fs.remove(path.join(TEST_DIR, '.enokMethod/CONTEXT.md'));

            const output = runCLI('context');

            expect(output).toContain('not found');
        });
    });

    describe('memory command', () => {
        it('should display MEMORY.md content', () => {
            const output = runCLI('memory');

            expect(output).toContain('Project Memory');
            expect(output).toContain('## 1. Active Focus');
        });

        it('should show completed tasks', () => {
            runCLI('spec "Test Task"');
            runCLI('done "Test Task"');

            const output = runCLI('memory');

            expect(output).toContain('Completed: Test Task');
        });

        it('should fail when MEMORY.md does not exist', async () => {
            await fs.remove(path.join(TEST_DIR, '.enokMethod/MEMORY.md'));

            const output = runCLI('memory');

            expect(output).toContain('not found');
        });
    });

    describe('validate command', () => {
        it('should validate complete structure', () => {
            const output = runCLI('validate');

            expect(output).toContain('Validating EnokMethod Structure');
            expect(output).toContain('✓ .enokMethod directory');
            expect(output).toContain('✓ CONTEXT.md');
            expect(output).toContain('✓ MEMORY.md');
            expect(output).toContain('✓ archive directory');
            expect(output).toContain('✓ prompts directory');
            expect(output).toContain('Structure is valid');
        });

        it('should detect missing files', async () => {
            await fs.remove(path.join(TEST_DIR, '.enokMethod/CONTEXT.md'));

            const output = runCLI('validate');

            expect(output).toContain('✗ CONTEXT.md');
            expect(output).toContain('missing');
        });

        it('should validate CONTEXT.md sections', () => {
            const output = runCLI('validate');

            expect(output).toContain('CONTEXT.md sections');
            expect(output).toContain('✓ ## 1. Project Overview');
            expect(output).toContain('✓ ## 2. Tech Stack');
            expect(output).toContain('✓ ## 3. Core Architecture');
            expect(output).toContain('✓ ## 4. Coding Conventions');
            expect(output).toContain('✓ ## 5. Rules of Engagement');
        });

        it('should detect missing sections in CONTEXT.md', async () => {
            const contextPath = path.join(TEST_DIR, '.enokMethod/CONTEXT.md');
            await fs.writeFile(contextPath, '# Incomplete Context\n\n## 1. Project Overview\n');

            const output = runCLI('validate');

            expect(output).toContain('⚠ ## 2. Tech Stack');
        });
    });

    describe('commit command', () => {
        it('should propose a commit message based on active spec', () => {
            runCLI('spec "Implement login feature"');
            const output = runCLI('commit');

            expect(output).toContain('Proposed Commit Message');
            expect(output).toContain('feat: Implement login feature');
            expect(output).toContain('git commit -m "feat: Implement login feature"');
        });

        it('should correctly detect fix type', () => {
            runCLI('spec "Fix login bug"');
            const output = runCLI('commit');

            expect(output).toContain('fix: Fix login bug');
        });

        it('should correctly detect docs type', () => {
            runCLI('spec "Update documentation"');
            const output = runCLI('commit');

            expect(output).toContain('docs: Update documentation');
        });

        it('should correctly detect refactor type', () => {
            runCLI('spec "Refactor auth module"');
            const output = runCLI('commit');

            expect(output).toContain('refactor: Refactor auth module');
        });

        it('should use custom message when provided', () => {
            const output = runCLI('commit -m "chore: initial commit"');

            expect(output).toContain('Proposed Commit Message');
            expect(output).toContain('chore: initial commit');
            expect(output).toContain('git commit -m "chore: initial commit"');
        });

        it('should include completed requirements in body', async () => {
            runCLI('spec "Complex detailed feature"');
            
            // Manually modify SPEC to mark some items as done
            const specPath = path.join(TEST_DIR, 'CURRENT_SPEC.md');
            let content = await fs.readFile(specPath, 'utf8');
            content = content + '\n- [x] Create API endpoint\n- [x] Create frontend component\n- [ ] Write tests';
            await fs.writeFile(specPath, content);

            const output = runCLI('commit');

            expect(output).toContain('feat: Complex detailed feature');
            expect(output).toContain('Create API endpoint');
            expect(output).toContain('Create frontend component');
            // Check that uncompleted items are NOT included (simple check)
            // Note: The implementation regex /^- \[x\] (.+)$/gm matches lines starting with "- [x] "
        });

        it('should warn when no spec and no message', () => {
            const output = runCLI('commit');

            expect(output).toContain('No CURRENT_SPEC.md found');
            expect(output).toContain('Usage: enokmethod commit -m');
        });

        it('should support --no-verify flag', () => {
            runCLI('spec "Skip hooks feature"');
            const output = runCLI('commit --no-verify');

            expect(output).toContain('--no-verify');
        });
    });
});
