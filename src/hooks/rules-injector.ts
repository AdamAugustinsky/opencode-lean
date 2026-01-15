import type { PluginInput } from "@opencode-ai/plugin"
import { readFileSync, existsSync, realpathSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join, resolve, relative } from "node:path"

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

interface RuleCandidate {
  path: string
  realPath: string
  distance: number
}

const TRACKED_TOOLS = ["read", "write", "edit"]
const RULE_FILENAMES = [".opencode/rules", ".opencode/rules.md", "rules.md"]

function findProjectRoot(startDir: string): string | null {
  let current = startDir
  while (true) {
    if (existsSync(join(current, ".git")) || existsSync(join(current, "package.json"))) {
      return current
    }
    const parent = dirname(current)
    if (parent === current) return null
    current = parent
  }
}

function findRuleFiles(projectRoot: string | null, home: string, targetFile: string): RuleCandidate[] {
  const candidates: RuleCandidate[] = []
  let current = dirname(targetFile)
  let distance = 0

  while (true) {
    for (const filename of RULE_FILENAMES) {
      const rulePath = join(current, filename)
      if (existsSync(rulePath)) {
        try {
          candidates.push({ path: rulePath, realPath: realpathSync(rulePath), distance })
        } catch {}
      }
    }
    if (projectRoot && current === projectRoot) break
    const parent = dirname(current)
    if (parent === current) break
    current = parent
    distance++
  }

  // Home directory rules
  for (const filename of RULE_FILENAMES) {
    const homePath = join(home, filename)
    if (existsSync(homePath)) {
      try {
        candidates.push({ path: homePath, realPath: realpathSync(homePath), distance: 999 })
      } catch {}
    }
  }

  return candidates
}

export function createRulesInjectorHook(ctx: PluginInput) {
  const sessionCaches = new Map<string, Set<string>>()

  function getCache(sessionID: string): Set<string> {
    if (!sessionCaches.has(sessionID)) sessionCaches.set(sessionID, new Set())
    return sessionCaches.get(sessionID)!
  }

  async function injectRules(filePath: string, sessionID: string, output: ToolOutput) {
    const resolved = filePath.startsWith("/") ? filePath : resolve(ctx.directory, filePath)
    const projectRoot = findProjectRoot(resolved)
    const cache = getCache(sessionID)

    for (const candidate of findRuleFiles(projectRoot, homedir(), resolved)) {
      if (cache.has(candidate.realPath)) continue
      try {
        const content = readFileSync(candidate.path, "utf-8")
        const rel = projectRoot ? relative(projectRoot, candidate.path) : candidate.path
        output.output += `\n\n[Rule: ${rel}]\n${content}`
        cache.add(candidate.realPath)
      } catch {}
    }
  }

  return {
    "tool.execute.after": async (input: ToolInput, output: ToolOutput) => {
      if (!TRACKED_TOOLS.includes(input.tool.toLowerCase())) return
      await injectRules(output.title, input.sessionID, output)
    },
    event: async ({ event }: EventInput) => {
      if (event.type === "session.deleted" || event.type === "session.compacted") {
        const id = event.properties?.sessionID ?? (event.properties?.info as { id?: string })?.id
        if (id) sessionCaches.delete(id as string)
      }
    },
  }
}
