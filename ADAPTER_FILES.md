# Différenciation des Templates par Outil AI

Ce document résume les structures spécifiques générées pour chaque outil AI, basées sur leurs conventions officielles (décembre 2025).

## 📊 Comparaison des Structures

| Outil | Structure | Format | Spécificités |
|-------|-----------|--------|--------------|
| **Claude Code** | `.claude/agents/` + `.claude/commands/` | Markdown + YAML frontmatter | Agents avec `tools`, Commands avec description |
| **Cursor** | `.cursor/rules/` + `.cursorrules` | `.mdc` (Markdown Components) | Frontmatter avec `globs`, `alwaysApply` |
| **GitHub Copilot** | `.github/copilot-instructions.md` + `*.instructions.md` | Markdown simple | Instructions par rôle séparées |
| **Windsurf** | `.windsurf/rules/` + `.windsurfrules` | Markdown simple | Limite 6000 car/fichier, 12000 total |
| **Aider** | `.aider/prompts/` + `CONVENTIONS.md` | YAML + Markdown | `--read CONVENTIONS.md` |
| **Gemini** | `GEMINI.md` | Markdown simple | System Instructions via interface |
| **General** | `AGENT.md` | Markdown simple | Guide universel |

---

## 🤖 Claude Code (`--adapter claude`)

### Structure
```
.claude/
├── agents/
│   ├── architect.md      # YAML frontmatter + prompt
│   ├── tech-lead.md
│   ├── developer.md
│   ├── reviewer.md
│   ├── documenter.md
│   └── debugger.md
└── commands/
    ├── spec.md           # YAML frontmatter + instructions
    ├── done.md
    ├── status.md
    ├── validate.md
    ├── context.md
    ├── memory.md
    ├── list.md
    └── commit.md
CLAUDE.md                 # Guide principal
```

### Format des Agents
```markdown
---
description: EnokMethod architect agent
tools: ["bash", "grep_glob", "edit", "read_file"]
---

# Architect Role

[Contenu du prompt]
```

### Format des Commands
```markdown
---
description: Create a new specification using EnokMethod
---
# Enok Spec
Run the following command to create a spec:
`enokmethod spec "$1"`
```

---

## 🖱️ Cursor (`--adapter cursor`)

### Structure
```
.cursor/
└── rules/
    ├── enokmethod.mdc    # Règle principale (alwaysApply: true)
    ├── architect.mdc     # Règle par rôle
    ├── developer.mdc
    └── reviewer.mdc
.cursorrules              # Legacy (rétrocompatibilité)
```

### Format .mdc (Nouveau format 2025)
```markdown
---
description: EnokMethod Project Rules
globs: ["**/*"]
alwaysApply: true
---

# EnokMethod

[Contenu des règles]
```

### Caractéristiques
- **globs**: Patterns de fichiers pour activer la règle
- **alwaysApply**: true = toujours inclus, false = à la demande
- **description**: Important pour les règles "Agent Requested"

---

## 🐙 GitHub Copilot (`--adapter copilot`)

### Structure
```
.github/
├── copilot-instructions.md    # Instructions principales
├── architect.instructions.md  # Par rôle
├── developer.instructions.md
├── reviewer.instructions.md
├── debugger.instructions.md
├── documenter.instructions.md
└── tech-lead.instructions.md
```

### Format (Markdown simple)
```markdown
# Architect Role - EnokMethod

You are acting as the **architect** in the EnokMethod workflow.

## Context Files (Always Read First)
- `.enokMethod/CONTEXT.md` - Project tech stack and conventions
- `.enokMethod/MEMORY.md` - Recent activity and history
- `CURRENT_SPEC.md` - Active specification (if exists)

## Your Responsibilities

[Contenu du rôle]
```

### Caractéristiques
- Pas de YAML frontmatter (format simple)
- Les fichiers `.instructions.md` peuvent être conditionnels par glob
- Intégration avec VS Code et Visual Studio

---

## 🌊 Windsurf (`--adapter windsurf`)

### Structure
```
.windsurf/
├── rules/
│   ├── architect.md
│   ├── developer.md
│   ├── reviewer.md
│   ├── debugger.md
│   ├── documenter.md
│   └── tech-lead.md
└── README.md
.windsurfrules            # Règles principales
```

