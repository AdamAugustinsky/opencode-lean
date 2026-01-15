import type { AgentConfig } from "@opencode-ai/sdk"
import { FRONTEND_UI_UX_PROMPT } from "./prompts/frontend-ui-ux"
import { EXPLORE_PROMPT } from "./prompts/explore"
import { LIBRARIAN_PROMPT } from "./prompts/librarian"

export type AgentName = "frontend-ui-ux" | "explore" | "librarian"

export interface AgentOverride {
  model?: string
  disabled?: boolean
  temperature?: number
}

const DEFAULT_MODELS: Record<AgentName, string> = {
  "frontend-ui-ux": "openai/gpt-5.2-codex",
  explore: "minimax/minimax-m2",
  librarian: "opencode/glm-4.7-free",
}

export function createFrontendUiUxAgent(model?: string): AgentConfig {
  return {
    description: "Designer-turned-developer for stunning UI/UX. Creates beautiful interfaces even without mockups.",
    mode: "subagent",
    model: model ?? DEFAULT_MODELS["frontend-ui-ux"],
    prompt: FRONTEND_UI_UX_PROMPT,
  }
}

export function createExploreAgent(model?: string): AgentConfig {
  return {
    description: 'Fast codebase exploration. Answers "Where is X?", "Find the code that does Y".',
    mode: "subagent",
    model: model ?? DEFAULT_MODELS.explore,
    temperature: 0.1,
    tools: { write: false, edit: false },
    prompt: EXPLORE_PROMPT,
  }
}

export function createLibrarianAgent(model?: string): AgentConfig {
  return {
    description: "Multi-repo analysis, external docs, GitHub search. For libraries and open-source code.",
    mode: "subagent",
    model: model ?? DEFAULT_MODELS.librarian,
    temperature: 0.1,
    tools: { write: false, edit: false },
    prompt: LIBRARIAN_PROMPT,
  }
}

export const builtinAgents: Record<AgentName, () => AgentConfig> = {
  "frontend-ui-ux": createFrontendUiUxAgent,
  explore: createExploreAgent,
  librarian: createLibrarianAgent,
}

export function createAgents(
  overrides: Partial<Record<AgentName, AgentOverride>> = {}
): Record<string, AgentConfig> {
  const agents: Record<string, AgentConfig> = {}

  for (const [name, createAgent] of Object.entries(builtinAgents)) {
    const override = overrides[name as AgentName]
    if (override?.disabled) continue

    const agent = createAgent()
    if (override?.model) agent.model = override.model
    if (override?.temperature !== undefined) agent.temperature = override.temperature

    agents[name] = agent
  }

  return agents
}
