
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { 
  initGestureRecognizer, 
  startGestureDetection, 
  stopGestureDetection,
  cleanupGestureRecognizer,
  isIndexFingerUp,
  isMiddleFingerDown,
  isThumbDown,
  isHandPointingLeft,
  isHandPointingRight,
  isClosedFist,
  isOpenPalm,
  isSwipingLeft,
  isSwipingRight
} from '@/services/gestureDetection';

interface GestureCameraProps {
  onControlsChange: (controls: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  }) => void;
  isActive: boolean;
}

const GestureCamera: React.FC<GestureCameraProps> = ({ onControlsChange, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);

  // Initialize gesture recognizer on mount
  useEffect(() => {
    const initRecognizer = async () => {
      const success = await initGestureRecognizer();
      if (success) {
        setIsInitialized(true);
        toast.success("Gesture recognition ready");
      } else {
        toast.error("Failed to initialize gesture recognition");
      }
    };

    initRecognizer();

    return () => {
      cleanupGestureRecognizer();
    };
  }, []);

  // Start/stop camera based on active state
  useEffect(() => {
    if (isActive && isInitialized && !isCameraOn) {
      startCamera();
    } else if (!isActive && isCameraOn) {
      stopCamera();
    }
  }, [isActive, isInitialized, isCameraOn]);

  // Start camera and gesture detection
  const startCamera = async () => {
    const video = videoRef.current;
    if (!video || !isInitialized) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });
      
      video.srcObject = stream;
      await video.play();
      
      setIsCameraOn(true);
      
      // Start gesture detection
      startGestureDetection(video, handleGestureResult);
      
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Unable to access camera");
    }
  };

  // Stop camera and gesture detection
  const stopCamera = () => {
    const video = videoRef.current;
    if (!video) return;

    stopGestureDetection();
    
    const stream = video.srcObject as MediaStream;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      video.srcObject = null;
    }
    
    setIsCameraOn(false);
    
    // Reset controls when camera is off
    onControlsChange({
      up: false,
      down: false,
      left: false,
      right: false
    });
  };

  // Handle gesture recognition results
  const handleGestureResult = (result: any) => {
    const canvas = canvasRef.current;
    if (!canvas || !result || !result.landmarks) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Map landmarks to view
    const videoEl = videoRef.current;
    if (!videoEl) return;
    
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    
    // Mirror canvas horizontally
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    
    // Draw landmarks
    result.landmarks.forEach((landmarks: any) => {
      // Draw hand connections
      for (let i = 0; i < landmarks.length; i++) {
        const x = landmarks[i].x * canvas.width;
        const y = landmarks[i].y * canvas.height;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#4CC9F0';
        ctx.fill();
      }
      
      // Draw hand connections
      drawConnections(ctx, landmarks, canvas.width, canvas.height);
    });
    
    // Process gestures
    processGestures(result);
  };
  
  // Draw hand connections
  const drawConnections = (
    ctx: CanvasRenderingContext2D, 
    landmarks: any[], 
    width: number, 
    height: number
  ) => {
    // Define connections between hand landmarks
    const connections = [
      // Thumb
      [0, 1], [1, 2], [2, 3], [3, 4],
      // Index finger
      [0, 5], [5, 6], [6, 7], [7, 8],
      // Middle finger
      [0, 9], [9, 10], [10, 11], [11, 12],
      // Ring finger
      [0, 13], [13, 14], [14, 15], [15, 16],
      // Pinky
      [0, 17], [17, 18], [18, 19], [19, 20]
    ];
    
    ctx.strokeStyle = '#F72585';
    ctx.lineWidth = 2;
    
    connections.forEach(([i, j]) => {
      const startX = landmarks[i].x * width;
      const startY = landmarks[i].y * height;
      const endX = landmarks[j].x * width;
      const endY = landmarks[j].y * height;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    });
  };

  // Process gestures and update controls
  const processGestures = (result: any) => {
    const controls = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    
    // First try to identify gestures from the MediaPipe model
    if (result.gestures && result.gestures.length > 0) {
      result.gestures.forEach((gesture: any, index: number) => {
        const category = gesture.categoryName;
        
        switch (category) {
          case 'Pointing_Up':
            controls.up = true;
            break;
          case 'Thumb_Down':
            controls.down = true;
            break;
          case 'Thumb_Left':
          case 'Open_Palm': 
            controls.left = true;
            break;
          case 'Thumb_Right':
          case 'Closed_Fist': 
            controls.right = true;
            break;
          default:
            break;
        }
      });
    }
    
    // If no gestures were detected from MediaPipe or they were ambiguous,
    // use our custom gesture detection logic as a fallback
    if (result.landmarks && result.landmarks.length > 0) {
      result.landmarks.forEach((landmarks: any) => {
        // UP gesture - index finger pointing up
        if (isIndexFingerUp(landmarks)) {
          controls.up = true;
        }
        
        // DOWN gesture - middle finger down or thumb down
        if (isMiddleFingerDown(landmarks) || isThumbDown(landmarks)) {
          controls.down = true;
        }
        
        // LEFT gesture - hand pointing left, open palm or swiping left
        if (isHandPointingLeft(landmarks) || isOpenPalm(landmarks) || isSwipingLeft(landmarks)) {
          controls.left = true;
        }
        
        // RIGHT gesture - hand pointing right, closed fist or swiping right
        if (isHandPointingRight(landmarks) || isClosedFist(landmarks) || isSwipingRight(landmarks)) {
          controls.right = true;
        }
      });
    }
    
    onControlsChange(controls);
  };

  return (
    <div className="relative">
      {/* Hidden video element for processing */}
      <video 
        ref={videoRef} 
        className="hidden" 
        autoPlay 
        playsInline
      />
      
      {/* Canvas to render camera with landmarks */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover rounded-lg border-2 border-arcade-neon"
      />
      
      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-arcade-dark bg-opacity-80 rounded-lg">
          <div className="text-center">
            <p className="text-white mb-4">Camera access required for gesture controls</p>
            <button
              onClick={startCamera}
              className="bg-arcade-purple text-white py-2 px-4 rounded-md hover:bg-arcade-blue
                        transition-colors duration-300"
            >
              Start Camera
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestureCamera;
