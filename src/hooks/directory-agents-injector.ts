import type { PluginInput } from "@opencode-ai/plugin"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"

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

interface EventInput {
  event: { type: string; properties?: Record<string, unknown> }
}

const AGENTS_FILENAME = "AGENTS.md"

export function createDirectoryAgentsInjectorHook(ctx: PluginInput) {
  const sessionCaches = new Map<string, Set<string>>()

  function getCache(sessionID: string): Set<string> {
    if (!sessionCaches.has(sessionID)) sessionCaches.set(sessionID, new Set())
    return sessionCaches.get(sessionID)!
  }

  function findAgentsMdUp(startDir: string): string[] {
    const found: string[] = []
    let current = startDir

    while (true) {
      // Skip root - OpenCode loads it automatically
      if (current !== ctx.directory) {
        const agentsPath = join(current, AGENTS_FILENAME)
        if (existsSync(agentsPath)) found.push(agentsPath)
      }
      if (current === ctx.directory) break
      const parent = dirname(current)
      if (parent === current || !parent.startsWith(ctx.directory)) break
      current = parent
    }

    return found.reverse()
  }

  async function injectAgents(filePath: string, sessionID: string, output: ToolOutput) {
    const resolved = filePath.startsWith("/") ? filePath : resolve(ctx.directory, filePath)
    const cache = getCache(sessionID)

    for (const agentsPath of findAgentsMdUp(dirname(resolved))) {
      const dir = dirname(agentsPath)
      if (cache.has(dir)) continue
      try {
        const content = readFileSync(agentsPath, "utf-8")
        output.output += `\n\n[Directory Context: ${agentsPath}]\n${content}`
        cache.add(dir)
      } catch {}
    }
  }

  return {
    "tool.execute.after": async (input: ToolInput, output: ToolOutput) => {
      if (input.tool.toLowerCase() !== "read") return
      await injectAgents(output.title, input.sessionID, output)
    },
    event: async ({ event }: EventInput) => {
      if (event.type === "session.deleted" || event.type === "session.compacted") {
        const id = event.properties?.sessionID ?? (event.properties?.info as { id?: string })?.id
        if (id) sessionCaches.delete(id as string)
      }
    },
  }
}
