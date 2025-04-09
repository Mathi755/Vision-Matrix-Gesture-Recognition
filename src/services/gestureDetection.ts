
import {
  FilesetResolver,
  GestureRecognizer,
  GestureRecognizerResult
} from '@mediapipe/tasks-vision';

let gestureRecognizer: GestureRecognizer | null = null;
let webcamRunning = false;
let lastVideoTime = -1;

// Callback type for gesture detection results
type GestureCallback = (result: GestureRecognizerResult) => void;

/**
 * Initialize the gesture recognizer
 */
export const initGestureRecognizer = async (): Promise<boolean> => {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2
    });
    
    return true;
  } catch (error) {
    console.error("Error initializing gesture recognizer:", error);
    return false;
  }
};

/**
 * Start gesture detection from video element
 */
export const startGestureDetection = (
  videoElement: HTMLVideoElement, 
  callback: GestureCallback
): void => {
  if (!gestureRecognizer) {
    console.error("Gesture recognizer not initialized");
    return;
  }
  
  webcamRunning = true;
  
  const detectFrame = () => {
    if (!webcamRunning) return;
    
    if (videoElement.currentTime !== lastVideoTime) {
      lastVideoTime = videoElement.currentTime;
      const result = gestureRecognizer!.recognizeForVideo(videoElement, Date.now());
      callback(result);
    }
    
    requestAnimationFrame(detectFrame);
  };
  
  detectFrame();
};

/**
 * Stop gesture detection
 */
export const stopGestureDetection = (): void => {
  webcamRunning = false;
};

/**
 * Clean up resources
 */
export const cleanupGestureRecognizer = (): void => {
  if (gestureRecognizer) {
    gestureRecognizer.close();
    gestureRecognizer = null;
  }
};

// Helper for improved UP gesture detection - index finger up
export const isIndexFingerUp = (landmarks: any[]): boolean => {
  if (!landmarks || landmarks.length < 21) return false;
  
  // Index finger tip and joints
  const indexTip = landmarks[8];
  const indexPIP = landmarks[6]; // Proximal Interphalangeal joint
  const indexMCP = landmarks[5]; // Metacarpophalangeal joint
  const wrist = landmarks[0];
  
  // Check if index finger is extended upward
  // Vertical check - tip should be above PIP and MCP
  const isPointingUp = indexTip.y < indexPIP.y && indexPIP.y < indexMCP.y && indexMCP.y < wrist.y;
  
  // Ensure other fingers are lower than index
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  // Tolerance value to allow some flexibility in gesture
  const tolerance = 0.05;
  
  // Index should be clearly higher than other fingers
  const isHighest = 
    indexTip.y < middleTip.y - tolerance && 
    indexTip.y < ringTip.y - tolerance && 
    indexTip.y < pinkyTip.y - tolerance;
  
  return isPointingUp && isHighest;
};

// Helper for DOWN gesture detection - thumb down or middle finger down
export const isMiddleFingerDown = (landmarks: any[]): boolean => {
  if (!landmarks || landmarks.length < 21) return false;
  
  // Middle finger tip and joints
  const middleTip = landmarks[12];
  const middlePIP = landmarks[10];
  const middleMCP = landmarks[9];
  const wrist = landmarks[0];
  
  // Check if middle finger is extended downward
  const isPointingDown = middleTip.y > middlePIP.y && middlePIP.y > middleMCP.y && middleMCP.y > wrist.y;
  
  // Ensure middle finger is lower than other fingers
  const indexTip = landmarks[8];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  const tolerance = 0.05;
  
  // Middle finger should be clearly lower than other fingers
  const isLowest = 
    middleTip.y > indexTip.y + tolerance && 
    middleTip.y > ringTip.y + tolerance && 
    middleTip.y > pinkyTip.y + tolerance;
  
  return isPointingDown && isLowest;
};

