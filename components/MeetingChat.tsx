"use client";

import type { CustomVideoEvent } from "@stream-io/video-client";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { AlertCircle, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const CHAT_EVENT = "baithak.chat.message";
const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGES = 200;

type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  createdAt: number;
};

interface MeetingChatProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadChange: (count: number) => void;
}

const getInitials = (name: string) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "G";
};

const formatMessageTime = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);

const createMessageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const MeetingChat = ({ isOpen, onClose, onUnreadChange }: MeetingChatProps) => {
  const call = useCall();
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string>();
  const [, setUnreadCount] = useState(0);
  const messagesRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  const onUnreadChangeRef = useRef(onUnreadChange);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    isOpenRef.current = isOpen;
    onUnreadChangeRef.current = onUnreadChange;

    if (isOpen) {
      setUnreadCount(0);
      onUnreadChange(0);
    }
  }, [isOpen, onUnreadChange]);

  useEffect(() => {
    onUnreadChangeRef.current = onUnreadChange;
  }, [onUnreadChange]);

  useEffect(() => {
    if (!call) return;

    const handleCustomEvent = (event: CustomVideoEvent) => {
      const custom = event.custom;
      if (
        custom?.event !== CHAT_EVENT ||
        typeof custom.messageId !== "string" ||
        typeof custom.text !== "string" ||
        !custom.text.trim()
      ) {
        return;
      }

      const message: ChatMessage = {
        id: custom.messageId,
        text: custom.text.trim().slice(0, MAX_MESSAGE_LENGTH),
        senderId: event.user?.id || String(custom.senderId || "guest"),
        senderName: event.user?.name || String(custom.senderName || "Guest"),
        senderImage: event.user?.image,
        createdAt: typeof custom.createdAt === "number" ? custom.createdAt : Date.now(),
      };

      setMessages((currentMessages) => {
        if (currentMessages.some((currentMessage) => currentMessage.id === message.id)) {
          return currentMessages;
        }

        return [...currentMessages, message].slice(-MAX_MESSAGES);
      });

      if (!isOpenRef.current) {
        setUnreadCount((currentCount) => {
          const nextCount = currentCount + 1;
          onUnreadChangeRef.current(nextCount);
          return nextCount;
        });
      }
    };

    return call.on("custom", handleCustomEvent);
  }, [call]);

  useEffect(() => {
    if (!isOpen || !messagesRef.current) return;

    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  const addMessage = (message: ChatMessage) => {
    setMessages((currentMessages) => {
      if (currentMessages.some((currentMessage) => currentMessage.id === message.id)) {
        return currentMessages;
      }

      return [...currentMessages, message].slice(-MAX_MESSAGES);
    });
  };

  const submitMessage = async () => {
    const text = draft.trim();
    if (!text || !call || isSending) return;

    const messageId = createMessageId();
    const createdAt = Date.now();
    const senderId = localParticipant?.userId || "local-user";
    const senderName = localParticipant?.name || "You";
    const message: ChatMessage = {
      id: messageId,
      text: text.slice(0, MAX_MESSAGE_LENGTH),
      senderId,
      senderName,
      senderImage: localParticipant?.image,
      createdAt,
    };

    setIsSending(true);
    setSendError(undefined);
    setDraft("");
    addMessage(message);

    try {
      await call.sendCustomEvent({
        event: CHAT_EVENT,
        messageId,
        text: message.text,
        senderId,
        senderName,
        createdAt,
      });
    } catch (error) {
      console.error("Unable to send chat message", error);
      setMessages((currentMessages) => currentMessages.filter((currentMessage) => currentMessage.id !== messageId));
      setDraft(text);
      setSendError("Your message could not be sent. Check your connection and try again.");
      toast({ title: "Message not sent", description: "Check your connection and try again." });
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitMessage();
    }
  };

  return (
    <aside
      className={cn(
        "meeting-chat meeting-panel absolute bottom-3 right-3 top-3 z-40 flex w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[#1B1F27] shadow-2xl shadow-black/50 transition-[opacity,transform,visibility] duration-200 sm:bottom-5 sm:right-5 sm:top-5",
        isOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none translate-y-2 opacity-0",
      )}
      role="dialog"
      aria-modal="false"
      aria-labelledby="meeting-chat-title"
      aria-hidden={!isOpen}
    >
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#8AB4F8]/20 bg-[#8AB4F8]/10 text-[#AECBFA]">
            <MessageCircle className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 id="meeting-chat-title" className="text-sm font-semibold text-[#F1F3F4]">In-meeting chat</h2>
            <p className="mt-1 text-xs leading-5 text-[#8B909A]">Messages are visible to everyone in this meeting.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#9AA0A6] transition-colors hover:bg-white/[0.06] hover:text-[#F1F3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AECBFA]"
        >
          <X className="size-4" />
        </button>
      </div>

      <div ref={messagesRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5" aria-live="polite">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-56 flex-col items-center justify-center px-5 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#232832] text-[#AECBFA]">
              <MessageCircle className="size-6" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-[#E8EAED]">Start the conversation</h3>
            <p className="mt-2 max-w-[15rem] text-xs leading-5 text-[#8B909A]">
              Share a thought, link, or question with everyone in the room.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === localParticipant?.userId;

            return (
              <div key={message.id} className={cn("flex items-end gap-2", isOwnMessage && "justify-end")}>
                {!isOwnMessage && (
                  <div className="size-8 shrink-0 overflow-hidden rounded-full border border-white/[0.1] bg-[#303641]">
                    {message.senderImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={message.senderImage} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center text-[10px] font-semibold text-[#D8DCE3]">
                        {getInitials(message.senderName)}
                      </span>
                    )}
                  </div>
                )}
                <div className={cn("min-w-0 max-w-[82%]", isOwnMessage && "items-end")}>
                  <div className={cn("meeting-chat__sender mb-1 flex items-center gap-2 text-[10px] text-[#7F8794]", isOwnMessage && "justify-end")}>
                    <span className="meeting-chat__sender-name">{isOwnMessage ? "You" : message.senderName}</span>
                    <span className="meeting-chat__sender-time">{formatMessageTime(message.createdAt)}</span>
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl border px-3.5 py-2.5 text-sm leading-5 shadow-sm",
                      isOwnMessage
                        ? "rounded-br-md border-[#8AB4F8]/25 bg-[#8AB4F8]/15 text-[#E8F0FF]"
                        : "rounded-bl-md border-white/[0.08] bg-[#252A33] text-[#D8DCE3]",
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-white/[0.08] p-3 sm:p-4">
        {sendError && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-[#F28B82]/25 bg-[#F28B82]/10 px-3 py-2.5 text-xs leading-5 text-[#F6AEA8]" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{sendError}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-white/[0.1] bg-[#232832] p-2 transition-colors focus-within:border-[#8AB4F8]/40">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              onKeyDown={handleKeyDown}
              placeholder="Write a message…"
              rows={2}
              maxLength={MAX_MESSAGE_LENGTH}
              aria-label="Message to meeting participants"
              className="max-h-28 min-h-12 w-full resize-none bg-transparent px-2 py-1 text-sm leading-5 text-[#F1F3F4] outline-none placeholder:text-[#747984]"
            />
            <div className="flex items-center justify-between gap-3 px-1 pt-1">
              <span className="meeting-chat__hint text-[10px] text-[#747984]">Enter to send · Shift + Enter for a new line</span>
              <button
                type="submit"
                disabled={!draft.trim() || isSending || !call}
                aria-label="Send message"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#AECBFA] text-[#101216] transition-colors hover:bg-[#D2E3FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AECBFA] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </div>
          </div>
        </form>
        <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-[#747984]">
          <span>Chat is available while you’re in the meeting.</span>
          <span>{draft.length}/{MAX_MESSAGE_LENGTH}</span>
        </div>
      </div>
    </aside>
  );
};

export default MeetingChat;
