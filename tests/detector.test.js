import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { detectTechStack } from '../bin/detector.js';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

describe('Tech Stack Detector', () => {
    beforeEach(async () => {
        await fs.ensureDir(FIXTURES_DIR);
    });

    afterEach(async () => {
        await fs.remove(FIXTURES_DIR);
    });

    describe('JavaScript/TypeScript Detection', () => {
        it('should detect Next.js with TypeScript', async () => {
            const projectDir = path.join(FIXTURES_DIR, 'nextjs-ts');
            await fs.ensureDir(projectDir);
            await fs.writeJson(path.join(projectDir, 'package.json'), {
                dependencies: {
                    next: '^14.0.0',
                    react: '^18.0.0',
                    typescript: '^5.0.0',
                },
            });

            const stack = await detectTechStack(projectDir);

            expect(stack.language).toBe('TypeScript');
            expect(stack.framework).toBe('Next.js');
        });

        it('should detect React with JavaScript', async () => {
            const projectDir = path.join(FIXTURES_DIR, 'react-js');
            await fs.ensureDir(projectDir);
            await fs.writeJson(path.join(projectDir, 'package.json'), {
                dependencies: {
                    react: '^18.0.0',
                    'react-dom': '^18.0.0',
                },
            });

            const stack = await detectTechStack(projectDir);

            expect(stack.language).toBe('JavaScript');
            expect(stack.framework).toBe('React');
        });

        it('should detect Tailwind CSS', async () => {
            const projectDir = path.join(FIXTURES_DIR, 'tailwind');
            await fs.ensureDir(projectDir);
            await fs.writeJson(path.join(projectDir, 'package.json'), {
                dependencies: {
                    react: '^18.0.0',
                },
                devDependencies: {
                    tailwindcss: '^3.0.0',
                },
            });

            const stack = await detectTechStack(projectDir);

            expect(stack.styling).toBe('Tailwind CSS');
        });

        it('should detect Prisma database', async () => {
            const projectDir = path.join(FIXTURES_DIR, 'prisma');
            await fs.ensureDir(projectDir);
            await fs.writeJson(path.join(projectDir, 'package.json'), {
                dependencies: {
                    '@prisma/client': '^5.0.0',
                },
                devDependencies: {
                    prisma: '^5.0.0',
                },
            });

            const stack = await detectTechStack(projectDir);

            expect(stack.database).toBe('Prisma');
        });

        it('should detect Zustand state management', async () => {
            const projectDir = path.join(FIXTURES_DIR, 'zustand');
            await fs.ensureDir(projectDir);
            await fs.writeJson(path.join(projectDir, 'package.json'), {
                dependencies: {
                    react: '^18.0.0',
                    zustand: '^4.0.0',
                },
            });

            const stack = await detectTechStack(projectDir);

            expect(stack.state).toBe('Zustand');
        });

        it('should detect Vitest testing framework', async () => {
            const projectDir = path.join(FIXTURES_DIR, 'vitest');
            await fs.ensureDir(projectDir);
            await fs.writeJson(path.join(projectDir, 'package.json'), {
                devDependencies: {
                    vitest: '^1.0.0',
                },
            });

            const stack = await detectTechStack(projectDir);

            expect(stack.testing).toBe('Vitest');
        });
    });

    describe('Python Detection', () => {
        it('should detect Django from requirements.txt', async () => {
            const projectDir = path.join(FIXTURES_DIR, 'django');
            await fs.ensureDir(projectDir);
            await fs.writeFile(
                path.join(projectDir, 'requirements.txt'),
                'Django==4.2.0\npsycopg2==2.9.0'
            );

            const stack = await detectTechStack(projectDir);

            expect(stack.language).toBe('Python');
            expect(stack.framework).toBe('Django');
        });

        it('should detect FastAPI from pyproject.toml', async () => {
            const projectDir = path.join(FIXTURES_DIR, 'fastapi');
            await fs.ensureDir(projectDir);
            await fs.writeFile(
                path.join(projectDir, 'pyproject.toml'),
                '[tool.poetry.dependencies]\nfastapi = "^0.100.0"\nuvicorn = "^0.23.0"'
            );

            const stack = await detectTechStack(projectDir);

            expect(stack.language).toBe('Python');
            expect(stack.framework).toBe('FastAPI');
        });

        it('should detect SQLAlchemy and pytest', async () => {
            const projectDir = path.join(FIXTURES_DIR, 'python-full');
            await fs.ensureDir(projectDir);
            await fs.writeFile(
                path.join(projectDir, 'requirements.txt'),
                'flask==2.3.0\nsqlalchemy==2.0.0\npytest==7.4.0'
            );

            const stack = await detectTechStack(projectDir);

            expect(stack.language).toBe('Python');
            expect(stack.framework).toBe('Flask');
            expect(stack.database).toBe('SQLAlchemy');
            expect(stack.testing).toBe('pytest');
        });
    });

    describe('Go Detection', () => {
        it('should detect Go with Gin framework', async () => {
            const projectDir = path.join(FIXTURES_DIR, 'go-gin');
            await fs.ensureDir(projectDir);
            await fs.writeFile(
                path.join(projectDir, 'go.mod'),
                'module myapp\n\nrequire github.com/gin-gonic/gin v1.9.0'
            );

            const stack = await detectTechStack(projectDir);

            expect(stack.language).toBe('Go');
            expect(stack.framework).toBe('Gin');
        });

        it('should detect GORM', async () => {
            const projectDir = path.join(FIXTURES_DIR, 'go-gorm');
            await fs.ensureDir(projectDir);
            await fs.writeFile(
                path.join(projectDir, 'go.mod'),
                'module myapp\n\nrequire gorm.io/gorm v1.25.0'
            );

            const stack = await detectTechStack(projectDir);

            expect(stack.language).toBe('Go');
            expect(stack.database).toBe('GORM');
        });
    });

    describe('Java Detection', () => {
        it('should detect Spring Boot from pom.xml', async () => {
            const projectDir = path.join(FIXTURES_DIR, 'spring-boot');
            await fs.ensureDir(projectDir);
            await fs.writeFile(
                path.join(projectDir, 'pom.xml'),
                `<?xml version="1.0"?>
<project>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
</project>`
            );

            const stack = await detectTechStack(projectDir);

            expect(stack.language).toBe('Java');
            expect(stack.framework).toBe('Spring Boot');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty directory', async () => {
            const projectDir = path.join(FIXTURES_DIR, 'empty');
            await fs.ensureDir(projectDir);

            const stack = await detectTechStack(projectDir);

            expect(stack.language).toBeNull();
            expect(stack.framework).toBeNull();
            expect(stack.styling).toBeNull();
            expect(stack.database).toBeNull();
            expect(stack.state).toBeNull();
            expect(stack.testing).toBeNull();
        });

        it('should handle non-existent directory gracefully', async () => {
            const projectDir = path.join(FIXTURES_DIR, 'non-existent');

            const stack = await detectTechStack(projectDir);

            expect(stack).toBeDefined();
            expect(stack.language).toBeNull();
        });

        it('should handle malformed package.json', async () => {
            const projectDir = path.join(FIXTURES_DIR, 'malformed');
            await fs.ensureDir(projectDir);
            await fs.writeFile(path.join(projectDir, 'package.json'), '{ invalid json }');

            const stack = await detectTechStack(projectDir);

            expect(stack).toBeDefined();
            expect(stack.language).toBeNull();
        });
    });
});
