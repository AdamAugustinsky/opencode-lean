import type { AgentConfig } from "@opencode-ai/sdk";
export type AgentName = "frontend-ui-ux" | "explore" | "librarian";
export interface AgentOverride {
    model?: string;
    disabled?: boolean;
    temperature?: number;
}
export declare function createFrontendUiUxAgent(model?: string): AgentConfig;
export declare function createExploreAgent(model?: string): AgentConfig;
export declare function createLibrarianAgent(model?: string): AgentConfig;
export declare const builtinAgents: Record<AgentName, () => AgentConfig>;
export declare function createAgents(overrides?: Partial<Record<AgentName, AgentOverride>>): Record<string, AgentConfig>;
