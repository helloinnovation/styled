import { WebTarget } from '../types';

export default function isTag(target: WebTarget): target is string {
  return typeof target === 'string';
}
