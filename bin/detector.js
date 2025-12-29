const fs = require('fs-extra');
const path = require('path');

async function detectTechStack(targetDir) {
    const stack = {
        language: null,
        framework: null,
        styling: null,
        database: null,
        state: null,
        testing: null,
    };

    try {
        // 1. NODE.JS / JS / TS
        if (await fs.pathExists(path.join(targetDir, 'package.json'))) {
            const pkg = await fs.readJson(path.join(targetDir, 'package.json'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            const depNames = Object.keys(deps);

            // Language
            if (deps.typescript) stack.language = 'TypeScript';
            else stack.language = 'JavaScript';

            // Frameworks
            if (deps.next) stack.framework = 'Next.js';
            else if (deps.react) stack.framework = 'React';
            else if (deps.vue) stack.framework = 'Vue.js';
            else if (deps.nuxt) stack.framework = 'Nuxt.js';
            else if (deps.express) stack.framework = 'Express.js';
            else if (deps.nest) stack.framework = 'NestJS';
            else if (deps['@angular/core']) stack.framework = 'Angular';
            else if (deps.svelte) stack.framework = 'Svelte';

            // Styling
            if (deps.tailwindcss) stack.styling = 'Tailwind CSS';
            else if (deps.bootstrap) stack.styling = 'Bootstrap';
            else if (deps['styled-components']) stack.styling = 'Styled Components';
            else if (deps.sass || deps.scss) stack.styling = 'Sass';

            // Database / ORM
            if (deps.prisma) stack.database = 'Prisma';
            else if (deps.mongoose) stack.database = 'Mongoose (MongoDB)';
            else if (deps.pg) stack.database = 'PostgreSQL (pg)';
            else if (deps.firebase) stack.database = 'Firebase';
            else if (deps['@supabase/supabase-js']) stack.database = 'Supabase';

            // State
            if (deps.redux || deps['@reduxjs/toolkit']) stack.state = 'Redux';
            else if (deps.zustand) stack.state = 'Zustand';
            else if (deps.pinia) stack.state = 'Pinia';
            else if (deps.recoil) stack.state = 'Recoil';

            // Testing
            if (deps.jest) stack.testing = 'Jest';
            else if (deps.vitest) stack.testing = 'Vitest';
            else if (deps.cypress) stack.testing = 'Cypress';
            else if (deps.playwright) stack.testing = 'Playwright';
        }

        // 2. PYTHON
        else if (
            (await fs.pathExists(path.join(targetDir, 'requirements.txt'))) ||
            (await fs.pathExists(path.join(targetDir, 'pyproject.toml')))
        ) {
            stack.language = 'Python';

            let content = '';
            if (await fs.pathExists(path.join(targetDir, 'requirements.txt'))) {
                content = await fs
                    .readFile(path.join(targetDir, 'requirements.txt'), 'utf8')
                    .then((c) => c.toLowerCase());
            } else {
                content = await fs
                    .readFile(path.join(targetDir, 'pyproject.toml'), 'utf8')
                    .then((c) => c.toLowerCase());
            }

            if (content.includes('django')) stack.framework = 'Django';
            else if (content.includes('fastapi')) stack.framework = 'FastAPI';
            else if (content.includes('flask')) stack.framework = 'Flask';

            if (content.includes('sqlalchemy')) stack.database = 'SQLAlchemy';
            if (content.includes('pytest')) stack.testing = 'pytest';
        }

        // 3. GO
        else if (await fs.pathExists(path.join(targetDir, 'go.mod'))) {
            stack.language = 'Go';
            const content = await fs.readFile(path.join(targetDir, 'go.mod'), 'utf8');

            if (content.includes('gin-gonic')) stack.framework = 'Gin';
            else if (content.includes('gofiber')) stack.framework = 'Fiber';
            else if (content.includes('echo')) stack.framework = 'Echo';

            if (content.includes('gorm')) stack.database = 'GORM';
            if (content.includes('sqlx')) stack.database = 'sqlx';
        }

        // 4. JAVA / SPRING
        else if (
            (await fs.pathExists(path.join(targetDir, 'pom.xml'))) ||
            (await fs.pathExists(path.join(targetDir, 'build.gradle')))
        ) {
            stack.language = 'Java';
            // Simple check, reading XML/Gradle is complex, assuming Spring if common files exist
            const content = (await fs.pathExists(path.join(targetDir, 'pom.xml')))
                ? await fs.readFile(path.join(targetDir, 'pom.xml'), 'utf8')
                : await fs.readFile(path.join(targetDir, 'build.gradle'), 'utf8');

            if (content.includes('spring-boot')) stack.framework = 'Spring Boot';
            if (content.includes('hibernate')) stack.database = 'Hibernate';
            if (content.includes('junit')) stack.testing = 'JUnit';
        }
    } catch (error) {
        // Silently fail on detection errors, return what we found so far
        console.error('Detection warning:', error.message);
    }

    return stack;
}

module.exports = { detectTechStack };
