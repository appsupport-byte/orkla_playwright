import { BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { StorageState } from '../types/session.types';
import { Logger } from './logger.util';

export class SessionUtil {
  // ─── Storage ──────────────────────────────────────────────────────────────────

  static async saveSession(context: BrowserContext, fileName: string): Promise<string> {
    const filePath = path.resolve(process.cwd(), fileName);
    Logger.step(`Saving session state to: ${filePath}`);
    await context.storageState({ path: filePath });
    Logger.success(`Session saved to: ${filePath}`);
    return filePath;
  }

  // ─── File Validation ──────────────────────────────────────────────────────────

  static sessionFileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  static readSessionFile(filePath: string): StorageState {
    Logger.step(`Reading session file: ${filePath}`);
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawContent) as StorageState;
  }

  static resolvePath(fileName: string): string {
    return path.resolve(process.cwd(), fileName);
  }

  // ─── Assertions ───────────────────────────────────────────────────────────────

  static assertSessionFileExists(filePath: string): void {
    if (!SessionUtil.sessionFileExists(filePath)) {
      throw new Error(`Session file not found at: ${filePath}`);
    }
    Logger.success(`Session file exists at: ${filePath}`);
  }

  static assertSessionHasCookies(session: StorageState): void {
    if (!session.cookies || !Array.isArray(session.cookies)) {
      throw new Error('Session is missing cookies array');
    }
    if (session.cookies.length === 0) {
      throw new Error('Session cookies array is empty');
    }
    Logger.success(`Session contains ${session.cookies.length} cookie(s)`);
  }

  static logSessionSummary(filePath: string, session: StorageState): void {
    Logger.success(`Session file path:    ${filePath}`);
    Logger.success(`Cookies stored:       ${session.cookies.length}`);
    Logger.success(`Login and session storage completed successfully`);
  }
}
