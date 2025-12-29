# EnokMethod

> **Context-First Spec-Driven Development for the AI Era.**

EnokMethod is a minimalist, high-efficiency software development methodology designed for the age of LLMs. It optimizes "Context Energy"—ensuring AI agents (and humans) have exactly the right information at the right time, preventing hallucinations and reducing token costs.

## 🚀 Key Philosophy

1.  **Context is a Battery**: Don't waste it. Feed AI only what it needs.
2.  **Atomic Specs**: Break features down into small, verifiable units.
3.  **Fluid Memory**: The project state flows from `Spec` to `Memory` continuously.
4.  **Tool Agnostic**: Works with Cursor, Claude Code, GitHub Copilot, or raw LLMs.

---

## 📦 Installation

You don't need to publish to npm. Install directly from source using this one-liner:

```bash
curl -sSL https://raw.githubusercontent.com/yacoubakone/enokMethode/main/scripts/install.sh | bash
```

*Prerequisites: Node.js (v18+) and Git must be installed.*

---

## 🛠 Quick Start Guides

Choose your AI tool below to see the specific workflow.

### 🤖 Workflow for Claude Code (CLI)

Claude Code is fully supported with custom Agents and Slash Commands.

**1. Initialize**
```bash
enokmethod init --adapter claude
```
*This detects your tech stack and installs agents in `.claude/`.*

**2. Start a Feature (Slash Command)**
Use the custom slash command to create a spec:
```bash
/spec "Add a dark mode toggle"
```

**3. The Agent Loop**
Use the specialized agents to do the work:
*   **Architect** (Refine the need):
    ```bash
    /agent architect "I need a dark mode toggle. Check CONTEXT.md and refine the spec."
    ```
*   **Tech Lead** (Plan the code):
    ```bash
    /agent tech-lead "Create the implementation plan for the current spec."
    ```
*   **Developer** (Code it):
    ```bash
    /agent developer "Execute the plan."
    ```

**4. Finish**
Archive the spec and update memory:
```bash
/done "Dark Mode"
```

---

### 🖱️ Workflow for Cursor (IDE)

Cursor integration relies on the `.cursorrules` file which acts as a permanent "Meta-Agent".

**1. Initialize**
```bash
enokmethod init
```
*This installs `.cursorrules` and the `.enokMethod` folder.*

**2. Start a Feature**
Open your terminal inside Cursor:
```bash
enokmethod spec "Add a dark mode toggle"
```

**3. The Chat Loop**
Open `CURRENT_SPEC.md` and the Chat (Ctrl+L):
*   **Plan**: "Read the current spec and generate the steps in the Implementation Plan section."
*   **Code**: "Implement the first step of the plan." (Iterate until done).

**4. Finish**
```bash
enokmethod done "Dark Mode"
```

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

**2. Setup Context**
Upload `GEMINI.md` (or `AGENT.md`) + `CONTEXT.md` + `MEMORY.md` to your LLM session.

**3. Start & Finish**
Use the CLI commands manually in your terminal:
```bash
enokmethod spec "My Feature"
# ... Chat with LLM to code ...
enokmethod done "My Feature"
```

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