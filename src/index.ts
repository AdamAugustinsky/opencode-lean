import type { PluginInput } from "@opencode-ai/plugin"
import { createMcps, type McpName, type RemoteMcpConfig } from "./mcp"
import { createAgents, type AgentName, type AgentOverride } from "./agents"
import {
  createEditErrorRecoveryHook,
  createToolOutputTruncatorHook,
  createEmptyMessageSanitizerHook,
  createRulesInjectorHook,
  createDirectoryAgentsInjectorHook,
  type HookName,
} from "./hooks"

export type { AgentName, AgentOverride, HookName, McpName, RemoteMcpConfig }
export { createMcps } from "./mcp"
export { createAgents } from "./agents"
export * from "./hooks"

export interface OpenCodeLeanConfig {
  disabled_hooks?: HookName[]
  disabled_mcps?: McpName[]
  agent_overrides?: Partial<Record<AgentName, AgentOverride>>
}

interface ToolInput {
  tool: string
  sessionID: string
  callID: string
}

interface ToolOutput {
  title: string
  output: string
  metadata: unknown
}

type ToolExecuteAfterHook = (input: ToolInput, output: ToolOutput) => Promise<void>
type EventHook = (input: { event: { type: string; properties?: Record<string, unknown> } }) => Promise<void>

export default function OpenCodeLeanPlugin(config: OpenCodeLeanConfig = {}) {
  const { disabled_hooks = [], disabled_mcps = [], agent_overrides = {} } = config

  const isEnabled = (hook: HookName) => !disabled_hooks.includes(hook)

  return (ctx: PluginInput) => {
    const toolAfterHooks: ToolExecuteAfterHook[] = []
    const eventHooks: EventHook[] = []

    // Edit error recovery
    if (isEnabled("edit-error-recovery")) {
      const hook = createEditErrorRecoveryHook(ctx)
      toolAfterHooks.push(hook["tool.execute.after"])
    }

    // Tool output truncator
    if (isEnabled("tool-output-truncator")) {
      const hook = createToolOutputTruncatorHook(ctx)
      toolAfterHooks.push(hook["tool.execute.after"])
    }

    // Rules injector
    if (isEnabled("rules-injector")) {
      const hook = createRulesInjectorHook(ctx)
      toolAfterHooks.push(hook["tool.execute.after"])
      eventHooks.push(hook.event)
    }

    // Directory agents injector
    if (isEnabled("directory-agents-injector")) {
      const hook = createDirectoryAgentsInjectorHook(ctx)
      toolAfterHooks.push(hook["tool.execute.after"])
      eventHooks.push(hook.event)
    }

    // Empty message sanitizer
    const sanitizerHook = isEnabled("empty-message-sanitizer")
      ? createEmptyMessageSanitizerHook()["experimental.chat.messages.transform"]
      : undefined

    return {
      name: "opencode-lean",
      mcps: createMcps(disabled_mcps),
      agents: createAgents(agent_overrides),

      "tool.execute.after": async (input: ToolInput, output: ToolOutput) => {
        for (const hook of toolAfterHooks) {
          await hook(input, output)
        }
      },

      event: async (input: { event: { type: string; properties?: Record<string, unknown> } }) => {
        for (const hook of eventHooks) {
          await hook(input)
        }
      },

      ...(sanitizerHook && {
        "experimental.chat.messages.transform": sanitizerHook,
      }),
    }
  }
}
