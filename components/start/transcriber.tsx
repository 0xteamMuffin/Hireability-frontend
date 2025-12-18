"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted text-foreground items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Avatar.displayName = "Avatar";

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
AvatarFallback.displayName = "AvatarFallback";

export interface ConversationEntry {
  role: string;
  text: string;
  timestamp: string;
  isFinal?: boolean;
}

function Transcriber({ conversation }: { conversation: ConversationEntry[] }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

   React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [conversation]);

  return (
    <div className="flex flex-col h-full bg-[#202124] rounded-lg overflow-hidden p-1">
      <div className="bg-[#2a2d32] px-4 py-3 flex items-center justify-between shrink-0 border-b border-white/5">
        <div className="font-medium text-white text-sm">Live Transcript</div>
        <div className="text-xs text-white/60">{conversation.length} messages</div>
      </div>

      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent'
        }}
      >
        {conversation.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-white/40">
            <Bot size={48} className="mb-4 opacity-30" />
            <p className="text-sm">Transcript will appear here</p>
            <p className="text-xs mt-1">Start the interview to see messages</p>
          </div>
        ) : (
          conversation.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                message.role === "user" && "justify-end"
              )}
            >
              {message.role !== "user" && (
                <Avatar className="w-8 h-8 shrink-0 bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <AvatarFallback>
                    <Bot size={16} />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "px-4 py-2.5 rounded-2xl max-w-[75%] wrap-break-word",
                  message.role === "user"
                    ? "bg-slate-600 text-white rounded-br-md"
                    : "bg-[#2a2d32] text-white/90 border border-white/10 rounded-bl-md"
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <div className="text-[10px] text-white/40 mt-1.5">
                  {message.timestamp}
                </div>
              </div>
              {message.role === "user" && (
                <Avatar className="w-8 h-8 shrink-0 bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <AvatarFallback>
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Transcriber;
export { Avatar, AvatarFallback };