### Format
```markdown
# Windsurf Rules - Architect Role

You are an expert AI developer acting as the **architect** in the EnokMethod workflow.

## Core Context (ALWAYS READ FIRST)

1. **.enokMethod/CONTEXT.md** - Project tech stack
2. **.enokMethod/MEMORY.md** - Recent activity
3. **CURRENT_SPEC.md** - Active specification

## Your Role

[Contenu du rôle]

## EnokMethod Commands

- `enokmethod spec "Title"` - Create new specification
[...]

## Rules of Engagement

1. **Context First**: Always check MEMORY.md
[...]
```

### Caractéristiques
- Limite de 6000 caractères par fichier
- Limite combinée de 12000 caractères
- Cascade: Global → Workspace rules

---

## 🔧 Aider (`--adapter aider`)

### Structure
```
.aider/
├── prompts/
│   ├── architect.md
│   ├── developer.md
│   ├── reviewer.md
│   ├── debugger.md
│   ├── documenter.md
│   └── tech-lead.md
└── README.md
.aider.conf.yml           # Configuration YAML
CONVENTIONS.md            # Standard Aider (projet context)
```

### Format CONVENTIONS.md (Standard Aider)
```markdown
# EnokMethod Conventions

## Context Files

Before making any changes, always read:
- `.enokMethod/CONTEXT.md` - Tech stack and architecture
- `.enokMethod/MEMORY.md` - Recent activity and history
- `CURRENT_SPEC.md` - Active specification (if exists)

## Methodology

You are following the **EnokMethod** - Context-First Spec-Driven Development.

## CLI Commands

```bash
enokmethod spec "title"     # Create new specification
enokmethod done "name"      # Archive completed spec
[...]
```
```

### Format .aider.conf.yml
```yaml
# Aider Configuration for EnokMethod
model: gpt-4
edit-format: diff
auto-commits: true
read:
    - .enokMethod/CONTEXT.md
    - .enokMethod/MEMORY.md
    - CURRENT_SPEC.md
    - CONVENTIONS.md
```

### Caractéristiques
- `CONVENTIONS.md` est le format standard d'Aider
- Chargé automatiquement avec `--read CONVENTIONS.md`
- Prompt caching supporté
- Aliases pour les commandes EnokMethod

---

## 🧠 Gemini (`--adapter gemini`)

### Structure
```
GEMINI.md                 # Guide d'utilisation
```

### Caractéristiques
- Markdown simple
- Uploader avec CONTEXT.md + MEMORY.md dans la session
- System Instructions via l'interface Google AI Studio
- Fenêtre de contexte de 1M tokens (Gemini 2.5 Pro)

---

## 🌐 General (`--adapter general`)

### Structure
```
AGENT.md                  # Guide universel
```

### Caractéristiques
- Format le plus simple
- Compatible avec tout LLM
- Instructions à copier/coller dans le chat

---

## 🎯 Recommandations par cas d'usage

| Cas d'usage | Adapter recommandé | Raison |
|-------------|-------------------|--------|
| CLI avec agents multiples | **Claude** | Agents + Commands séparés |
| IDE avec règles conditionnelles | **Cursor** | Globs et .mdc |
| IDE avec intégration native | **Copilot** | .instructions.md multiples |
| Terminal avec Git intégré | **Aider** | CONVENTIONS.md + aliases |
| IDE flow-state | **Windsurf** | Cascade rules |
| Prototype rapide | **Gemini** | Context window 1M |
| Compatibilité maximale | **General** | Fonctionne partout |

---

## 📚 Sources

- [Claude Code Documentation](https://docs.anthropic.com/claude/docs/coding)
- [Cursor Rules Documentation](https://docs.cursor.com/context/rules-for-ai)
- [GitHub Copilot Custom Instructions](https://docs.github.com/en/copilot)
- [Windsurf Documentation](https://codeium.com/windsurf)
- [Aider Documentation](https://aider.chat/docs/configuration.html)
- [Google AI Studio Documentation](https://ai.google.dev/gemini-api/docs)

---

*Dernière mise à jour: Décembre 2025*
