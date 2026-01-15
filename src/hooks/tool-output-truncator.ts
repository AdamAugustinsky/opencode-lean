import type { PluginInput } from "@opencode-ai/plugin"

const DEFAULT_MAX_CHARS = 200_000
const WEBFETCH_MAX_CHARS = 40_000

const TRUNCATABLE_TOOLS = [
  "grep", "Grep",
  "glob", "Glob",
  "lsp_find_references",
  "lsp_symbols",
  "lsp_diagnostics",
  "ast_grep_search",
  "webfetch", "WebFetch",
]

const TOOL_MAX_CHARS: Record<string, number> = {
  webfetch: WEBFETCH_MAX_CHARS,
  WebFetch: WEBFETCH_MAX_CHARS,
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

export function createToolOutputTruncatorHook(_ctx: PluginInput) {
  return {
    "tool.execute.after": async (input: ToolInput, output: ToolOutput) => {
      if (!TRUNCATABLE_TOOLS.includes(input.tool)) return

      const maxChars = TOOL_MAX_CHARS[input.tool] ?? DEFAULT_MAX_CHARS

      if (output.output.length > maxChars) {
        const truncated = output.output.slice(0, maxChars)
        output.output = `${truncated}\n\n[TRUNCATED - showing ${maxChars.toLocaleString()} of ${output.output.length.toLocaleString()} chars]`
      }
    },
  }
}
