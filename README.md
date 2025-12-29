# EnokMethod

> **Context-First Spec-Driven Development for the AI Era.**

EnokMethod is a minimalist, high-efficiency software development methodology designed for the age of LLMs. It optimizes "Context Energy"—ensuring AI agents (and humans) have exactly the right information at the right time, preventing hallucinations and reducing token costs.

**Philosophy**: The CLI (`enokmethod`) acts as the "Hands" of the AI. Agents are instructed to drive the CLI to manage project state, while you provide the intelligence and validation.

---

## 📦 Installation

Install directly from source using this one-liner:

```bash
curl -sSL https://raw.githubusercontent.com/tky0065/enokMethode/main/scripts/install.sh | bash
```

*Prerequisites: Node.js (v18+) and Git must be installed.*

---

## 🛠 Quick Start Guides

### 🤖 Workflow for Claude Code (CLI)

Claude Code is natively supported via custom Slash Commands.

**1. Initialize**
```bash
enokmethod init --adapter claude
```

**2. The Loop**
*   **Start**: Type `/spec "Add a dark mode toggle"` in the prompt.
*   **Refine**: Type `/agent architect "Refine the requirements"`.
*   **Code**: Type `/agent developer "Implement the plan"`.
*   **Finish**: Type `/done "Dark Mode"`.

---

### 🖱️ Workflow for Cursor (IDE)

Cursor integration is seamless via `.cursorrules`. The Agent knows how to use the terminal.

**1. Initialize**
```bash
enokmethod init
```

**2. The Loop (Chat)**
*   **Start**: Open Composer (Cmd+I) or Chat (Cmd+L) and say: **"New spec: Add dark mode"**.
    *   *The Agent will run `enokmethod spec ...` for you.*
*   **Plan**: Say: **"Plan this spec"**.
    *   *The Agent will read the files and fill the plan.*
*   **Code**: Say: **"Implement"**.
    *   *The Agent will execute the plan.*
*   **Finish**: Say: **"Done"**.
    *   *The Agent will run `enokmethod done ...` to archive it.*

---

### 🧠 Workflow for Gemini / Generic LLMs

For tools like Google AI Studio, ChatGPT, or standard IDEs.

**1. Initialize**
```bash
enokmethod init --adapter gemini
# OR
enokmethod init --adapter general
```
*Creates `GEMINI.md` or `AGENT.md` at the project root.*

**2. Setup**
Upload `GEMINI.md` (or `AGENT.md`) + `CONTEXT.md` + `MEMORY.md` to your LLM session.

**3. Execution**
*   **If the LLM has terminal access**: Tell it "Run the enokmethod spec command for 'Feature X'".
*   **If not**: You run the commands manually in your terminal, and the LLM reads the generated files.

---

## 📂 Structure

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

This is an open methodology. Feel free to open issues or PRs to improve the prompts or CLI tools.
