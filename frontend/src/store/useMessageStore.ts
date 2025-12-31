import { create } from "zustand"

interface MessageStore {
  messages: Record<string, any[]>
  setMessages: (chatId: string, messages: any[]) => void
  addMessage: (chatId: string, message: any) => void
  prependMessages: (chatId: string, messages: any[]) => void
  updateMessage: (chatId: string, message: any) => void
  clearMessages: (chatId: string) => void
}

export const useMessageStore = create<MessageStore>(set => ({
  messages: {},

  setMessages: (chatId, messages) =>
    set(state => ({
      messages: { ...state.messages, [chatId]: messages },
    })),

  addMessage: (chatId, message) =>
    set(state => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),

  prependMessages: (chatId, messages) =>
    set(state => ({
      messages: {
        ...state.messages,
        [chatId]: [...messages, ...(state.messages[chatId] || [])],
      },
    })),

  // Update or add a message based on its ID (for WhatsMeow events)
  updateMessage: (chatId, message) =>
    set(state => {
      const existing = state.messages[chatId] || []
      const msgId = message.Info?.ID
      const idx = existing.findIndex((m: any) => m.Info?.ID === msgId)

      if (idx >= 0) {
        // Update existing message
        const updated = [...existing]
        updated[idx] = message
        return { messages: { ...state.messages, [chatId]: updated } }
      } else {
        // Add new message
        return { messages: { ...state.messages, [chatId]: [...existing, message] } }
      }
    }),

  clearMessages: chatId =>
    set(state => {
      const newMessages = { ...state.messages }
      delete newMessages[chatId]
      return { messages: newMessages }
    }),
}))
