import { WebTarget } from '../types';
import getComponentName from './getComponentName';
import isTag from './isTag';

export default function generateDisplayName(target: WebTarget) {
  return isTag(target)
    ? `styled.${target}`
    : `Styled(${getComponentName(target)})`;
}
