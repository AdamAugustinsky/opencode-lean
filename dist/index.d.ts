import type { PluginInput } from "@opencode-ai/plugin";
import { type McpName, type RemoteMcpConfig } from "./mcp";
import { type AgentName, type AgentOverride } from "./agents";
import { type HookName } from "./hooks";
export type { AgentName, AgentOverride, HookName, McpName, RemoteMcpConfig };
export { createMcps } from "./mcp";
export { createAgents } from "./agents";
export * from "./hooks";
export interface OpenCodeLeanConfig {
    disabled_hooks?: HookName[];
    disabled_mcps?: McpName[];
    agent_overrides?: Partial<Record<AgentName, AgentOverride>>;
}
interface ToolInput {
    tool: string;
    sessionID: string;
    callID: string;
}
interface ToolOutput {
    title: string;
    output: string;
    metadata: unknown;
}
export default function OpenCodeLeanPlugin(config?: OpenCodeLeanConfig): (ctx: PluginInput) => {
    "experimental.chat.messages.transform"?: ((_input: Record<string, never>, output: {
        messages: import("./hooks/empty-message-sanitizer").MessageWithParts[];
    }) => Promise<void>) | undefined;
    name: string;
    mcps: Record<string, RemoteMcpConfig>;
    agents: Record<string, import("@opencode-ai/sdk").AgentConfig>;
    "tool.execute.after": (input: ToolInput, output: ToolOutput) => Promise<void>;
    event: (input: {
        event: {
            type: string;
            properties?: Record<string, unknown>;
        };
    }) => Promise<void>;
};
