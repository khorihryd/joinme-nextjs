/**
 * JoinMe Studio Widgets Creator Entrypoint
 */

import { getBasicWidget } from './widgets/basic';
import { getInteractiveWidget } from './widgets/interactive';
import { getSpecialWidget } from './widgets/special';

export function createDefaultWidget(nodeType) {
  const timestamp = Date.now();
  const newId = `${nodeType}-${timestamp}`;
  let newWidget = {
    id: newId,
    type: nodeType,
    style: { margin: '0px 0px 12px 0px', flexShrink: 0 }
  };

  // 1. Try basic widgets
  let result = getBasicWidget(nodeType, newWidget, timestamp);
  if (result) return result;

  // 2. Try interactive/form widgets
  result = getInteractiveWidget(nodeType, newWidget, timestamp);
  if (result) return result;

  // 3. Try special/complex widgets
  result = getSpecialWidget(nodeType, newWidget, timestamp);
  if (result) return result;

  return newWidget;
}
