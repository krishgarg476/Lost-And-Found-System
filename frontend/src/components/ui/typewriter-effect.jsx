"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const TypewriterEffectSmooth = ({
  words,
  className = "",
  cursorClassName = "",
}) => {
  // Split array of words into individual characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCharacterIndex((prev) => prev + 1);
    }, 100); // Speed of typing

    return () => clearInterval(interval);
  }, []);

  const renderWords = () => {
    return (
      <div className={`flex flex-row items-center justify-center gap-4 ${className}`}>
        {wordsArray.map((word, wordIndex) => {
          const isLastWord = wordIndex === wordsArray.length - 1;
          return (
            <div key={wordIndex} className="flex flex-row items-center">
              {word.text.map((char, charIndex) => {
                return (
                  <motion.span
                    key={charIndex}
                    className={`font-bold ${word.className ?? ""}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: charIndex * 0.1 }}
                  >
                    {char}
                  </motion.span>
                );
              })}
              {/* {!isLastWord && (
                <span className="text-4xl sm:text-6xl lg:text-8xl font-bold mr-2">&nbsp;</span>
              )} */}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-row items-center justify-center">
        {renderWords()}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className={`font-bold ${cursorClassName}`}
        >
          |
        </motion.span>
      </div>
    </div>
  );
};