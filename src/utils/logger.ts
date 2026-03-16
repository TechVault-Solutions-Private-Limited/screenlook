const isDebug = process.env.SCREENLOOK_DEBUG === '1';

export const log = (...args: unknown[]) => console.error(...args);
export const debug = (...args: unknown[]) => {
  if (isDebug) console.error('[debug]', ...args);
};
