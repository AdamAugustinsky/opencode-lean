const PLACEHOLDER = "[user interrupted]"

export interface Part {
  type: string
  id?: string
  text?: string
  synthetic?: boolean
}

export interface Message {
  id: string
  role: string
}

export interface MessageWithParts {
  info: Message
  parts: Part[]
}

function hasTextContent(part: Part): boolean {
  return part.type === "text" && Boolean(part.text?.trim())
}

function isToolPart(part: Part): boolean {
  return ["tool", "tool_use", "tool_result"].includes(part.type)
}

function hasValidContent(parts: Part[]): boolean {
  return parts.some((p) => hasTextContent(p) || isToolPart(p))
}

export function createEmptyMessageSanitizerHook() {
  return {
    "experimental.chat.messages.transform": async (
      _input: Record<string, never>,
      output: { messages: MessageWithParts[] }
    ) => {
      for (let i = 0; i < output.messages.length; i++) {
        const msg = output.messages[i]
        const isLast = i === output.messages.length - 1
        const isAssistant = msg.info.role === "assistant"

        // Final assistant message can be empty
        if (isLast && isAssistant) continue

        if (!hasValidContent(msg.parts)) {
          // Try to fill existing empty text part
          let filled = false
          for (const part of msg.parts) {
            if (part.type === "text" && !part.text?.trim()) {
              part.text = PLACEHOLDER
              part.synthetic = true
              filled = true
              break
            }
          }

          // Otherwise inject new text part
          if (!filled) {
            const toolIdx = msg.parts.findIndex(isToolPart)
            const newPart: Part = {
              id: `synthetic_${Date.now()}`,
              type: "text",
              text: PLACEHOLDER,
              synthetic: true,
            }
            if (toolIdx === -1) {
              msg.parts.push(newPart)
            } else {
              msg.parts.splice(toolIdx, 0, newPart)
            }
          }
        }

        // Replace any remaining empty text parts
        for (const part of msg.parts) {
          if (part.type === "text" && part.text !== undefined && !part.text.trim()) {
            part.text = PLACEHOLDER
            part.synthetic = true
          }
        }
      }
    },
  }
}
