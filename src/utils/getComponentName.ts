import { WebTarget } from '../types';

export default function getComponentName(target: WebTarget) {
  return (
    (target as Exclude<WebTarget, string>).displayName ||
    (target as Function).name ||
    'Component'
  );
}
