import type { PluginInput } from "@opencode-ai/plugin";
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
interface EventInput {
    event: {
        type: string;
        properties?: Record<string, unknown>;
    };
}
export declare function createRulesInjectorHook(ctx: PluginInput): {
    "tool.execute.after": (input: ToolInput, output: ToolOutput) => Promise<void>;
    event: ({ event }: EventInput) => Promise<void>;
};
export {};
