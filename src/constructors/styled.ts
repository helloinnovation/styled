import constructWithOptions, { Styled } from './constructWithOptions';

import { WebTarget } from '../types';
import createStyledComponent from '../models/StyledComponent';
import domElements from '../utils/domElements';

const baseStyled = <Target extends WebTarget>(tag: Target) =>
  constructWithOptions<Target>(createStyledComponent, tag);

const styled = baseStyled as typeof baseStyled & {
  [E in keyof JSX.IntrinsicElements]: Styled<E, JSX.IntrinsicElements[E]>;
};

// Shorthands for all valid HTML Elements
domElements.forEach((domElement) => {
  // @ts-expect-error someday they'll handle imperative assignment properly
  styled[domElement] = baseStyled(domElement);
});

export default styled;
