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
export declare function createToolOutputTruncatorHook(_ctx: PluginInput): {
    "tool.execute.after": (input: ToolInput, output: ToolOutput) => Promise<void>;
};
export {};