// Improved thumb down detection for DOWN gesture
export const isThumbDown = (landmarks: any[]): boolean => {
  if (!landmarks || landmarks.length < 21) return false;
  
  // Thumb landmarks
  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];  // Interphalangeal joint
  const thumbMP = landmarks[2];  // Metacarpophalangeal joint
  const thumbCMC = landmarks[1]; // Carpometacarpal joint
  const wrist = landmarks[0];
  
  // Check if thumb is pointing downward (y coordinates increasing from joint to tip)
  const isPointingDown = 
    thumbTip.y > thumbIP.y && 
    thumbIP.y > thumbMP.y && 
    thumbMP.y > thumbCMC.y && 
    thumbCMC.y > wrist.y;
  
  // Ensure other fingers are not extended (closed fist with thumb down)
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  const indexMCP = landmarks[5];
  const middleMCP = landmarks[9];
  const ringMCP = landmarks[13];
  const pinkyMCP = landmarks[17];
  
  // Check if other fingers are curled in (not extended)
  const areFingersCurled = 
    (indexTip.y > indexMCP.y) && 
    (middleTip.y > middleMCP.y) && 
    (ringTip.y > ringMCP.y) && 
    (pinkyTip.y > pinkyMCP.y);
  
  // Additional check to ensure thumb is clearly pointing down (stronger condition)
  const tolerance = 0.1;
  const isClearlyDown = thumbTip.y > (wrist.y + tolerance);
  
  return isPointingDown && (areFingersCurled || isClearlyDown);
};

// Helper for LEFT gesture detection (improved)
export const isHandPointingLeft = (landmarks: any[]): boolean => {
  if (!landmarks || landmarks.length < 21) return false;
  
  // Get wrist and fingertips
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  // Calculate average x position of fingertips
  const fingertipsAvgX = (indexTip.x + middleTip.x + ringTip.x + pinkyTip.x) / 4;
  
  // Check if fingers are extended to the left of the wrist
  const threshold = 0.1;
  
  // Strong left pointing gesture - all fingers should be significantly to the left of wrist
  const isClearlySidewaysLeft = 
    indexTip.x < wrist.x - threshold && 
    middleTip.x < wrist.x - threshold && 
    ringTip.x < wrist.x - threshold && 
    pinkyTip.x < wrist.x - threshold;
  
  // Alternative: check if hand is flat (fingers aligned horizontally) and pointing left
  const fingersAligned = 
    Math.abs(indexTip.y - middleTip.y) < 0.05 && 
    Math.abs(middleTip.y - ringTip.y) < 0.05 && 
    Math.abs(ringTip.y - pinkyTip.y) < 0.05;
  
  const isSwipeLeft = fingertipsAvgX < wrist.x - threshold && fingersAligned;
  
  return isClearlySidewaysLeft || isSwipeLeft;
};

// Helper for RIGHT gesture detection (improved)
export const isHandPointingRight = (landmarks: any[]): boolean => {
  if (!landmarks || landmarks.length < 21) return false;
  
  // Get wrist and fingertips
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  // Calculate average x position of fingertips
  const fingertipsAvgX = (indexTip.x + middleTip.x + ringTip.x + pinkyTip.x) / 4;
  
  // Check if fingers are extended to the right of the wrist
  const threshold = 0.1;
  
  // Strong right pointing gesture - all fingers should be significantly to the right of wrist
  const isClearlySidewaysRight = 
    indexTip.x > wrist.x + threshold && 
    middleTip.x > wrist.x + threshold && 
    ringTip.x > wrist.x + threshold && 
    pinkyTip.x > wrist.x + threshold;
  
  // Alternative: check if hand is flat (fingers aligned horizontally) and pointing right
  const fingersAligned = 
    Math.abs(indexTip.y - middleTip.y) < 0.05 && 
    Math.abs(middleTip.y - ringTip.y) < 0.05 && 
    Math.abs(ringTip.y - pinkyTip.y) < 0.05;
  
  const isSwipeRight = fingertipsAvgX > wrist.x + threshold && fingersAligned;
  
  return isClearlySidewaysRight || isSwipeRight;
};

