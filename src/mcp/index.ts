export interface RemoteMcpConfig {
  type: "remote"
  url: string
  enabled: boolean
  headers?: Record<string, string>
}

export const websearch: RemoteMcpConfig = {
  type: "remote",
  url: "https://mcp.exa.ai/mcp?tools=web_search_exa",
  enabled: true,
  headers: process.env.EXA_API_KEY
    ? { "x-api-key": process.env.EXA_API_KEY }
    : undefined,
}

export const context7: RemoteMcpConfig = {
  type: "remote",
  url: "https://mcp.context7.com/mcp",
  enabled: true,
}

export const grep_app: RemoteMcpConfig = {
  type: "remote",
  url: "https://mcp.grep.app",
  enabled: true,
}

export type McpName = "websearch" | "context7" | "grep_app"

export const builtinMcps: Record<McpName, RemoteMcpConfig> = {
  websearch,
  context7,
  grep_app,
}

export function createMcps(disabled: McpName[] = []): Record<string, RemoteMcpConfig> {
  const mcps: Record<string, RemoteMcpConfig> = {}
  for (const [name, config] of Object.entries(builtinMcps)) {
    if (!disabled.includes(name as McpName)) {
      mcps[name] = config
    }
  }
  return mcps
}
