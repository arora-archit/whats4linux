import { Virtuoso, type VirtuosoHandle } from "react-virtuoso"
import { forwardRef, useImperativeHandle, useRef, useCallback } from "react"
import { store } from "../../../wailsjs/go/models"
import { MessageItem } from "./MessageItem"

interface MessageListProps {
  chatId: string
  messages: store.Message[]
  sentMediaCache: React.MutableRefObject<Map<string, string>>
  onReply?: (message: store.Message) => void
  startReached?: () => void
  firstItemIndex?: number
}

export interface MessageListHandle {
  scrollToBottom: (behavior?: "auto" | "smooth") => void
}

export const MessageList = forwardRef<MessageListHandle, MessageListProps>(function MessageList(
  { chatId, messages, sentMediaCache, onReply, startReached, firstItemIndex },
  ref,
) {
  const virtuosoRef = useRef<VirtuosoHandle>(null)

  const scrollToBottom = useCallback(
    (behavior: "auto" | "smooth" = "smooth") => {
      if (virtuosoRef.current && messages.length > 0) {
        virtuosoRef.current.scrollToIndex({
          index: messages.length - 1,
          align: "end",
          behavior,
        })
      }
    },
    [messages.length],
  )

  useImperativeHandle(ref, () => ({
    scrollToBottom,
  }))

  return (
    <Virtuoso
      ref={virtuosoRef}
      data={messages}
      firstItemIndex={firstItemIndex}
      initialTopMostItemIndex={messages.length - 1}
      startReached={startReached}
      followOutput="smooth"
      alignToBottom
      className="flex-1 overflow-y-auto bg-repeat"
      style={{ backgroundImage: "url('/assets/images/bg-chat-tile-dark.png')" }}
      itemContent={(index, msg) => (
        <div className="px-4 py-1">
          <MessageItem
            key={msg.Info.ID || index}
            message={msg}
            chatId={chatId}
            sentMediaCache={sentMediaCache}
            onReply={onReply}
          />
        </div>
      )}
      components={{
        Header: () => <div className="h-2" />,
        Footer: () => <div className="h-2" />,
      }}
    />
  )
})
