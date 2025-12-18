"use client"
/**
 * Socket.io client hook for real-time interview state sync
 * Connects to backend WebSocket server and manages event subscriptions
 */

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useInterviewStore } from '../stores/interview-store';
import { SocketEvent, InterviewStateSnapshot, CodingProblem, CodeExecutionResult } from '../types/interview-state';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface UseSocketOptions {
  interviewId?: string | null;
  userId?: string | null;
  enabled?: boolean;
}

export const useSocket = ({ interviewId, userId, enabled = true }: UseSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const currentRoomRef = useRef<string | null>(null);
  
  const {
    setConnected,
    setInterviewState,
    setCurrentQuestion,
    setLastEvaluation,
    setCodingProblem,
    setCodeExecutionResult,
    addToTranscript,
    setError,
  } = useInterviewStore();

  // Emit code update to server
  const emitCodeUpdate = useCallback((code: string, language: string) => {
    if (socketRef.current?.connected && interviewId) {
      socketRef.current.emit(SocketEvent.CODE_UPDATE, {
        interviewId,
        code,
        language,
      });
    }
  }, [interviewId]);

  // Emit expression data to server
  const emitExpressionUpdate = useCallback((expressions: Record<string, number>) => {
    if (socketRef.current?.connected && interviewId) {
      socketRef.current.emit(SocketEvent.EXPRESSION_UPDATE, {
        interviewId,
        expressions,
      });
    }
  }, [interviewId]);

  // Connect to socket server (only depends on enabled and userId - NOT interviewId)
  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    // Don't recreate if already connected
    if (socketRef.current?.connected) {
      return;
    }

    console.log('[Socket] Creating new connection...');
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setConnected(false);
      currentRoomRef.current = null;
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      setError('Failed to connect to interview server');
      setConnected(false);
    });

    // Interview state update
    socket.on(SocketEvent.STATE_UPDATE, (data: { state: InterviewStateSnapshot }) => {
      console.log('[Socket] State update received:', data.state?.phase);
      setInterviewState(data.state);
    });

    // Question asked event
    socket.on(SocketEvent.QUESTION_ASKED, (data: {
      question: string;
      questionId: string;
      category: string;
      difficulty: string;
      questionNumber: number;
    }) => {
      console.log('[Socket] Question asked:', data);
      setCurrentQuestion({
        id: data.questionId,
        question: data.question,
        category: data.category,
        difficulty: data.difficulty,
        questionNumber: data.questionNumber,
      });
      
      addToTranscript({
        role: 'assistant',
        content: data.question,
        timestamp: new Date().toISOString(),
        type: 'question',
        metadata: {
          questionId: data.questionId,
          category: data.category,
          difficulty: data.difficulty,
        },
      });
    });

    // Answer evaluated event
    socket.on(SocketEvent.ANSWER_EVALUATED, (data: {
      questionId: string;
      score: number;
      feedback: string;
      strengths?: string[];
      improvements?: string[];
      followUpQuestion?: string;
    }) => {
      console.log('[Socket] Answer evaluated:', data);
      setLastEvaluation({
        questionId: data.questionId,
        score: data.score,
        feedback: data.feedback,
        strengths: data.strengths || [],
        improvements: data.improvements || [],
        followUpQuestion: data.followUpQuestion,
      });
    });

    // Coding problem assigned
    socket.on(SocketEvent.CODING_PROBLEM_ASSIGNED, (data: {
      problem: CodingProblem;
    }) => {
      console.log('[Socket] Coding problem assigned:', data);
      setCodingProblem(data.problem);
    });

    // Code executed
    socket.on(SocketEvent.CODE_EXECUTED, (data: {
      result: CodeExecutionResult;
    }) => {
      console.log('[Socket] Code executed:', data);
      setCodeExecutionResult(data.result);
    });

    // Interview completed
    socket.on(SocketEvent.INTERVIEW_COMPLETED, (data: {
      summary: unknown;
    }) => {
      console.log('[Socket] Interview completed:', data);
    });

    // Error event
    socket.on('error', (error: { message: string }) => {
      console.error('[Socket] Error:', error);
      setError(error.message);
    });

    return () => {
      console.log('[Socket] Cleaning up connection');
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
        currentRoomRef.current = null;
        setConnected(false);
      }
    };
  }, [
    enabled,
    userId,
    // Removed interviewId - socket stays connected, just joins/leaves rooms
    setConnected,
    setInterviewState,
    setCurrentQuestion,
    setLastEvaluation,
    setCodingProblem,
    setCodeExecutionResult,
    addToTranscript,
    setError,
  ]);

  // Join/leave interview rooms when interviewId changes (separate effect)
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket?.connected || !userId) {
      return;
    }

    // Leave previous room if different
    if (currentRoomRef.current && currentRoomRef.current !== interviewId) {
      console.log('[Socket] Leaving room:', currentRoomRef.current);
      socket.emit(SocketEvent.LEAVE_INTERVIEW, { interviewId: currentRoomRef.current });
      currentRoomRef.current = null;
    }

    // Join new room
    if (interviewId && interviewId !== currentRoomRef.current) {
      console.log('[Socket] Joining room:', interviewId);
      socket.emit(SocketEvent.JOIN_INTERVIEW, { interviewId, userId });
      currentRoomRef.current = interviewId;
    }
  }, [interviewId, userId]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    emitCodeUpdate,
    emitExpressionUpdate,
  };
};
