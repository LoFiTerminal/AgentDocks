'use client';

import { useState, useEffect } from 'react';

export const AnimatedTagline = () => {
  const insecureText = "Someone's Cloud";
  const secureText = "On Your Machine";
  const [displayText, setDisplayText] = useState(insecureText);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const fullCycle = async () => {
      // Wait 2 seconds before starting transition
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsTransitioning(true);
      
      // Animate letter by letter from insecure to secure
      for (let i = 0; i <= secureText.length; i++) {
        setCharIndex(i);
        await new Promise(resolve => setTimeout(resolve, 80)); // 80ms per letter
      }
      
      // Wait 3 seconds on secure text
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Reset back to insecure instantly
      setIsTransitioning(false);
      setCharIndex(0);
      
      // Wait 1 second before next cycle
      await new Promise(resolve => setTimeout(resolve, 1000));
    };

    // Run the animation cycle
    const runCycle = async () => {
      while (true) {
        await fullCycle();
      }
    };

    runCycle();
  }, []);

  // Build the display text character by character
  const getDisplayText = () => {
    if (!isTransitioning) {
      return insecureText;
    }
    
    // Show transformation: gradually replace insecure with secure
    const securePartLength = charIndex;
    const securePart = secureText.slice(0, securePartLength);
    const insecurePart = insecureText.slice(securePartLength);
    
    return securePart + insecurePart.slice(0, Math.max(0, insecureText.length - securePartLength));
  };

  const text = getDisplayText();
  const isSecure = isTransitioning && charIndex === secureText.length;
  const transitionProgress = isTransitioning ? charIndex / secureText.length : 0;

  return (
    <span 
      className="relative inline-block transition-colors duration-300"
      style={{
        color: isTransitioning 
          ? `rgb(${255 - (transitionProgress * 255)}, ${34 + (transitionProgress * 163)}, ${34 + (transitionProgress * 34)})`
          : 'rgb(255, 34, 34)' // Red for insecure
      }}
    >
      {text}
      {/* Cursor effect during transition */}
      {isTransitioning && charIndex < secureText.length && (
        <span className="inline-block w-0.5 h-8 ml-1 bg-current animate-pulse" />
      )}
    </span>
  );
};
