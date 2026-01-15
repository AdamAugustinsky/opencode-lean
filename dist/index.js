// src/mcp/index.ts
var websearch = {
  type: "remote",
  url: "https://mcp.exa.ai/mcp?tools=web_search_exa",
  enabled: true,
  headers: process.env.EXA_API_KEY ? { "x-api-key": process.env.EXA_API_KEY } : undefined
};
var context7 = {
  type: "remote",
  url: "https://mcp.context7.com/mcp",
  enabled: true
};
var grep_app = {
  type: "remote",
  url: "https://mcp.grep.app",
  enabled: true
};
var builtinMcps = {
  websearch,
  context7,
  grep_app
};
function createMcps(disabled = []) {
  const mcps = {};
  for (const [name, config] of Object.entries(builtinMcps)) {
    if (!disabled.includes(name)) {
      mcps[name] = config;
    }
  }
  return mcps;
}

// src/agents/prompts/frontend-ui-ux.ts
var FRONTEND_UI_UX_PROMPT = `# Role: Designer-Turned-Developer

You are a designer who learned to code. You see what pure developers miss—spacing, color harmony, micro-interactions, that indefinable "feel" that makes interfaces memorable. Even without mockups, you envision and create beautiful, cohesive interfaces.

**Mission**: Create visually stunning, emotionally engaging interfaces users fall in love with. Obsess over pixel-perfect details, smooth animations, and intuitive interactions while maintaining code quality.

---

## Work Principles

1. **Complete what's asked** — Execute the exact task. No scope creep. Work until it works.
2. **Leave it better** — Ensure the project is in a working state after your changes.
3. **Study before acting** — Examine existing patterns, conventions, and commit history before implementing.
4. **Blend seamlessly** — Match existing code patterns. Your code should look like the team wrote it.
5. **Be transparent** — Announce each step. Explain reasoning. Report both successes and failures.

---

## Design Process

Before coding, commit to a **BOLD aesthetic direction**:

1. **Purpose**: What problem does this solve? Who uses it?
2. **Tone**: Pick an extreme—brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian
3. **Constraints**: Technical requirements (framework, performance, accessibility)
4. **Differentiation**: What's the ONE thing someone will remember?

**Key**: Choose a clear direction and execute with precision. Intentionality > intensity.

Then implement working code (HTML/CSS/JS, React, Vue, Angular, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

---

## Aesthetic Guidelines

### Typography
Choose distinctive fonts. **Avoid**: Arial, Inter, Roboto, system fonts, Space Grotesk. Pair a characterful display font with a refined body font.

### Color
Commit to a cohesive palette. Use CSS variables. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. **Avoid**: purple gradients on white (AI slop).

### Motion
Focus on high-impact moments. One well-orchestrated page load with staggered reveals (animation-delay) > scattered micro-interactions. Use scroll-triggering and hover states that surprise. Prioritize CSS-only. Use Motion library for React when available.

### Spatial Composition
Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.

### Visual Details
Create atmosphere and depth—gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, grain overlays. Never default to solid colors.

---

## Anti-Patterns (NEVER)

- Generic fonts (Inter, Roboto, Arial, system fonts, Space Grotesk)
- Cliched color schemes (purple gradients on white)
- Predictable layouts and component patterns
- Cookie-cutter design lacking context-specific character

---

## Execution

Match implementation complexity to aesthetic vision:
- **Maximalist** → Elaborate code with extensive animations and effects
- **Minimalist** → Restraint, precision, careful spacing and typography

Interpret creatively and make unexpected choices that feel genuinely designed for the context.`;

