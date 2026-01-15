# opencode-lean

A lean OpenCode plugin with essential features. No bloat.

## Features

### Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| `frontend-ui-ux` | gpt-5.2-codex | Designer-developer for stunning UI |
| `explore` | minimax-m2 | Fast codebase exploration |
| `librarian` | glm-4.7-free | External docs & GitHub search |

### MCPs

| MCP | Purpose | Auth |
|-----|---------|------|
| `websearch` | Exa web search | `EXA_API_KEY` |
| `context7` | Library docs | - |
| `grep_app` | GitHub code search | - |

### Hooks

| Hook | Purpose |
|------|---------|
| `edit-error-recovery` | Helps AI recover from edit mistakes |
| `tool-output-truncator` | Prevents context overflow |
| `empty-message-sanitizer` | Prevents API errors |
| `rules-injector` | Injects `.opencode/rules` |
| `directory-agents-injector` | Injects `AGENTS.md` |

## Installation

```bash
bun install
bun run build
```

## Usage

```json
{
  "plugins": {
    "opencode-lean": {
      "path": "./opencode-lean/dist/index.js"
    }
  }
}
```

## Configuration

Create `opencode-lean.json`:

```json
{
  "disabled_hooks": ["tool-output-truncator"],
  "disabled_mcps": ["websearch"],
  "agent_overrides": {
    "explore": { "model": "anthropic/claude-sonnet-4" }
  }
}
```

## Structure

```
opencode-lean/
├── src/
│   ├── index.ts           # Plugin entry
│   ├── agents/
│   │   ├── index.ts       # Agent factory
│   │   └── prompts/       # Agent prompts
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── edit-error-recovery.ts
│   │   ├── tool-output-truncator.ts
│   │   ├── empty-message-sanitizer.ts
│   │   ├── rules-injector.ts
│   │   └── directory-agents-injector.ts
│   └── mcp/
│       └── index.ts       # MCP configs
├── package.json
└── tsconfig.json
```

## License

MIT
