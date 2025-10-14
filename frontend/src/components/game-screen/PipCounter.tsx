import styled from "styled-components";
import { theme } from "../../theme";

interface PipCounterProps {
  currentGuesses: number;
  par: number;
  maxGuesses?: number; // Total dots to show (default: par + 3)
  mode: string;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

const Pip = styled.div<{
  $filled: boolean;
  $color: "green" | "yellow" | "red";
}>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all ${theme.transitions.fast};

  ${(props) => {
    const colors = {
      green: theme.colors.accentGreen,
      yellow: theme.colors.accentYellow,
      red: theme.colors.accentRed,
    };

    const color = colors[props.$color];

    if (props.$filled) {
      return `
        background-color: ${color};
        border: 2px solid ${color};
        box-shadow: 0 0 8px ${color}60;
      `;
    } else {
      return `
        background-color: transparent;
        border: 2px solid ${color}40;
      `;
    }
  }}
`;

const ParMarker = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.secondaryText};
  font-family: "Inter", sans-serif;
  margin: 0 ${theme.spacing.xs};
  font-weight: ${theme.fontWeights.bold};
`;

export function PipCounter({
  currentGuesses,
  par,
  maxGuesses,
  mode,
}: PipCounterProps) {
  const totalPips =
    mode === "endless" ? par : Math.max(maxGuesses || par + 3, currentGuesses);

  const getPipColor = (index: number): "green" | "yellow" | "red" => {
    if (mode != "endless") {
      // Index is 0-based, so index < (par - 1) means positions 1 to (par-1)
      if (index < par - 1) return "green";
      if (index === par - 1) return "yellow"; // The par position
      return "red";
    }

    if (index < par - 2) return "green";
    if (index === par - 2) return "yellow"; // The par position
    return "red";
  };

  return (
    <Container>
      {Array.from({ length: totalPips }).map((_, index) => {
        const isFilled = index < currentGuesses;
        const color = getPipColor(index);

        // Add par marker after the par position
        if (index === par - 1) {
          return (
            <React.Fragment key={index}>
              <Pip $filled={isFilled} $color={color} />
              {mode !== "endless" ? <ParMarker>|</ParMarker> : null}
            </React.Fragment>
          );
        }

        return <Pip key={index} $filled={isFilled} $color={color} />;
      })}
    </Container>
  );
}

import React from "react";
