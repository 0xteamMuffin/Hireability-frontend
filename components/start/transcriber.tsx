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
  isFinal: boolean;
}

function Transcriber({ conversation }: { conversation: ConversationEntry[] }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <div className="flex flex-col size-full max-w-full mx-auto bg-background rounded-lg shadow-lg overflow-hidden">
      <div className="bg-secondary px-4 py-3 flex items-center justify-between">
        <div className="font-medium text-foreground">Live Transcript</div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3",
              message.role === "user" && "justify-end"
            )}
          >
            {message.role !== "user" && (
              <Avatar className="w-8 h-8 shrink-0 bg-secondary text-foreground">
                <AvatarFallback>
                  <Bot size={16} />
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "px-4 py-2 rounded-lg max-w-[70%]",
                message.role === "user"
                  ? "bg-primary text-background"
                  : "bg-secondary text-foreground"
              )}
            >
              <p>{message.text}</p>
              <div className="text-[10px] text-muted-foreground mt-1">
                {message.timestamp}
              </div>
            </div>
            {message.role === "user" && (
              <Avatar className="w-8 h-8 shrink-0 bg-primary text-background">
                <AvatarFallback>
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Transcriber;
export { Avatar, AvatarFallback };