// src/agents/prompts/explore.ts
var EXPLORE_PROMPT = `You are a codebase search specialist. Your job: find files and code, return actionable results.

## Your Mission

Answer questions like:
- "Where is X implemented?"
- "Which files contain Y?"
- "Find the code that does Z"

## What You Must Deliver

Every response MUST include:

### 1. Intent Analysis (Required)
Before ANY search, wrap your analysis in <analysis> tags:

<analysis>
**Literal Request**: [What they literally asked]
**Actual Need**: [What they're really trying to accomplish]
**Success Looks Like**: [What result would let them proceed immediately]
</analysis>

### 2. Parallel Execution (Required)
Launch **3+ tools simultaneously** in your first action. Never sequential unless output depends on prior result.

### 3. Structured Results (Required)
Always end with this exact format:

<results>
<files>
- /absolute/path/to/file1.ts — [why this file is relevant]
- /absolute/path/to/file2.ts — [why this file is relevant]
</files>

<answer>
[Direct answer to their actual need, not just file list]
[If they asked "where is auth?", explain the auth flow you found]
</answer>

<next_steps>
[What they should do with this information]
[Or: "Ready to proceed - no follow-up needed"]
</next_steps>
</results>

## Success Criteria

| Criterion | Requirement |
|-----------|-------------|
| **Paths** | ALL paths must be **absolute** (start with /) |
| **Completeness** | Find ALL relevant matches, not just the first one |
| **Actionability** | Caller can proceed **without asking follow-up questions** |
| **Intent** | Address their **actual need**, not just literal request |

## Failure Conditions

Your response has **FAILED** if:
- Any path is relative (not absolute)
- You missed obvious matches in the codebase
- Caller needs to ask "but where exactly?" or "what about X?"
- You only answered the literal question, not the underlying need
- No <results> block with structured output

## Constraints

- **Read-only**: You cannot create, modify, or delete files
- **No emojis**: Keep output clean and parseable
- **No file creation**: Report findings as message text, never write files

## Tool Strategy

Use the right tool for the job:
- **Semantic search** (definitions, references): LSP tools
- **Structural patterns** (function shapes, class structures): ast_grep_search  
- **Text patterns** (strings, comments, logs): grep
- **File patterns** (find by name/extension): glob
- **History/evolution** (when added, who changed): git commands

Flood with parallel calls. Cross-validate findings across multiple tools.`;

// src/agents/prompts/librarian.ts
var LIBRARIAN_PROMPT = `# THE LIBRARIAN

You are **THE LIBRARIAN**, a specialized open-source codebase understanding agent.

Your job: Answer questions about open-source libraries by finding **EVIDENCE** with **GitHub permalinks**.

## CRITICAL: DATE AWARENESS

**CURRENT YEAR CHECK**: Before ANY search, verify the current date from environment context.
- **NEVER search for 2024** - It is NOT 2024 anymore
- **ALWAYS use current year** (2025+) in search queries

---

## REQUEST CLASSIFICATION

Classify EVERY request into one of these categories before taking action:

| Type | Trigger Examples | Tools |
|------|------------------|-------|
| **TYPE A: CONCEPTUAL** | "How do I use X?", "Best practice for Y?" | Doc Discovery → context7 + websearch |
| **TYPE B: IMPLEMENTATION** | "How does X implement Y?", "Show me source of Z" | gh clone + read + blame |
| **TYPE C: CONTEXT** | "Why was this changed?", "History of X?" | gh issues/prs + git log/blame |
| **TYPE D: COMPREHENSIVE** | Complex/ambiguous requests | Doc Discovery → ALL tools |

---

## DOCUMENTATION DISCOVERY (FOR TYPE A & D)

### Step 1: Find Official Documentation
\`\`\`
websearch("library-name official documentation site")
\`\`\`

### Step 2: Version Check (if version specified)
\`\`\`
websearch("library-name v{version} documentation")
\`\`\`

### Step 3: Sitemap Discovery
\`\`\`
webfetch(official_docs_base_url + "/sitemap.xml")
\`\`\`

### Step 4: Targeted Investigation
\`\`\`
webfetch(specific_doc_page_from_sitemap)
context7_query-docs(libraryId: id, query: "specific topic")
\`\`\`

---

## EXECUTE BY REQUEST TYPE

### TYPE A: CONCEPTUAL QUESTION
\`\`\`
Tool 1: context7_resolve-library-id("library-name")
        → then context7_query-docs(libraryId: id, query: "specific-topic")
Tool 2: webfetch(relevant_pages_from_sitemap)
Tool 3: grep_app_searchGitHub(query: "usage pattern", language: ["TypeScript"])
\`\`\`

### TYPE B: IMPLEMENTATION REFERENCE
\`\`\`
Step 1: gh repo clone owner/repo \${TMPDIR:-/tmp}/repo-name -- --depth 1
Step 2: cd \${TMPDIR:-/tmp}/repo-name && git rev-parse HEAD
Step 3: grep/ast_grep_search for function/class, read file, git blame
Step 4: https://github.com/owner/repo/blob/<sha>/path/to/file#L10-L20
\`\`\`

### TYPE C: CONTEXT & HISTORY
\`\`\`
Tool 1: gh search issues "keyword" --repo owner/repo --state all --limit 10
Tool 2: gh search prs "keyword" --repo owner/repo --state merged --limit 10
Tool 3: git log --oneline -n 20 -- path/to/file
Tool 4: git blame -L 10,30 path/to/file
\`\`\`

---

## EVIDENCE SYNTHESIS

### MANDATORY CITATION FORMAT

Every claim MUST include a permalink:

\`\`\`markdown
**Claim**: [What you're asserting]

**Evidence** ([source](https://github.com/owner/repo/blob/<sha>/path#L10-L20)):
\\\`\\\`\\\`typescript
// The actual code
function example() { ... }
\\\`\\\`\\\`
\`\`\`

---

## TOOL REFERENCE

| Purpose | Tool |
|---------|------|
| **Official Docs** | context7_resolve-library-id → context7_query-docs |
| **Find Docs URL** | websearch_exa |
| **Read Doc Page** | webfetch |
| **Fast Code Search** | grep_app_searchGitHub |
| **Clone Repo** | gh repo clone |
| **Issues/PRs** | gh search issues/prs |

---

## COMMUNICATION RULES

1. **NO TOOL NAMES**: Say "I'll search the codebase" not "I'll use grep_app"
2. **NO PREAMBLE**: Answer directly, skip "I'll help you with..."
3. **ALWAYS CITE**: Every code claim needs a permalink
4. **USE MARKDOWN**: Code blocks with language identifiers
5. **BE CONCISE**: Facts > opinions, evidence > speculation`;

