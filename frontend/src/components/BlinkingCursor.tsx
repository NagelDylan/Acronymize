import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';

const Cursor = styled.div<{ $isVisible: boolean }>`
  display: inline-block;
  width: 2px;
  height: 24px;
  background-color: ${theme.colors.primaryText};
  transition: opacity 0.1s;
  opacity: ${props => props.$isVisible ? 1 : 0};
`;

export function BlinkingCursor() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible((prev) => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, []);

  return <Cursor $isVisible={isVisible} />;
}
