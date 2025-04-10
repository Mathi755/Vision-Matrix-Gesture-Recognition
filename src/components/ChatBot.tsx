import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence
import { MdSend, MdMic, MdMicOff, MdFace, MdClose, MdVolumeOff } from "react-icons/md";
import { FaRobot } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TbMessageChatbotFilled } from "react-icons/tb";
import { FaWindowClose } from "react-icons/fa";

export const ChatBot = ({ theme_card_color }) => {
  // Initialize Google Generative AI
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GENAI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  const chatContainerRef = useRef(null); // Create a reference to the chat container
  const inputRef = useRef(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition. Please use Google Chrome.");
      return;
    }

    const recognitionInstance = new (window as any).webkitSpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = "en-US";

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recognitionInstance.onstart = () => {
      setIsListening(true);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error", event);
      setIsListening(false);
    };

    setRecognition(recognitionInstance);
  }, []);

  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // Show greeting when opening chat
    if (newIsOpen && messages.length === 0) {
      setTimeout(() => {
        setShowGreeting(true);
        setTimeout(() => {
          setMessages([{ text: "Hi there! How can I help you today?", user: false }]);
          setShowGreeting(false);
        }, 1500);
      }, 500);
    }
    
    // Focus input when chat is opened
    if (newIsOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 500);
    }
  };

  const sendMessage = async (message = input) => {
    if (message.trim() === "") return;

    const userMessage = { text: message, user: true };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const botReply = await fetchAIResponse(message);
      setMessages((prev) => [...prev, { text: botReply, user: false }]);
      speakText(botReply); // Speak the bot's reply
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, something went wrong.", user: false },
      ]);
      speakText("Sorry, something went wrong."); // Speak the error message
    }

    setLoading(false);
  };

  // Function to get AI response
  const fetchAIResponse = async (userInput) => {
    if (!userInput) return;

    const prompt = `
    You are the AI assistant for the Gesture Arcade Fun platform. Your role is to provide accurate and friendly responses related to the platform's features and functionality.

    **Guidelines:**
    - Answer only queries related to the platform's features and functionality.
    - If a question is outside the given information, politely state that you don't have the information.
    - Maintain a formal yet approachable tone.

    **Platform Information:**
    - **Name:** Gesture Arcade Fun
    - **Purpose:** Providing an engaging arcade gaming experience with gesture-based controls and AI-powered assistance.
    - **Core Features:** Gesture-Based Gaming, AI Chatbot Assistance, Responsive and Animated UI.

    **Key Features:**
    1. **Gesture-Based Gaming:**
       - Play games like Snake using hand gestures.
       - Gesture recognition powered by the GestureCamera component.
       - Controls include:
         - **Up:** Point up with your index finger.
         - **Down:** Thumb down or lower middle finger.
         - **Left:** Open palm or move hand left.
         - **Right:** Closed fist or move hand right.
       - Real-time feedback on controls and high scores.

    2. **AI-Powered Chatbot:**
       - Integrated chatbot powered by Google Generative AI (gemini-1.5-flash model).
       - Features include:
         - Speech recognition for voice input.
         - Text-to-speech for bot responses.
         - Animated UI interactions using framer-motion.
       - Provides assistance with platform-related queries and game instructions.

    3. **Responsive and Animated UI:**
       - Smooth animations and transitions using framer-motion.
       - Arcade-style themes with glowing effects and dynamic feedback.
       - Interactive dialogs for game instructions and controls.

    **Technical Components:**
    - **ArcadeContainer.tsx:** Manages the Snake game and gesture controls.
    - **SnakeGame.tsx:** Core logic for the Snake game with gesture-based controls.
    - **GestureCamera.tsx:** Handles gesture recognition and updates game controls dynamically.
    - **ChatBot.tsx:** AI-powered chatbot with speech recognition, text-to-speech, and animated UI.

    **How to Play:**
    - Use hand gestures to control the snake's movement.
    - Collect food to grow longer and increase your score.
    - Avoid hitting the walls or yourself to keep playing.

    **Additional Features:**
    - Pause and resume the game at any time.
    - Reset the game or chatbot as needed.
    - Typing indicators and smooth animations for enhanced user engagement.

    **User Testimonials:**
    - *"The gesture controls make playing Snake so much more fun and interactive!"*  
      — **Alex Johnson**, Arcade Enthusiast  

    - *"The AI chatbot is super helpful for understanding how to use the platform."*  
      — **Priya Sharma**, Casual Gamer  

    - *"I love the glowing arcade-style UI. It feels like I'm in a real arcade!"*  
      — **Chris Lee**, Retro Gaming Fan  

    **User Query:** ${userInput}
`;

    try {
      const result = await model.generateContent(prompt);
      const responseText =
        result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I couldn't process that request.";
      return responseText;
    } catch (error) {
      console.error("Error generating AI response:", error);
      return "I'm unable to process your request at the moment.";
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const speakText = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // Scroll to bottom when messages are updated

  // Button hover variants
  const buttonHoverVariants = {
    hover: { 
      scale: 1.15, 
      boxShadow: "0 0 8px rgba(255, 255, 255, 0.5)",
      transition: { type: "spring", stiffness: 400 }
    },
    tap: { 
      scale: 0.9,
      boxShadow: "0 0 2px rgba(255, 255, 255, 0.3)"
    }
  };

  // Message animations
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", damping: 12 }
    },
    exit: { 
      opacity: 0,
      x: 100,
      transition: { duration: 0.3 }
    }
  };

  // Chat container animation
  const chatContainerVariants = {
    hidden: { x: 300, opacity: 0, scale: 0.9 },
    visible: { 
      x: 0, 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 120,
        damping: 20,
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: { 
      x: 300, 
      opacity: 0, 
      scale: 0.9,
      transition: { 
        type: "spring", 
        stiffness: 120,
        damping: 20
      }
    }
  };

  // Typing indicator animation
  const typingVariants = {
    initial: { scale: 0.8, opacity: 0.3 },
    animate: { 
      scale: [0.8, 1, 0.8], 
      opacity: [0.3, 1, 0.3],
      transition: { 
        repeat: Infinity,
        duration: 1,
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end z-50">
      {/* Animated Robot Icon with pulse effect */}
      <motion.div
        className="relative p-4 bg-gradient-to-r from-gray-800 to-black text-white rounded-full cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300"
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        animate={{
          boxShadow: isOpen ? "0 0 0 rgba(255, 255, 255, 0)" : ["0 0 0 rgba(255, 255, 255, 0)", "0 0 15px rgba(255, 255, 255, 0.5)", "0 0 0 rgba(255, 255, 255, 0)"]
        }}
        transition={{
          boxShadow: {
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }
        }}
      >
        <TbMessageChatbotFilled className="text-3xl" />
        
        {/* Notification dot when chat is closed */}
        {!isOpen && messages.length > 0 && (
          <motion.div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </motion.div>

      {/* Chat Sidebar with AnimatePresence for smooth exit */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={chatContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed bottom-0 right-0 w-80 sm:w-96 h-96 ${theme_card_color} flex flex-col p-4 bg-gray-900 rounded-lg shadow-2xl overflow-hidden`}
          >
            {/* Header with animated gradient border */}
            <motion.div 
              className="flex justify-between items-center p-2 text-white relative"
              initial={{ borderBottomWidth: "0px" }}
              animate={{ 
                borderBottomWidth: "2px",
                borderImage: "linear-gradient(90deg, rgba(75,85,99,0) 0%, rgba(255,255,255,0.3) 50%, rgba(75,85,99,0) 100%) 1" 
              }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="flex items-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, repeatDelay: 5, duration: 0.5 }}
                >
                  <FaRobot className="text-xl mr-2" />
                </motion.div>
                <h2 className="text-lg font-semibold">Your Friendly ChatBot</h2>
              </div>
              <motion.button
                onClick={toggleChat}
                className="text-gray-400 hover:text-red-400 transition duration-300 p-1 rounded-full"
                whileHover={{ rotate: 90, scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaWindowClose className="text-xl" />
              </motion.button>
            </motion.div>

            {/* Greeting animation */}
            {showGreeting && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, times: [0, 0.2, 0.8, 1] }}
                >
                  <FaRobot className="text-6xl text-white" />
                </motion.div>
              </motion.div>
            )}

            {/* Chat Messages with animation */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3 p-2">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    layout
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`p-3 max-w-xs text-sm ${
                      msg.user
                        ? "ml-auto bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-l-xl rounded-tr-xl"
                        : "mr-auto bg-gray-800 bg-opacity-75 text-gray-200 rounded-r-xl rounded-tl-xl"
                    }`}
                    style={{
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                    whileHover={{
                      y: -2,
                      boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    <div className="flex items-start gap-2">
                      {!msg.user && (
                        <motion.div
                          className="mt-1 text-blue-400"
                          initial={{ rotate: 0 }}
                          whileHover={{ rotate: 15 }}
                        >
                          <FaRobot size={14} />
                        </motion.div>
                      )}
                      <div>{msg.text}</div>
                      {msg.user && (
                        <motion.div
                          className="mt-1 text-green-400"
                          initial={{ rotate: 0 }}
                          whileHover={{ rotate: -15 }}
                        >
                          <MdFace size={14} />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Typing indicator with animation */}
              {loading && (
                <motion.div 
                  className="p-3 max-w-xs bg-gray-800 bg-opacity-75 text-gray-200 rounded-r-xl rounded-tl-xl flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <div className="flex items-center gap-1">
                    <motion.div
                      variants={typingVariants}
                      initial="initial"
                      animate="animate"
                      className="w-2 h-2 bg-blue-400 rounded-full"
                    />
                    <motion.div
                      variants={typingVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: 0.2 }}
                      className="w-2 h-2 bg-blue-400 rounded-full"
                    />
                    <motion.div
                      variants={typingVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: 0.4 }}
                      className="w-2 h-2 bg-blue-400 rounded-full"
                    />
                  </div>
                  <span className="text-sm">Typing</span>
                </motion.div>
              )}
            </div>

            {/* Input Box with animated focus effect */}
            <motion.div 
              className="flex items-center p-2 bg-gray-800 bg-opacity-75 rounded-lg mt-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ boxShadow: "0 0 8px rgba(255, 255, 255, 0.2)" }}
            >
              <motion.input
                ref={inputRef}
                type="text"
                className="flex-1 p-2 bg-transparent text-white outline-none border-b border-gray-700 focus:border-blue-500 transition-colors duration-300"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                whileFocus={{ scale: 1.01 }}
              />
              
              {/* Animated buttons */}
              <motion.button
                onClick={isListening ? stopListening : startListening}
                className="p-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 text-white ml-2"
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                animate={isListening ? { boxShadow: ["0 0 0px rgba(255, 0, 0, 0)", "0 0 10px rgba(255, 0, 0, 0.5)", "0 0 0px rgba(255, 0, 0, 0)"] } : {}}
                transition={isListening ? { boxShadow: { repeat: Infinity, duration: 1 } } : {}}
              >
                {isListening ? <MdMicOff className="text-xl" /> : <MdMic className="text-xl" />}
              </motion.button>
              
              <motion.button
                onClick={stopSpeaking}
                className="p-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 text-white ml-2"
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <MdVolumeOff className="text-xl" />
              </motion.button>
              
              <motion.button
                onClick={() => sendMessage()}
                className="p-2 rounded-full bg-gradient-to-r from-blue-700 to-blue-900 text-white ml-2"
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                disabled={loading || input.trim() === ""}
              >
                <MdSend className="text-xl" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBot;