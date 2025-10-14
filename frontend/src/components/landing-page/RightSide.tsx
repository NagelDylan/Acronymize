import styled from "styled-components";
import { theme } from "../../theme";
import { GuessRow } from "../GuessRow";

interface Word {
  text: string;
  status: "incorrect" | "misplaced" | "correct";
}
interface GuessRowProps {
  words: Word[];
  rowSimilarityScore: number;
  showHoverEffect?: boolean;
  isHighlighted?: boolean;
}

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

const ModeIndicationSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModeIndicator = styled.span`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background-color: ${theme.colors.accentIndigo};
  color: ${theme.colors.white};
  font-size: ${theme.fontSizes.xs};
  border-radius: 9999px;
  font-family: "Inter", sans-serif;
`;

const ThemeText = styled.div`
  color: ${theme.colors.secondaryText};
  font-size: ${theme.fontSizes.lg};
  font-weight: ${theme.fontWeights.normal};
  margin-bottom: ${theme.spacing.sm};
  font-family: "Inter", sans-serif;
  text-align: center;
`;

const Acronym = styled.div`
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.xxxxl};
  font-weight: ${theme.fontWeights.bold};
  letter-spacing: 32px;
  margin-right: -32px;
  font-family: "Inter", sans-serif;
  text-align: center;
`;

const GuessArea = styled.div`
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xxl};
  max-height: 340px;
  overflow-y: auto;
  padding-right: ${theme.spacing.sm};
  scroll-behavior: smooth;
`;

export function RightSide() {
  const guessesExample: GuessRowProps[] = [
    {
      words: [
        { text: "Gave", status: "incorrect" },
        { text: "Out", status: "incorrect" },
        { text: "After", status: "incorrect" },
        { text: "Two", status: "incorrect" },
      ],
      rowSimilarityScore: 10,
    },
    {
      words: [
        { text: "Greatest", status: "correct" },
        { text: "Of", status: "correct" },
        { text: "Another", status: "incorrect" },
        { text: "Timeline", status: "incorrect" },
      ],
      rowSimilarityScore: 60,
    },
    {
      words: [
        { text: "Greatest", status: "correct" },
        { text: "Of", status: "correct" },
        { text: "All", status: "correct" },
        { text: "Time", status: "correct" },
      ],
      rowSimilarityScore: 100,
    },
  ];

  return (
    <RightColumn>
      <GamePreview>
        <ModeIndicationSection>
          <ModeIndicator>Acronymize</ModeIndicator>
        </ModeIndicationSection>
        <ThemeText>How players describe this game</ThemeText>
        <Acronym>GOAT</Acronym>
        <GuessArea>
          {guessesExample.map((guess) => {
            return (
              <GuessRow
                words={guess.words}
                rowSimilarityScore={guess.rowSimilarityScore}
                showHoverEffect={true}
              />
            );
          })}
        </GuessArea>
      </GamePreview>
    </RightColumn>
  );
}
