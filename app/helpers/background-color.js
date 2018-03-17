import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function backgroundColor(params/*, hash*/) {
  let color = params[0];

  return htmlSafe(`background-color: ${color};`);
}

export default helper(backgroundColor);
