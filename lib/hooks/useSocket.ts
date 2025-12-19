"use client"
/**
 * Socket.io client hook for real-time interview state sync
 * Connects to backend WebSocket server and manages event subscriptions
 * Uses singleton pattern to ensure only one socket connection exists
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useInterviewStore } from '../stores/interview-store';
import { SocketEvent, InterviewStateSnapshot, CodingProblem, CodeExecutionResult } from '../types/interview-state';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Singleton socket instance - shared across all hook consumers
let sharedSocket: Socket | null = null;
let sharedSocketUserId: string | null = null;
let connectionCount = 0;

interface UseSocketOptions {
  interviewId?: string | null;
  userId?: string | null;
  enabled?: boolean;
}

export const useSocket = ({ interviewId, userId, enabled = true }: UseSocketOptions) => {
  const currentRoomRef = useRef<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  
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
    if (sharedSocket?.connected && interviewId) {
      console.log('[Socket] Emitting CODE_UPDATE', { codeLength: code.length, language });
      sharedSocket.emit(SocketEvent.CODE_UPDATE, {
        interviewId,
        code,
        language,
      });
    } else {
      console.warn('[Socket] Cannot emit CODE_UPDATE: socket not connected or no interviewId', { 
        connected: sharedSocket?.connected, 
        interviewId 
      });
    }
  }, [interviewId]);

  // Emit expression data to server
  const emitExpressionUpdate = useCallback((expressions: Record<string, number>) => {
    if (sharedSocket?.connected && interviewId) {
      sharedSocket.emit(SocketEvent.EXPRESSION_UPDATE, {
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

    // Track how many hook instances are using the socket
    connectionCount++;

    // If socket already exists for this user, reuse it
    if (sharedSocket?.connected && sharedSocketUserId === userId) {
      console.log('[Socket] Reusing existing connection:', sharedSocket.id);
      setIsSocketConnected(true);
      setConnected(true);
      return () => {
        connectionCount--;
        // Only disconnect when no more consumers
        if (connectionCount === 0) {
          console.log('[Socket] No more consumers, disconnecting');
          sharedSocket?.disconnect();
          sharedSocket = null;
          sharedSocketUserId = null;
          setConnected(false);
          setIsSocketConnected(false);
        }
      };
    }

    // Different user - disconnect old socket first
    if (sharedSocket && sharedSocketUserId !== userId) {
      sharedSocket.disconnect();
      sharedSocket = null;
      sharedSocketUserId = null;
    }

    console.log('[Socket] Creating new connection...');
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    sharedSocket = socket;
    sharedSocketUserId = userId;

    // Connection events
    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setConnected(true);
      setIsSocketConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setConnected(false);
      setIsSocketConnected(false);
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
    socket.on(SocketEvent.CODE_EXECUTED, (data: CodeExecutionResult) => {
      console.log('[Socket] Code executed:', data);
      setCodeExecutionResult(data);
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
      connectionCount--;
      console.log('[Socket] Cleanup called, remaining consumers:', connectionCount);
      // Only disconnect when no more consumers
      if (connectionCount === 0) {
        console.log('[Socket] No more consumers, disconnecting');
        socket.disconnect();
        sharedSocket = null;
        sharedSocketUserId = null;
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

  // Join/leave interview rooms when interviewId changes or socket connects (separate effect)
  useEffect(() => {
    if (!isSocketConnected || !sharedSocket?.connected || !userId) {
      return;
    }

    // Leave previous room if different
    if (currentRoomRef.current && currentRoomRef.current !== interviewId) {
      console.log('[Socket] Leaving room:', currentRoomRef.current);
      sharedSocket.emit(SocketEvent.LEAVE_INTERVIEW, { interviewId: currentRoomRef.current });
      currentRoomRef.current = null;
    }

    // Join new room
    if (interviewId && interviewId !== currentRoomRef.current) {
      console.log('[Socket] Joining room:', interviewId);
      sharedSocket.emit(SocketEvent.JOIN_INTERVIEW, { interviewId, userId });
      currentRoomRef.current = interviewId;
    }
  }, [interviewId, userId, isSocketConnected]);

  return {
    socket: sharedSocket,
    isConnected: isSocketConnected,
    emitCodeUpdate,
    emitExpressionUpdate,
  };
};