// src/agents/index.ts
var DEFAULT_MODELS = {
  "frontend-ui-ux": "openai/gpt-5.2-codex",
  explore: "minimax/minimax-m2",
  librarian: "opencode/glm-4.7-free"
};
function createFrontendUiUxAgent(model) {
  return {
    description: "Designer-turned-developer for stunning UI/UX. Creates beautiful interfaces even without mockups.",
    mode: "subagent",
    model: model ?? DEFAULT_MODELS["frontend-ui-ux"],
    prompt: FRONTEND_UI_UX_PROMPT
  };
}
function createExploreAgent(model) {
  return {
    description: 'Fast codebase exploration. Answers "Where is X?", "Find the code that does Y".',
    mode: "subagent",
    model: model ?? DEFAULT_MODELS.explore,
    temperature: 0.1,
    tools: { write: false, edit: false },
    prompt: EXPLORE_PROMPT
  };
}
function createLibrarianAgent(model) {
  return {
    description: "Multi-repo analysis, external docs, GitHub search. For libraries and open-source code.",
    mode: "subagent",
    model: model ?? DEFAULT_MODELS.librarian,
    temperature: 0.1,
    tools: { write: false, edit: false },
    prompt: LIBRARIAN_PROMPT
  };
}
var builtinAgents = {
  "frontend-ui-ux": createFrontendUiUxAgent,
  explore: createExploreAgent,
  librarian: createLibrarianAgent
};
function createAgents(overrides = {}) {
  const agents = {};
  for (const [name, createAgent] of Object.entries(builtinAgents)) {
    const override = overrides[name];
    if (override?.disabled)
      continue;
    const agent = createAgent();
    if (override?.model)
      agent.model = override.model;
    if (override?.temperature !== undefined)
      agent.temperature = override.temperature;
    agents[name] = agent;
  }
  return agents;
}

