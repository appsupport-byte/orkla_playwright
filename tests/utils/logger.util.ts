const timestamp = (): string => new Date().toISOString();

const formatMessage = (level: string, message: string): string =>
  `[${timestamp()}] [${level}] ${message}`;

export const Logger = {
  info:    (message: string): void => console.log(formatMessage('INFO',    message)),
  success: (message: string): void => console.log(formatMessage('SUCCESS', ` ${message}`)),
  warn:    (message: string): void => console.warn(formatMessage('WARN',   message)),
  error:   (message: string): void => console.error(formatMessage('ERROR', message)),
  step:    (message: string): void => console.log(formatMessage('STEP',    ` ${message}`)),
} as const;