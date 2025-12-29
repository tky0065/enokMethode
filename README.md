# EnokMethod - Context-First Spec-Driven Development - CFSD

[![npm version](https://img.shields.io/npm/v/enokmethod.svg)](https://www.npmjs.com/package/enokmethod)
[![Tests](https://github.com/tky0065/enokMethode/workflows/Tests/badge.svg)](https://github.com/tky0065/enokMethode/actions/workflows/test.yml)
[![CodeQL](https://github.com/tky0065/enokMethode/workflows/CodeQL%20Analysis/badge.svg)](https://github.com/tky0065/enokMethode/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

> **Context-First Spec-Driven Development for the AI Era.**

EnokMethod is a minimalist, high-efficiency software development methodology designed for the age of LLMs. It optimizes "Context Energy"—ensuring AI agents (and humans) have exactly the right information at the right time, preventing hallucinations and reducing token costs.

**Philosophy**: The CLI (`enokmethod`) acts as the "Hands" of the AI. Agents are instructed to drive the CLI to manage project state, while you provide the intelligence and validation.

## ✨ Key Features

- 🎯 **Simple & Powerful**: 3 core files (CONTEXT, MEMORY, SPEC) vs 21+ agents
- 🤖 **AI-Native**: 7 adapters (Cursor, Claude, Gemini, Copilot, Windsurf, Aider, General)
- 🔍 **Auto-Detection**: Automatically detects your tech stack (JS/TS, Python, Go, Java)
- 📦 **9 CLI Commands**: From `init` to `commit`, everything you need
- 🧠 **6 Agent Prompts**: Architect, Tech-Lead, Developer, Reviewer, Documenter, Debugger
- ✅ **Fully Tested**: 49 tests, 99% coverage, CI/CD with GitHub Actions
- 🚀 **Fast**: Minimal overhead, maximum efficiency
- 🌍 **Language-Agnostic**: Works with any programming language

---

## 📦 Installation

Install directly from source using this one-liner:

```bash
curl -sSL https://raw.githubusercontent.com/tky0065/enokMethode/main/scripts/install.sh | bash
```

_Prerequisites: Node.js (v18+) and Git must be installed._

---

## 🛠 Quick Start Guides

### 🤖 Workflow for Claude Code (CLI)

Claude Code is natively supported via custom Slash Commands.

**1. Initialize**

```bash
enokmethod init --adapter claude
```

**2. The Loop**

- **Start**: Type `/spec "Add a dark mode toggle"` in the prompt.
- **Refine**: Type `/agent architect "Refine the requirements"`.
- **Code**: Type `/agent developer "Implement the plan"`.
- **Finish**: Type `/done "Dark Mode"`.

---

### 🖱️ Workflow for Cursor (IDE)

Cursor integration is seamless via `.cursorrules`. The Agent knows how to use the terminal.

**1. Initialize**

```bash
enokmethod init
```

**2. The Loop (Chat)**

- **Start**: Open Composer (Cmd+I) or Chat (Cmd+L) and say: **"New spec: Add dark mode"**.
    - _The Agent will run `enokmethod spec ...` for you._
- **Plan**: Say: **"Plan this spec"**.
    - _The Agent will read the files and fill the plan._
- **Code**: Say: **"Implement"**.
    - _The Agent will execute the plan._
- **Finish**: Say: **"Done"**.
    - _The Agent will run `enokmethod done ...` to archive it._

---

### 🧠 Workflow for Gemini / Generic LLMs

For tools like Google AI Studio, ChatGPT, or standard IDEs.

**1. Initialize**

```bash
enokmethod init --adapter gemini
# OR
enokmethod init --adapter general
```

_Creates `GEMINI.md` or `AGENT.md` at the project root._

**2. Setup**
Upload `GEMINI.md` (or `AGENT.md`) + `CONTEXT.md` + `MEMORY.md` to your LLM session.

**3. Execution**

- **If the LLM has terminal access**: Tell it "Run the enokmethod spec command for 'Feature X'".
- **If not**: You run the commands manually in your terminal, and the LLM reads the generated files.

---

## � CLI Commands

EnokMethod provides 9 powerful commands:

### Core Commands

```bash
enokmethod init [--adapter <type>]  # Initialize project (7 adapters available)
enokmethod spec <title>             # Create a new specification
enokmethod done <name>              # Archive completed spec
```

### Utility Commands

```bash
enokmethod status                   # Show project status and active spec
enokmethod list [--limit <n>]       # List archived specs (with search)
enokmethod context                  # Display CONTEXT.md
enokmethod memory                   # Display MEMORY.md
enokmethod validate                 # Validate project structure
```

### Git Integration

C```bash
enokmethod commit [-m <msg>]        # Generate conventional commit message
```

**Adapters**: `cursor`, `claude`, `gemini`, `copilot`, `general`, `windsurf`, `aider`

---

## �📂 Structure

```text
.
├── .enokMethod/
│   ├── CONTEXT.md       # The Constitution (Stack, Rules)
│   ├── MEMORY.md        # The Dynamic State (History, Active Tasks)
│   ├── archive/         # Completed Specs history
│   ├── prompts/         # System Prompts for Agents (Architect, Dev...)
│   └── templates/       # Source templates
├── .claude/             # (Optional) Claude Code configuration
├── CURRENT_SPEC.md      # The SINGLE active task (Ephemeral)
└── .cursorrules         # (Optional) Cursor AI rules
```

## 🤝 Contributing

We welcome contributions! EnokMethod is built on simplicity and efficiency.

### Quick Start for Contributors

```bash
# Clone the repo
git clone https://github.com/tky0065/enokMethode.git
cd enokMethode

# Install dependencies
npm install

# Run tests
npm test

# Format code
npm run format
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

MIT © EnokMethod Contributors

## 🔗 Links

- [PRD (Product Requirements)](PRD.md)
- [Improvement Plan](AMELIORATION_PLAN.md)
- [Changelog](CHANGELOG.md)
- [Issues](https://github.com/tky0065/enokMethode/issues)

---

**Made with ❤️ for the AI-Native Development Era**