// Helper to detect a fist (closed hand) - often used for RIGHT
export const isClosedFist = (landmarks: any[]): boolean => {
  if (!landmarks || landmarks.length < 21) return false;
  
  const wrist = landmarks[0];
  // Tips of fingers
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  // MCP joints (knuckles at base of fingers)
  const indexMCP = landmarks[5];
  const middleMCP = landmarks[9];
  const ringMCP = landmarks[13];
  const pinkyMCP = landmarks[17];
  
  // A fist is formed when all fingertips are close to the palm
  // For fingers, check if tips are below their MCPs (curled)
  const isIndexCurled = indexTip.y > indexMCP.y;
  const isMiddleCurled = middleTip.y > middleMCP.y;
  const isRingCurled = ringTip.y > ringMCP.y;
  const isPinkyCurled = pinkyTip.y > pinkyMCP.y;
  
  // Additionally, check that fingertips are close to each other horizontally
  const maxDistanceBetweenFingers = 0.1;
  const fingersCloseHorizontally = 
    Math.abs(indexTip.x - middleTip.x) < maxDistanceBetweenFingers && 
    Math.abs(middleTip.x - ringTip.x) < maxDistanceBetweenFingers && 
    Math.abs(ringTip.x - pinkyTip.x) < maxDistanceBetweenFingers;
  
  // All fingers need to be curled inward
  return isIndexCurled && isMiddleCurled && isRingCurled && isPinkyCurled && fingersCloseHorizontally;
};

// Helper to detect an open palm - often used for LEFT
export const isOpenPalm = (landmarks: any[]): boolean => {
  if (!landmarks || landmarks.length < 21) return false;
  
  // Tips of fingers
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  // MCP joints (knuckles)
  const indexMCP = landmarks[5];
  const middleMCP = landmarks[9];
  const ringMCP = landmarks[13];
  const pinkyMCP = landmarks[17];
  
  // An open palm is when all fingers are extended and spread
  const fingersExtended = 
    indexTip.y < indexMCP.y && 
    middleTip.y < middleMCP.y && 
    ringTip.y < ringMCP.y && 
    pinkyTip.y < pinkyMCP.y;
  
  // Check if fingers are spread apart horizontally
  const spreadThreshold = 0.02;
  const fingersSpread = 
    Math.abs(indexTip.x - middleTip.x) > spreadThreshold &&
    Math.abs(middleTip.x - ringTip.x) > spreadThreshold &&
    Math.abs(ringTip.x - pinkyTip.x) > spreadThreshold;
  
  return fingersExtended && fingersSpread;
};

// Helper to detect a swipe left gesture
export const isSwipingLeft = (landmarks: any[]): boolean => {
  if (!landmarks || landmarks.length < 21) return false;
  
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  // For a swipe, we want fingers extended and aligned horizontally
  const fingersAlignedHorizontally = 
    Math.abs(indexTip.y - middleTip.y) < 0.05 && 
    Math.abs(middleTip.y - ringTip.y) < 0.05 && 
    Math.abs(ringTip.y - pinkyTip.y) < 0.05;
  
  // For swiping left, fingers should be to the left of the wrist
  const fingersToLeftOfWrist = 
    indexTip.x < wrist.x - 0.15 && 
    middleTip.x < wrist.x - 0.15 && 
    ringTip.x < wrist.x - 0.15 && 
    pinkyTip.x < wrist.x - 0.15;
  
  return fingersAlignedHorizontally && fingersToLeftOfWrist;
};

// Helper to detect a swipe right gesture
export const isSwipingRight = (landmarks: any[]): boolean => {
  if (!landmarks || landmarks.length < 21) return false;
  
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  // For a swipe, we want fingers extended and aligned horizontally
  const fingersAlignedHorizontally = 
    Math.abs(indexTip.y - middleTip.y) < 0.05 && 
    Math.abs(middleTip.y - ringTip.y) < 0.05 && 
    Math.abs(ringTip.y - pinkyTip.y) < 0.05;
  
  // For swiping right, fingers should be to the right of the wrist
  const fingersToRightOfWrist = 
    indexTip.x > wrist.x + 0.15 && 
    middleTip.x > wrist.x + 0.15 && 
    ringTip.x > wrist.x + 0.15 && 
    pinkyTip.x > wrist.x + 0.15;
  
  return fingersAlignedHorizontally && fingersToRightOfWrist;
};
