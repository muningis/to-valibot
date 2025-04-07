import { CheckAction, check } from "valibot";

const minEntries = <Type extends object, Message extends string>(
  minCount: number,
  message?: Message
): CheckAction<Type, Message | undefined> =>
  check((item) => Object.keys(item).length >= minCount, message);

export { minEntries }