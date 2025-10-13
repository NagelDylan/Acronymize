import styled from "styled-components";
import { ScreenWrapper } from "./common/ScreenWrapper";
import { theme } from "../theme";

interface InstructionsPageProps {
  onAuthClick: () => void;
  onDismiss: () => void;
}

const Title = styled.h1`
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.xxxxl};
  font-weight: ${theme.fontWeights.bold};
  margin-bottom: ${theme.spacing.xl};
  font-family: "Inter", sans-serif;
`;

const Subtitle = styled.p`
  color: ${theme.colors.secondaryText};
  font-size: ${theme.fontSizes.lg};
  margin-bottom: ${theme.spacing.xxxxl};
  font-family: "Inter", sans-serif;
`;

const Section = styled.section`
  margin-bottom: ${theme.spacing.xxxxl};
`;

const SectionTitle = styled.h2`
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.xxl};
  font-weight: ${theme.fontWeights.bold};
  margin-bottom: ${theme.spacing.lg};
  font-family: "Inter", sans-serif;
`;

const SectionContent = styled.div`
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.base};
  line-height: 1.7;
  font-family: "Inter", sans-serif;
`;

const Paragraph = styled.p`
  margin-bottom: ${theme.spacing.lg};
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${theme.spacing.lg} 0;
`;

const ListItem = styled.li`
  margin-bottom: ${theme.spacing.md};
  padding-left: ${theme.spacing.xl};
  position: relative;

  &:before {
    content: "→";
    position: absolute;
    left: 0;
    color: ${theme.colors.accentIndigo};
    font-weight: ${theme.fontWeights.bold};
  }
`;

const ExampleCard = styled.div`
  background-color: ${theme.colors.cardBackground};
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.xl};
  margin: ${theme.spacing.lg} 0;
`;

const ExampleTitle = styled.div`
  color: ${theme.colors.secondaryText};
  font-size: ${theme.fontSizes.sm};
  margin-bottom: ${theme.spacing.sm};
  font-family: "Inter", sans-serif;
`;

const Acronym = styled.div`
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.xxl};
  font-weight: ${theme.fontWeights.bold};
  letter-spacing: 16px;
  margin-bottom: ${theme.spacing.md};
  font-family: "Inter", sans-serif;
`;

const WordRow = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const WordBadge = styled.span<{ $color: "green" | "yellow" | "gray" }>`
  padding: 4px ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSizes.sm};
  font-family: "Inter", sans-serif;

  ${(props) => {
    switch (props.$color) {
      case "green":
        return `
          background-color: ${theme.colors.accentGreen};
          color: ${theme.colors.white};
        `;
      case "yellow":
        return `
          background-color: ${theme.colors.accentYellow};
          color: ${theme.colors.white};
        `;
      case "gray":
        return `
          background-color: transparent;
          color: ${theme.colors.secondaryText};
        `;
    }
  }}
`;

const HighlightBox = styled.div`
  background-color: ${theme.colors.accentIndigo}15;
  border-left: 4px solid ${theme.colors.accentIndigo};
  padding: ${theme.spacing.lg};
  margin: ${theme.spacing.lg} 0;
  border-radius: 4px;
`;

const HighlightText = styled.p`
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.base};
  font-family: "Inter", sans-serif;
  margin: 0;
`;

export function InstructionsPage({
  onAuthClick,
  onDismiss,
}: InstructionsPageProps) {
  return (
    <ScreenWrapper onDismiss={onDismiss} onAuthClick={onAuthClick}>
      <Title>How to Play</Title>
      <Subtitle>Master the art of acronym guessing</Subtitle>

      <Section>
        <SectionTitle>The Objective</SectionTitle>
        <SectionContent>
          <Paragraph>
            Your goal is to guess the phrase or sentence that matches the given
            acronym. Each letter in the acronym represents the first letter of a
            word in the solution.
          </Paragraph>
          <ExampleCard>
            <ExampleTitle>Example:</ExampleTitle>
            <Acronym>B R B</Acronym>
            <Paragraph style={{ marginBottom: 0 }}>
              Answer: <strong>Be Right Back</strong>
            </Paragraph>
          </ExampleCard>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>How to Guess</SectionTitle>
        <SectionContent>
          <List>
            <ListItem>Type your guess for the complete phrase</ListItem>
            <ListItem>
              Make sure your guess has the same number of words as the acronym
              has letters
            </ListItem>
            <ListItem>Press Enter to submit your guess</ListItem>
            <ListItem>
              Each word must start with the corresponding letter from the
              acronym
            </ListItem>
          </List>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Understanding Feedback</SectionTitle>
        <SectionContent>
          <Paragraph>
            After each guess, you'll receive color-coded feedback for each word:
          </Paragraph>
          <ExampleCard>
            <WordRow>
              <WordBadge $color="green">Correct</WordBadge>
              <span style={{ color: theme.colors.primaryText }}>
                - Right word in the right position
              </span>
            </WordRow>
            <WordRow>
              <WordBadge $color="yellow">Misplaced</WordBadge>
              <span style={{ color: theme.colors.primaryText }}>
                - Right word but wrong position
              </span>
            </WordRow>
            <WordRow>
              <WordBadge $color="gray">Incorrect</WordBadge>
              <span style={{ color: theme.colors.primaryText }}>
                - Word not in the solution
              </span>
            </WordRow>
          </ExampleCard>
          <Paragraph>
            You'll also see a gradient meter below each guess that shows how
            semantically similar your guess is to the correct answer. The more
            the bar fills (and the greener it gets), the closer you are!
          </Paragraph>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Game Modes</SectionTitle>
        <SectionContent>
          <List>
            <ListItem>
              <strong>Daily Puzzle:</strong> A new challenge every day that
              everyone plays
            </ListItem>
            <ListItem>
              <strong>Endless Run:</strong> Keep playing until you fail - how
              long can you last?
            </ListItem>
            <ListItem>
              <strong>Level Up:</strong> Progress through increasingly difficult
              curated challenges
            </ListItem>
          </List>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Tips for Success</SectionTitle>
        <SectionContent>
          <HighlightBox>
            <HighlightText>
              💡 Pay attention to the theme! It's your biggest clue to the
              context of the acronym.
            </HighlightText>
          </HighlightBox>
          <List>
            <ListItem>Start with common phrases that match the theme</ListItem>
            <ListItem>
              Use the semantic similarity meter to gauge if you're on the right
              track
            </ListItem>
            <ListItem>
              If words are marked as "misplaced," try rearranging them
            </ListItem>
            <ListItem>
              Think about the context - workplace, internet slang, everyday
              phrases, etc.
            </ListItem>
          </List>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Scoring</SectionTitle>
        <SectionContent>
          <Paragraph>
            Your performance is rated based on how many guesses it takes you to
            find the solution:
          </Paragraph>
          <List>
            <ListItem>
              <strong>Crushed It:</strong> Solved in 3 guesses or fewer -
              excellent work!
            </ListItem>
            <ListItem>
              <strong>Solid Effort:</strong> Solved in 4-6 guesses - good job!
            </ListItem>
            <ListItem>
              <strong>Glorious Failure:</strong> Didn't solve it, but gave it
              your best shot
            </ListItem>
          </List>
        </SectionContent>
      </Section>
    </ScreenWrapper>
  );
}
