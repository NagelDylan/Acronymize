import styled from "styled-components";
import { theme } from "../../theme";
import { GuessRow } from "../GuessRow";

const RightColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GamePreview = styled.div`
  width: 100%;
  max-width: 600px;
  padding: ${theme.spacing.xxxl};
  background-color: ${theme.colors.cardBackground};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.cardBorder};
  box-shadow: 5px 5px 28px #1c1919;
`;

const ThemeText = styled.div`
  color: ${theme.colors.secondaryText};
  font-size: ${theme.fontSizes.sm};
  margin-bottom: ${theme.spacing.lg};
  font-family: "Inter", sans-serif;
`;

const Acronym = styled.div`
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.xxxxl};
  font-weight: ${theme.fontWeights.bold};
  letter-spacing: 24px;
  margin-bottom: ${theme.spacing.xxxl};
  font-family: "Inter", sans-serif;
`;

export function RightSide() {
  const zooExample = {
    words: [
      { text: "Lions", status: "correct" as const },
      { text: "Tigers", status: "correct" as const },
      { text: "Monkeys", status: "correct" as const },
      { text: "Elephants", status: "correct" as const },
    ],
    rowSimilarityScore: 100,
  };

  return (
    <RightColumn>
      <GamePreview>
        <ThemeText>What you see at the zoo</ThemeText>
        <Acronym>L T M E</Acronym>
        <GuessRow
          words={zooExample.words}
          rowSimilarityScore={zooExample.rowSimilarityScore}
          showHoverEffect={false}
        />
      </GamePreview>
    </RightColumn>
  );
}
