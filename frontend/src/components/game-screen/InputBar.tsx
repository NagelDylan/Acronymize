import {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import styled, { keyframes } from "styled-components";
import { BlinkingCursor } from "../BlinkingCursor";
import { theme } from "../../theme";

interface InputBarProps {
  currentGuess: string;
  onGuessChange: (guess: string) => void;
  onSubmit: (guess: string) => void;
  acronym: string; // e.g., "G T Y R"
  setOpenExitModal: () => void;
}

export interface InputBarRef {
  focus: () => void;
}

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
`;

const InputContainer = styled.div`
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InputArea = styled.div<{ $isShaking: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${(props) => (props.$isShaking ? shake : "none")} 0.5s ease-in-out;
`;

const ErrorMessage = styled.div<{ $visible: boolean }>`
  margin-top: ${(props) => (props.$visible ? theme.spacing.md : "0")};
  padding: ${(props) =>
    props.$visible ? `${theme.spacing.sm} ${theme.spacing.md}` : "0"};
  background-color: ${(props) =>
    props.$visible ? "rgba(217, 119, 6, 0.1)" : "transparent"};
  border: ${(props) =>
    props.$visible ? "1px solid rgba(217, 119, 6, 0.3)" : "none"};
  border-radius: ${theme.borderRadius.sm};
  color: #d97706;
  font-size: ${theme.fontSizes.sm};
  font-family: "Inter", sans-serif;
  text-align: center;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  max-height: ${(props) => (props.$visible ? "100px" : "0")};
  overflow: hidden;
  transform: translateY(${(props) => (props.$visible ? 0 : -10)}px);
  transition: all 0.3s ease;
  max-width: 400px;
  pointer-events: ${(props) => (props.$visible ? "auto" : "none")};
`;

const CurrentGuessDisplay = styled.div`
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.xxl};
  font-family: "Inter", sans-serif;
  min-height: 1.5em;
  display: flex;
  align-items: center;
  white-space: pre;
`;

const HiddenInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

export const InputBar = forwardRef<InputBarRef, InputBarProps>(
  (
    { currentGuess, onGuessChange, onSubmit, acronym, setOpenExitModal },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [isShaking, setIsShaking] = useState(false);
    const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Expose focus method to parent via ref
    useImperativeHandle(ref, () => ({
      focus: () => {
        const input = inputRef.current;
        if (input) {
          input.focus();
          // Set cursor to end of text
          const length = input.value.length;
          input.setSelectionRange(length, length);
        }
      },
    }));

    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    // Clear error message when user starts typing
    useEffect(() => {
      if (currentGuess && errorMessage) {
        clearErrorMessage();
      }
    }, [currentGuess]);

    const clearErrorMessage = () => {
      setErrorMessage("");
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
    };

    const showError = (message: string) => {
      setErrorMessage(message);
      setIsShaking(true);

      // Clear shake animation after it completes
      setTimeout(() => setIsShaking(false), 500);

      // Clear error message after 2.5 seconds
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setErrorMessage("");
      }, 2500);
    };

    const validateGuess = (
      guess: string
    ): { valid: boolean; error?: string } => {
      const words = guess.trim().split(/\s+/);
      const acronymLetters = acronym.replace(/\s+/g, "").split("");

      // Check if number of words matches acronym length
      if (words.length !== acronymLetters.length) {
        const expected = acronymLetters.length;
        const got = words.length;
        return {
          valid: false,
          error: `Expected ${expected} word${
            expected !== 1 ? "s" : ""
          }, got ${got}`,
        };
      }

      // Check if first letters match the acronym
      for (let i = 0; i < words.length; i++) {
        const firstLetter = words[i][0]?.toUpperCase();
        const expectedLetter = acronymLetters[i]?.toUpperCase();

        if (firstLetter !== expectedLetter) {
          return {
            valid: false,
            error: `Word ${
              i + 1
            } should start with "${expectedLetter}", not "${firstLetter}"`,
          };
        }
      }

      return { valid: true };
    };

    const handleInputBlur = () => {
      // Refocus after a short delay to prevent conflicts
      setTimeout(() => {
        const input = inputRef.current;
        if (input) {
          input.focus();
          // Set cursor to end of text
          const length = input.value.length;
          input.setSelectionRange(length, length);
        }
      }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setOpenExitModal();
        return;
      }
      const allowedKeys = ["Backspace", "Delete", "Enter"];

      // Allow letters (a-z, A-Z)
      const isLetter = /^[a-zA-Z]$/.test(e.key);
      // Allow numbers (0-9)
      const isNumber = /^[0-9]$/.test(e.key);
      // Check if key is in allowed list
      const isAllowedKey = allowedKeys.includes(e.key);
      const isValidSpace =
        e.key === " " && currentGuess.length > 0 && !currentGuess.endsWith(" ");

      // Block if not an allowed character
      if (!isLetter && !isNumber && !isAllowedKey && !isValidSpace) {
        e.preventDefault();
        return;
      }

      // Handle Enter submission
      if (e.key === "Enter" && currentGuess.trim()) {
        const validation = validateGuess(currentGuess.trim());

        if (validation.valid) {
          onSubmit(currentGuess.trim());
        } else {
          showError(validation.error || "Invalid input");
        }
      }
    };

    return (
      <InputContainer>
        <InputArea $isShaking={isShaking}>
          <HiddenInput
            ref={inputRef}
            type="text"
            value={currentGuess}
            onChange={(e) => {
              onGuessChange(e.target.value.toUpperCase());
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
          />
          <CurrentGuessDisplay>{currentGuess}</CurrentGuessDisplay>
          <BlinkingCursor />
        </InputArea>
        <ErrorMessage $visible={!!errorMessage}>{errorMessage}</ErrorMessage>
      </InputContainer>
    );
  }
);
