"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, RotateCcw, Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface KycSelfieCameraProps {
  onCapture: (file: File, previewUrl: string) => void;
  onCancel?: () => void;
}

type CameraState = "requesting" | "ready" | "captured" | "error";

export function KycSelfieCamera({ onCapture, onCancel }: KycSelfieCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("requesting");
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Start camera ──────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraState("requesting");
    setErrorMsg(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraState("ready");
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMsg(
          "Accès caméra refusé. Veuillez l'autoriser dans les paramètres."
        );
      } else {
        setErrorMsg("Erreur d'accès à la caméra.");
      }
      setCameraState("error");
    }
  }, []);

  // ── Stop camera ──────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // ── Capture Photo ──────────────────────────────────────────────────────
  const doCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Center crop & Mirror horizontally
    ctx.translate(size, 0);
    ctx.scale(-1, 1);

    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;

    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `selfie-kyc-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const url = URL.createObjectURL(blob);
        setCapturedFile(file);
        setCapturedUrl(url);
        setCameraState("captured");
        stopCamera();
      },
      "image/jpeg",
      0.85
    );
  }, [stopCamera]);

  // ── Retake ─────────────────────────────────────────────────────────────
  const retake = useCallback(() => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedFile(null);
    setCapturedUrl(null);
    startCamera();
  }, [capturedUrl, startCamera]);

  // ── Confirm ────────────────────────────────────────────────────────────
  const confirmCapture = useCallback(() => {
    if (capturedFile && capturedUrl) {
      onCapture(capturedFile, capturedUrl);
    }
  }, [capturedFile, capturedUrl, onCapture]);

  return (
    <div className="flex flex-col items-center justify-center space-y-5 py-4 w-full">
      {/* ── Circular Viewport Container ── */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border-4 border-slate-900 shadow-2xl bg-black overflow-hidden flex items-center justify-center">
        
        {/* Video feed */}
        {cameraState !== "captured" && (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="absolute w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        )}

        {/* Captured photo preview */}
        {cameraState === "captured" && capturedUrl && (
          <img
            src={capturedUrl}
            alt="Preview"
            className="absolute w-full h-full object-cover animate-in fade-in duration-300"
          />
        )}

        {/* Live overlay guide (Face silhouette oval) */}
        {cameraState === "ready" && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Pulsing guide circle */}
            <div className="absolute inset-4 rounded-full border-2 border-dashed border-emerald-400/60 animate-pulse" />
            
            {/* Biometric scanning line effect */}
            <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent top-0 animate-bounce"
                 style={{ animationDuration: '3s' }} />

            {/* Face guide text (small overlay at the bottom of the circle) */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase bg-slate-950/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
                Centrer le visage
              </span>
            </div>
          </div>
        )}

        {/* Loading / Camera initialization state */}
        {cameraState === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950 text-white">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            <span className="text-[10px] font-bold text-slate-400">Caméra en cours...</span>
          </div>
        )}

        {/* Error State */}
        {cameraState === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950 text-white text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mb-1" />
            <p className="text-[11px] font-bold leading-tight text-slate-300">{errorMsg}</p>
            <button
              onClick={startCamera}
              className="mt-3 text-[10px] font-bold text-emerald-400 hover:underline"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>

      {/* ── Action Buttons under the circle ── */}
      <div className="w-full flex justify-center pt-2">
        {cameraState === "ready" && (
          <button
            type="button"
            onClick={doCapture}
            className="group relative w-16 h-16 rounded-full bg-slate-900 border-4 border-slate-100/90
              flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-400
              active:scale-95 transition-all duration-200 shadow-md"
          >
            <Camera className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        )}

        {cameraState === "captured" && (
          <div className="flex items-center gap-6">
            {/* Retake button */}
            <button
              type="button"
              onClick={retake}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-bold text-slate-600 transition-all active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4" />
              Reprendre
            </button>

            {/* Validate button */}
            <button
              type="button"
              onClick={confirmCapture}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[12px] font-bold text-white transition-all active:scale-[0.98] shadow-sm"
            >
              <Check className="w-4 h-4" />
              Valider la photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
