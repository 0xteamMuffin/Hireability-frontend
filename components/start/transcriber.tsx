'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-muted text-foreground relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
Avatar.displayName = 'Avatar';

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-muted text-foreground flex h-full w-full items-center justify-center rounded-full',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
AvatarFallback.displayName = 'AvatarFallback';

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
        behavior: 'smooth',
      });
    }
  }, [conversation]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-[#202124] p-1">
      <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-[#2a2d32] px-4 py-3">
        <div className="text-sm font-medium text-white">Live Transcript</div>
        <div className="text-xs text-white/60">{conversation.length} messages</div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-1 space-y-4 overflow-y-auto p-4"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent',
        }}
      >
        {conversation.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-white/40">
            <Bot size={48} className="mb-4 opacity-30" />
            <p className="text-sm">Transcript will appear here</p>
            <p className="mt-1 text-xs">Start the interview to see messages</p>
          </div>
        ) : (
          conversation.map((message, index) => (
            <div
              key={index}
              className={cn(
                'animate-in fade-in slide-in-from-bottom-2 flex items-start gap-3 duration-300',
                message.role === 'user' && 'justify-end',
              )}
            >
              {message.role !== 'user' && (
                <Avatar className="h-8 w-8 shrink-0 border border-blue-500/30 bg-blue-500/20 text-blue-300">
                  <AvatarFallback>
                    <Bot size={16} />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5 wrap-break-word',
                  message.role === 'user'
                    ? 'rounded-br-md bg-slate-600 text-white'
                    : 'rounded-bl-md border border-white/10 bg-[#2a2d32] text-white/90',
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <div className="mt-1.5 text-[10px] text-white/40">{message.timestamp}</div>
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 shrink-0 border border-purple-500/30 bg-purple-500/20 text-purple-300">
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
