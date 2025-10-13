import { useState } from "react";
import styled from "styled-components";
import { theme } from "../theme";

interface Word {
  text: string;
  status: "correct" | "misplaced" | "incorrect";
}

interface GuessRowProps {
  words: Word[];
  rowSimilarityScore: number;
  showHoverEffect?: boolean;
  isHighlighted?: boolean;
}

const RowContainer = styled.div<{
  $showHoverEffect: boolean;
  $isHovered: boolean;
  $isHighlighted: boolean;
}>`
  transition: opacity ${theme.transitions.fast};
  opacity: ${(props) => {
    if (props.$isHighlighted || props.$isHovered) return 1;
    if (props.$showHoverEffect) return 0.5;
    return 1;
  }};
`;

const WordGrid = styled.div<{ $numWords: number }>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.$numWords}, 1fr);
  gap: ${theme.spacing.lg};
`;

const WordColumn = styled.div`
  display: flex;
  justify-content: center;
`;

const WordTile = styled.div<{
  $bgColor: string;
  $textColor: string;
  $fontWeight: number;
}>`
  padding: 6px ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  background-color: ${(props) => props.$bgColor};
  color: ${(props) => props.$textColor};
  font-weight: ${(props) => props.$fontWeight};
  font-family: "Inter", sans-serif;
`;

const MeterContainer = styled.div`
  margin-top: ${theme.spacing.md};
  width: 100%;
  height: 5px;
  border-radius: 9999px;
  overflow: hidden;
  background-color: transparent;
`;

const MeterBar = styled.div<{ $width: number }>`
  height: 100%;
  border-radius: 9999px;
  width: ${(props) => props.$width}%;
  background: linear-gradient(
    to right,
    ${theme.colors.gradientRed},
    ${theme.colors.gradientYellow},
    ${theme.colors.gradientGreen}
  );
`;

export function GuessRow({
  words,
  rowSimilarityScore,
  showHoverEffect = true,
  isHighlighted = false,
}: GuessRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <RowContainer
      $showHoverEffect={showHoverEffect}
      $isHovered={isHovered}
      $isHighlighted={isHighlighted}
      onMouseEnter={() => showHoverEffect && setIsHovered(true)}
      onMouseLeave={() => showHoverEffect && setIsHovered(false)}
    >
      <WordGrid $numWords={words.length}>
        {words.map((word, index) => {
          let bgColor = "transparent";
          let textColor = theme.colors.secondaryText;

          if (word.status === "correct") {
            bgColor = theme.colors.accentGreen;
            textColor = theme.colors.white;
          } else if (word.status === "misplaced") {
            bgColor = theme.colors.accentYellow;
            textColor = theme.colors.white;
          }

          return (
            <WordColumn key={index}>
              <WordTile
                $bgColor={bgColor}
                $textColor={textColor}
                $fontWeight={word.status === "incorrect" ? 400 : 500}
              >
                {word.text}
              </WordTile>
            </WordColumn>
          );
        })}
      </WordGrid>

      <MeterContainer>
        <MeterBar $width={rowSimilarityScore} />
      </MeterContainer>
    </RowContainer>
  );
}
