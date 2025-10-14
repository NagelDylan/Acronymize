import { useState } from "react";
import styled from "styled-components";
import { theme } from "../../theme";
import { type InteractiveCardProps } from "../../types/components";

const CardContainer = styled.div`
  position: relative;
`;

const Card = styled.button<{ $disabled: boolean; $isHovered: boolean }>`
  width: 100%;
  padding: ${theme.spacing.xxxl};
  background-color: ${theme.colors.cardBackground};
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.medium};
  text-align: left;
  position: relative;
  overflow: hidden;
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
  box-shadow: ${(props) =>
    props.$isHovered && !props.$disabled ? theme.shadows.card : "none"};
  border: 1px solid
    ${(props) =>
      props.$isHovered && !props.$disabled
        ? theme.colors.accentIndigo
        : "transparent"};
  transform: ${(props) =>
    props.$isHovered && !props.$disabled
      ? "translateY(-2px)"
      : "translateY(0)"};
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
`;

const Icon = styled.div`
  font-size: 36px;
  margin-bottom: ${theme.spacing.lg};
`;

const Title = styled.h3`
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.xl};
  font-weight: ${theme.fontWeights.bold};
  margin-bottom: ${theme.spacing.sm};
  font-family: "Inter", sans-serif;
`;

const Description = styled.p`
  color: ${theme.colors.secondaryText};
  font-size: ${theme.fontSizes.sm};
  font-family: "Inter", sans-serif;
`;

const Badge = styled.div`
  position: absolute;
  top: ${theme.spacing.lg};
  right: ${theme.spacing.lg};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background-color: ${theme.colors.accentIndigo};
  color: ${theme.colors.white};
  font-size: ${theme.fontSizes.xs};
  border-radius: 9999px;
  font-family: "Inter", sans-serif;
`;

const InfoIcon = styled.div<{ $isInfoHovered: boolean }>`
  position: absolute;
  top: ${theme.spacing.lg};
  right: ${theme.spacing.lg};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${theme.colors.cardBorder};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) =>
    props.$isInfoHovered
      ? theme.colors.primaryText
      : theme.colors.secondaryText};
  transition: color ${theme.transitions.fast};
  font-family: "Inter", sans-serif;
`;

const Tooltip = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  margin-top: 48px;
  margin-right: ${theme.spacing.lg};
  width: 256px;
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.cardBackgroundAlt};
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.sm};
  border-radius: ${theme.borderRadius.sm};
  box-shadow: ${theme.shadows.xl};
  z-index: 10;
  border: 1px solid ${theme.colors.cardBorderAlt};
  font-family: "Inter", sans-serif;
`;

const HighScoreValue = styled.div<{ $score: number }>`
  position: absolute;
  top: ${theme.spacing.lg};
  right: ${theme.spacing.lg};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  color: ${theme.colors.white};
  font-size: ${theme.fontSizes.xs};
  border-radius: 9999px;
  font-family: "Inter", sans-serif;
  background-color: ${theme.colors.accentIndigo};

  ${(props) => {
    if (props.$score < 10) {
      return `
        background-color: ${theme.colors.accentRed};
      `;
    } else if (props.$score < 40) {
      return `
        background-color: ${theme.colors.accentYellow};
      `;
    } else {
      return `
        background-color: ${theme.colors.accentGreen};
      `;
    }
  }}
`;

export function InteractiveCard({
  icon,
  title,
  description,
  slug,
  onClick,
  disabled = false,
  badge,
  showInfo = false,
  onInfoHover,
  tooltipContent,
  highScore,
}: InteractiveCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInfoHovered, setIsInfoHovered] = useState(false);

  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleInfoMouseEnter = () => {
    setIsInfoHovered(true);
    onInfoHover?.(true);
  };

  const handleInfoMouseLeave = () => {
    setIsInfoHovered(false);
    onInfoHover?.(false);
  };

  return (
    <CardContainer>
      <Card
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        $disabled={disabled}
        $isHovered={isHovered}
      >
        <Icon>{icon}</Icon>
        <Title>{title}</Title>
        <Description>{description}</Description>

        {!highScore && badge && <Badge>{badge}</Badge>}

        {highScore ? (
          <HighScoreValue $score={highScore}>
            High Score: {highScore}
          </HighScoreValue>
        ) : null}
      </Card>

      {showInfo && isInfoHovered && tooltipContent && (
        <Tooltip>{tooltipContent}</Tooltip>
      )}
    </CardContainer>
  );
}
