# Project Context (The Constitution)

> **Role**: This file is the single source of truth for the project's technical constraints, architectural patterns, and conventions.
> **Rule**: AI Agents must READ this file before planning or coding.

## 1. Project Overview
<!-- Concise description of what the project does and its core value proposition. -->
- **Name**: [Project Name]
- **Goal**: [One sentence goal]
- **Type**: [e.g., Web App, CLI, Library, Mobile App]

## 2. Tech Stack (Strict)
<!-- Only list technologies actually in use. No "planned" tech. -->
- **Language**: [e.g., TypeScript, Python]
- **Framework**: [e.g., Next.js 14 (App Router), FastAPI]
- **Styling**: [e.g., TailwindCSS, Shadcn UI]
- **Database**: [e.g., Supabase, PostgreSQL,Convex]
- **ORM**: [e.g., Prisma, Drizzle,]
- **State Mgmt**: [e.g., Zustand, React Context]
- **Testing**: [e.g., Vitest, Playwright]

## 3. Core Architecture
<!-- Key architectural decisions. -->
- **Directory Structure**: [e.g., Feature-based, Layer-based]
- **Design Patterns**: [e.g., Repository Pattern, Atomic Design]
- **Key Files**: 
  - `src/lib/utils.ts` (Shared utilities)
  - `src/db/schema.ts` (Database schema)

## 4. Coding Conventions (The "Style")
- **Naming**: [e.g., camelCase for vars, PascalCase for components]
- **Typing**: [e.g., Strict TypeScript, No 'any']
- **Comments**: Only "Why", not "What". JSDoc for public APIs.
- **Error Handling**: [e.g., Use try/catch in server actions, Result pattern]

## 5. Rules of Engagement (For AI)
1.  **Context First**: Always check `MEMORY.md` to see what has been done recently.
2.  **Atomic Changes**: Do not refactor unrelated code.
3.  **No Hallucinations**: If a library is not in "Tech Stack", ASK before installing it.
4.  **Clean Up**: Remove unused imports and files immediately.
