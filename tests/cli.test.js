import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

const TEST_DIR = path.join(__dirname, 'test-project');
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

describe('CLI Commands', () => {
    beforeEach(async () => {
        await fs.ensureDir(TEST_DIR);
    });

    afterEach(async () => {
        await fs.remove(TEST_DIR);
    });

    describe('init command', () => {
        it('should initialize EnokMethod structure', async () => {
            runCLI('init');

            // Check core structure
            expect(await fs.pathExists(path.join(TEST_DIR, '.enokMethod'))).toBe(true);
            expect(await fs.pathExists(path.join(TEST_DIR, '.enokMethod/CONTEXT.md'))).toBe(true);
            expect(await fs.pathExists(path.join(TEST_DIR, '.enokMethod/MEMORY.md'))).toBe(true);
            expect(await fs.pathExists(path.join(TEST_DIR, '.enokMethod/archive'))).toBe(true);
            expect(await fs.pathExists(path.join(TEST_DIR, '.enokMethod/prompts'))).toBe(true);
        });

        it('should install Cursor adapter by default', async () => {
            runCLI('init');

            expect(await fs.pathExists(path.join(TEST_DIR, '.cursorrules'))).toBe(true);
        });

        it('should install Claude adapter when specified', async () => {
            runCLI('init --adapter claude');

            expect(await fs.pathExists(path.join(TEST_DIR, '.claude'))).toBe(true);
            expect(await fs.pathExists(path.join(TEST_DIR, 'CLAUDE.md'))).toBe(true);
            expect(await fs.pathExists(path.join(TEST_DIR, '.claude/agents'))).toBe(true);
            expect(await fs.pathExists(path.join(TEST_DIR, '.claude/commands'))).toBe(true);
        });

        it('should auto-detect tech stack from package.json', async () => {
            // Create a package.json first
            await fs.writeJson(path.join(TEST_DIR, 'package.json'), {
                dependencies: {
                    next: '^14.0.0',
                    typescript: '^5.0.0',
                    tailwindcss: '^3.0.0',
                },
            });

            runCLI('init');

            const contextContent = await fs.readFile(
                path.join(TEST_DIR, '.enokMethod/CONTEXT.md'),
                'utf8'
            );

            expect(contextContent).toContain('TypeScript');
            expect(contextContent).toContain('Next.js');
            expect(contextContent).toContain('Tailwind CSS');
        });

        it('should not overwrite existing .enokMethod', async () => {
            // First init
            runCLI('init');
            const originalContext = await fs.readFile(
                path.join(TEST_DIR, '.enokMethod/CONTEXT.md'),
                'utf8'
            );

            // Modify CONTEXT.md
            await fs.writeFile(path.join(TEST_DIR, '.enokMethod/CONTEXT.md'), 'MODIFIED CONTENT');

            // Second init
            runCLI('init');

            const newContext = await fs.readFile(
                path.join(TEST_DIR, '.enokMethod/CONTEXT.md'),
                'utf8'
            );

            expect(newContext).toBe('MODIFIED CONTENT');
        });
    });

    describe('spec command', () => {
        beforeEach(async () => {
            runCLI('init');
        });

        it('should create CURRENT_SPEC.md with title', async () => {
            runCLI('spec "Add dark mode toggle"');

            expect(await fs.pathExists(path.join(TEST_DIR, 'CURRENT_SPEC.md'))).toBe(true);

            const specContent = await fs.readFile(path.join(TEST_DIR, 'CURRENT_SPEC.md'), 'utf8');
            expect(specContent).toContain('Add dark mode toggle');
        });

        it('should refuse to overwrite existing CURRENT_SPEC.md', async () => {
            // Create first spec
            runCLI('spec "First spec"');
            const firstContent = await fs.readFile(path.join(TEST_DIR, 'CURRENT_SPEC.md'), 'utf8');

            // Try to create second spec
            const output = runCLI('spec "Second spec"');

            expect(output).toContain('already exists');

            const currentContent = await fs.readFile(
                path.join(TEST_DIR, 'CURRENT_SPEC.md'),
                'utf8'
            );
            expect(currentContent).toBe(firstContent);
        });

        it('should use template structure', async () => {
            runCLI('spec "Test feature"');

            const specContent = await fs.readFile(path.join(TEST_DIR, 'CURRENT_SPEC.md'), 'utf8');

            expect(specContent).toContain('## 1. Objective');
            expect(specContent).toContain('## 2. Detailed Requirements');
            expect(specContent).toContain('## 3. Technical Impact');
            expect(specContent).toContain('## 4. Acceptance Criteria');
            expect(specContent).toContain('## 5. Implementation Plan');
        });
    });

    describe('done command', () => {
        beforeEach(async () => {
            runCLI('init');
            runCLI('spec "Test feature"');
        });

        it('should archive CURRENT_SPEC.md', async () => {
            runCLI('done "Test feature"');

            // CURRENT_SPEC.md should be gone
            expect(await fs.pathExists(path.join(TEST_DIR, 'CURRENT_SPEC.md'))).toBe(false);

            // Should be in archive
            const archiveFiles = await fs.readdir(path.join(TEST_DIR, '.enokMethod/archive'));
            expect(archiveFiles.length).toBe(1);
            expect(archiveFiles[0]).toContain('Test-feature');
        });

        it('should update MEMORY.md', async () => {
            runCLI('done "Test feature"');

            const memoryContent = await fs.readFile(
                path.join(TEST_DIR, '.enokMethod/MEMORY.md'),
                'utf8'
            );

            expect(memoryContent).toContain('Completed: Test feature');
        });

        it('should fail if CURRENT_SPEC.md does not exist', async () => {
            // Remove the spec
            await fs.remove(path.join(TEST_DIR, 'CURRENT_SPEC.md'));

            const output = runCLI('done "Test feature"');

            expect(output).toContain('not found');
        });

        it('should create timestamped archive filename', async () => {
            runCLI('done "My Feature Name"');

            const archiveFiles = await fs.readdir(path.join(TEST_DIR, '.enokMethod/archive'));
            expect(archiveFiles[0]).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-My-Feature-Name\.md$/);
        });
    });

    describe('version and help', () => {
        it('should display version', () => {
            const output = runCLI('--version');
            expect(output).toContain('1.0.0');
        });

        it('should display help', () => {
            const output = runCLI('--help');
            expect(output).toContain('init');
            expect(output).toContain('spec');
            expect(output).toContain('done');
        });
    });
});
