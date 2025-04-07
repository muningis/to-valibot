import { check, type CheckAction } from 'valibot';

const maxEntries = <Type extends object, Message extends string>(
  maxCount: number,
  message?: Message
): CheckAction<Type, Message | undefined> =>
  check((item) => Object.keys(item).length <= maxCount, message);

export { maxEntries };
