import styled from "styled-components";
import { theme } from "../../theme";
import type { InteractiveCardProps } from "../../types/components";
import { InteractiveCard } from "./InteractiveCard";
import { useEffect } from "react";

interface SelectionTitleProps {
  title: string;
  cards: InteractiveCardProps[];
}

const Title = styled.h1`
  color: ${theme.colors.primaryText};
  font-size: ${theme.fontSizes.xxxxl};
  font-weight: ${theme.fontWeights.bold};
  margin-bottom: 64px;
  text-align: center;
  font-family: "Inter", sans-serif;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.xxxl};
  max-width: 1024px;
  margin: 0 auto;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const SelectionScreen = ({ title, cards }: SelectionTitleProps) => {
  return (
    <>
      <Title>{title}</Title>

      <CardGrid>
        {cards.map((cardProps, index) => (
          <InteractiveCard
            key={index}
            icon={cardProps.icon}
            title={cardProps.title}
            description={cardProps.description}
            slug={cardProps.slug}
            onClick={cardProps.onClick}
            disabled={cardProps.disabled || false}
            badge={cardProps.badge || undefined}
            showInfo={cardProps.showInfo || false}
            tooltipContent={cardProps.tooltipContent || undefined}
            onInfoHover={cardProps.onInfoHover || undefined}
            highScore={cardProps.highScore || undefined}
          />
        ))}
      </CardGrid>
    </>
  );
};
