"use client";
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

interface FacialDetectorProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  onExpressionChange?: (expressions: Record<string, number>) => void;
  detectionInterval?: number;
}

const FacialDetector: React.FC<FacialDetectorProps> = ({
  videoRef,
  isActive,
  onExpressionChange,
  detectionInterval = 500,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load face-api models from local public folder
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";

        // --- CORRECT FIX ---
        // 1. Explicitly set the backend (WebGL is fastest)
        // We wrap this in a check because faceapi.tf might behave differently in some builds
        if (faceapi.tf) {
          try {
            await faceapi.tf.setBackend("webgl");
            console.log("Using WebGL backend");
          } catch (err) {
            console.warn("WebGL backend failed, falling back to CPU", err);
            await faceapi.tf.setBackend("cpu");
          }
        }
        // -------------------

        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);

        setModelsLoaded(true);
        console.log("✅ Face-api models loaded from local files");
      } catch (error) {
        console.error("❌ Error loading face-api models:", error);
      }
    };

    loadModels();
  }, []);

  // Start/Stop expression detection
  useEffect(() => {
    if (!modelsLoaded || !isActive || !videoRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const detectExpressions = async () => {
      const video = videoRef.current;
      if (!video || video.readyState !== 4) return;

      try {
        const detections = await faceapi
          .detectAllFaces(
            video,
            new faceapi.SsdMobilenetv1Options({
              minConfidence: 0.5,
            })
          )
          .withFaceExpressions();

        if (detections.length > 0) {
          const expressions = detections[0].expressions;

          // Convert to percentages and log
          const expressionPercentages = {
            angry: Math.round(expressions.angry * 100),
            sad: Math.round(expressions.sad * 100),
            happy: Math.round(expressions.happy * 100),
            neutral: Math.round(expressions.neutral * 100),
            surprised: Math.round(expressions.surprised * 100),
            fearful: Math.round(expressions.fearful * 100),
            disgusted: Math.round(expressions.disgusted * 100),
          };

          console.log("📊 Expression Values:", expressionPercentages);

          // Send raw values (0-1) to parent for averaging
          const rawExpressions = {
            angry: expressions.angry,
            sad: expressions.sad,
            happy: expressions.happy,
            neutral: expressions.neutral,
            surprised: expressions.surprised,
            fearful: expressions.fearful,
            disgusted: expressions.disgusted,
          };

          onExpressionChange?.(rawExpressions);

          // dominant expression
          const sorted = Object.keys(expressions).sort(
            (a, b) =>
              Number(expressions[b as keyof typeof expressions]) -
              Number(expressions[a as keyof typeof expressions])
          );

          const dominantExpression = sorted[0];
          console.log(" Dominant Expression:", dominantExpression);

          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const displaySize = {
              width: video.videoWidth,
              height: video.videoHeight,
            };

            faceapi.matchDimensions(canvas, displaySize);
            const resizedDetections = faceapi.resizeResults(
              detections,
              displaySize
            );

            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              // Uncomment to show visual overlay:
              // faceapi.draw.drawDetections(canvas, resizedDetections);
              // faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
            }
          }
        }
      } catch (error) {
        console.error("❌ Error detecting expressions:", error);
      }
    };

    intervalRef.current = setInterval(detectExpressions, detectionInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [modelsLoaded, isActive, videoRef, onExpressionChange, detectionInterval]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ display: "none" }}
    />
  );
};

export default FacialDetector;