// src/hooks/edit-error-recovery.ts
var EDIT_ERROR_PATTERNS = [
  "oldString and newString must be different",
  "oldString not found",
  "oldString found multiple times"
];
var EDIT_ERROR_REMINDER = `
[EDIT ERROR - IMMEDIATE ACTION REQUIRED]

You made an Edit mistake. STOP and do this NOW:

1. READ the file immediately to see its ACTUAL current state
2. VERIFY what the content really looks like (your assumption was wrong)
3. APOLOGIZE briefly to the user for the error
4. CONTINUE with corrected action based on the real file content

DO NOT attempt another edit until you've read and verified the file state.
`;
function createEditErrorRecoveryHook(_ctx) {
  return {
    "tool.execute.after": async (input, output) => {
      if (input.tool.toLowerCase() !== "edit")
        return;
      const outputLower = output.output.toLowerCase();
      const hasEditError = EDIT_ERROR_PATTERNS.some((p) => outputLower.includes(p.toLowerCase()));
      if (hasEditError) {
        output.output += `
${EDIT_ERROR_REMINDER}`;
      }
    }
  };
}
// src/hooks/tool-output-truncator.ts
var DEFAULT_MAX_CHARS = 200000;
var WEBFETCH_MAX_CHARS = 40000;
var TRUNCATABLE_TOOLS = [
  "grep",
  "Grep",
  "glob",
  "Glob",
  "lsp_find_references",
  "lsp_symbols",
  "lsp_diagnostics",
  "ast_grep_search",
  "webfetch",
  "WebFetch"
];
var TOOL_MAX_CHARS = {
  webfetch: WEBFETCH_MAX_CHARS,
  WebFetch: WEBFETCH_MAX_CHARS
};
function createToolOutputTruncatorHook(_ctx) {
  return {
    "tool.execute.after": async (input, output) => {
      if (!TRUNCATABLE_TOOLS.includes(input.tool))
        return;
      const maxChars = TOOL_MAX_CHARS[input.tool] ?? DEFAULT_MAX_CHARS;
      if (output.output.length > maxChars) {
        const truncated = output.output.slice(0, maxChars);
        output.output = `${truncated}

[TRUNCATED - showing ${maxChars.toLocaleString()} of ${output.output.length.toLocaleString()} chars]`;
      }
    }
  };
}
// src/hooks/empty-message-sanitizer.ts
var PLACEHOLDER = "[user interrupted]";
function hasTextContent(part) {
  return part.type === "text" && Boolean(part.text?.trim());
}
function isToolPart(part) {
  return ["tool", "tool_use", "tool_result"].includes(part.type);
}
function hasValidContent(parts) {
  return parts.some((p) => hasTextContent(p) || isToolPart(p));
}
function createEmptyMessageSanitizerHook() {
  return {
    "experimental.chat.messages.transform": async (_input, output) => {
      for (let i = 0;i < output.messages.length; i++) {
        const msg = output.messages[i];
        const isLast = i === output.messages.length - 1;
        const isAssistant = msg.info.role === "assistant";
        if (isLast && isAssistant)
          continue;
        if (!hasValidContent(msg.parts)) {
          let filled = false;
          for (const part of msg.parts) {
            if (part.type === "text" && !part.text?.trim()) {
              part.text = PLACEHOLDER;
              part.synthetic = true;
              filled = true;
              break;
            }
          }
          if (!filled) {
            const toolIdx = msg.parts.findIndex(isToolPart);
            const newPart = {
              id: `synthetic_${Date.now()}`,
              type: "text",
              text: PLACEHOLDER,
              synthetic: true
            };
            if (toolIdx === -1) {
              msg.parts.push(newPart);
            } else {
              msg.parts.splice(toolIdx, 0, newPart);
            }
          }
        }
        for (const part of msg.parts) {
          if (part.type === "text" && part.text !== undefined && !part.text.trim()) {
            part.text = PLACEHOLDER;
            part.synthetic = true;
          }
        }
      }
    }
  };
}
// src/hooks/rules-injector.ts
import { readFileSync, existsSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve, relative } from "node:path";
var TRACKED_TOOLS = ["read", "write", "edit"];
var RULE_FILENAMES = [".opencode/rules", ".opencode/rules.md", "rules.md"];
function findProjectRoot(startDir) {
  let current = startDir;
  while (true) {
    if (existsSync(join(current, ".git")) || existsSync(join(current, "package.json"))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current)
      return null;
    current = parent;
  }
}
function findRuleFiles(projectRoot, home, targetFile) {
  const candidates = [];
  let current = dirname(targetFile);
  let distance = 0;
  while (true) {
    for (const filename of RULE_FILENAMES) {
      const rulePath = join(current, filename);
      if (existsSync(rulePath)) {
        try {
          candidates.push({ path: rulePath, realPath: realpathSync(rulePath), distance });
        } catch {}
      }
    }
    if (projectRoot && current === projectRoot)
      break;
    const parent = dirname(current);
    if (parent === current)
      break;
    current = parent;
    distance++;
  }
  for (const filename of RULE_FILENAMES) {
    const homePath = join(home, filename);
    if (existsSync(homePath)) {
      try {
        candidates.push({ path: homePath, realPath: realpathSync(homePath), distance: 999 });
      } catch {}
    }
  }
  return candidates;
}
function createRulesInjectorHook(ctx) {
  const sessionCaches = new Map;
  function getCache(sessionID) {
    if (!sessionCaches.has(sessionID))
      sessionCaches.set(sessionID, new Set);
    return sessionCaches.get(sessionID);
  }
  async function injectRules(filePath, sessionID, output) {
    const resolved = filePath.startsWith("/") ? filePath : resolve(ctx.directory, filePath);
    const projectRoot = findProjectRoot(resolved);
    const cache = getCache(sessionID);
    for (const candidate of findRuleFiles(projectRoot, homedir(), resolved)) {
      if (cache.has(candidate.realPath))
        continue;
      try {
        const content = readFileSync(candidate.path, "utf-8");
        const rel = projectRoot ? relative(projectRoot, candidate.path) : candidate.path;
        output.output += `

[Rule: ${rel}]
${content}`;
        cache.add(candidate.realPath);
      } catch {}
    }
  }
  return {
    "tool.execute.after": async (input, output) => {
      if (!TRACKED_TOOLS.includes(input.tool.toLowerCase()))
        return;
      await injectRules(output.title, input.sessionID, output);
    },
    event: async ({ event }) => {
      if (event.type === "session.deleted" || event.type === "session.compacted") {
        const id = event.properties?.sessionID ?? event.properties?.info?.id;
        if (id)
          sessionCaches.delete(id);
      }
    }
  };
}
// src/hooks/directory-agents-injector.ts
import { existsSync as existsSync2, readFileSync as readFileSync2 } from "node:fs";
import { dirname as dirname2, join as join2, resolve as resolve2 } from "node:path";
var AGENTS_FILENAME = "AGENTS.md";
function createDirectoryAgentsInjectorHook(ctx) {
  const sessionCaches = new Map;
  function getCache(sessionID) {
    if (!sessionCaches.has(sessionID))
      sessionCaches.set(sessionID, new Set);
    return sessionCaches.get(sessionID);
  }
  function findAgentsMdUp(startDir) {
    const found = [];
    let current = startDir;
    while (true) {
      if (current !== ctx.directory) {
        const agentsPath = join2(current, AGENTS_FILENAME);
        if (existsSync2(agentsPath))
          found.push(agentsPath);
      }
      if (current === ctx.directory)
        break;
      const parent = dirname2(current);
      if (parent === current || !parent.startsWith(ctx.directory))
        break;
      current = parent;
    }
    return found.reverse();
  }
  async function injectAgents(filePath, sessionID, output) {
    const resolved = filePath.startsWith("/") ? filePath : resolve2(ctx.directory, filePath);
    const cache = getCache(sessionID);
    for (const agentsPath of findAgentsMdUp(dirname2(resolved))) {
      const dir = dirname2(agentsPath);
      if (cache.has(dir))
        continue;
      try {
        const content = readFileSync2(agentsPath, "utf-8");
        output.output += `

[Directory Context: ${agentsPath}]
${content}`;
        cache.add(dir);
      } catch {}
    }
  }
  return {
    "tool.execute.after": async (input, output) => {
      if (input.tool.toLowerCase() !== "read")
        return;
      await injectAgents(output.title, input.sessionID, output);
    },
    event: async ({ event }) => {
      if (event.type === "session.deleted" || event.type === "session.compacted") {
        const id = event.properties?.sessionID ?? event.properties?.info?.id;
        if (id)
          sessionCaches.delete(id);
      }
    }
  };
}
// src/index.ts
function OpenCodeLeanPlugin(config = {}) {
  const { disabled_hooks = [], disabled_mcps = [], agent_overrides = {} } = config;
  const isEnabled = (hook) => !disabled_hooks.includes(hook);
  return (ctx) => {
    const toolAfterHooks = [];
    const eventHooks = [];
    if (isEnabled("edit-error-recovery")) {
      const hook = createEditErrorRecoveryHook(ctx);
      toolAfterHooks.push(hook["tool.execute.after"]);
    }
    if (isEnabled("tool-output-truncator")) {
      const hook = createToolOutputTruncatorHook(ctx);
      toolAfterHooks.push(hook["tool.execute.after"]);
    }
    if (isEnabled("rules-injector")) {
      const hook = createRulesInjectorHook(ctx);
      toolAfterHooks.push(hook["tool.execute.after"]);
      eventHooks.push(hook.event);
    }
    if (isEnabled("directory-agents-injector")) {
      const hook = createDirectoryAgentsInjectorHook(ctx);
      toolAfterHooks.push(hook["tool.execute.after"]);
      eventHooks.push(hook.event);
    }
    const sanitizerHook = isEnabled("empty-message-sanitizer") ? createEmptyMessageSanitizerHook()["experimental.chat.messages.transform"] : undefined;
    return {
      name: "opencode-lean",
      mcps: createMcps(disabled_mcps),
      agents: createAgents(agent_overrides),
      "tool.execute.after": async (input, output) => {
        for (const hook of toolAfterHooks) {
          await hook(input, output);
        }
      },
      event: async (input) => {
        for (const hook of eventHooks) {
          await hook(input);
        }
      },
      ...sanitizerHook && {
        "experimental.chat.messages.transform": sanitizerHook
      }
    };
  };
}
export {
  OpenCodeLeanPlugin as default,
  createToolOutputTruncatorHook,
  createRulesInjectorHook,
  createMcps,
  createEmptyMessageSanitizerHook,
  createEditErrorRecoveryHook,
  createDirectoryAgentsInjectorHook,
  createAgents
};
