import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logMessage } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionsFilePath = path.resolve(__dirname, "../sessions.json");

export interface SessionMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

let inMemorySessions: Record<string, SessionMessage[]> | null = null;

function loadSessions(): Record<string, SessionMessage[]> {
  if (inMemorySessions !== null) {
    return inMemorySessions;
  }
  if (fs.existsSync(sessionsFilePath)) {
    try {
      const data = fs.readFileSync(sessionsFilePath, "utf-8");
      inMemorySessions = JSON.parse(data);
      logMessage("DEBUG", "Loaded sessions from disk", { count: Object.keys(inMemorySessions!).length });
      return inMemorySessions!;
    } catch (e) {
      console.error("Failed to parse sessions.json:", e);
    }
  }
  inMemorySessions = {};
  return inMemorySessions;
}

function saveSessions(sessions: Record<string, SessionMessage[]>) {
  inMemorySessions = sessions;
  try {
    const tempPath = `${sessionsFilePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(sessions, null, 2));
    fs.renameSync(tempPath, sessionsFilePath);
    logMessage("DEBUG", "Saved sessions to disk successfully");
  } catch (e) {
    console.error("Failed to write sessions.json:", e);
  }
}

export function getSessionHistory(sessionId: string): SessionMessage[] {
  if (!sessionId) return [];
  const sessions = loadSessions();
  const turns = sessions[sessionId]?.length || 0;
  logMessage("DEBUG", "Retrieved session history", { sessionId, turns });
  return sessions[sessionId] || [];
}

export function appendSessionTurn(sessionId: string, userPrompt: string, assistantReply: string, maxMessages: number = 20) {
  if (!sessionId) return;
  const sessions = loadSessions();
  const history = sessions[sessionId] || [];

  history.push({ role: "user", content: userPrompt });
  history.push({ role: "assistant", content: assistantReply });
  
  logMessage("DEBUG", "Appending turn to session", { sessionId, userLen: userPrompt.length, asstLen: assistantReply.length });

  // Trim older history while preserving latest turns
  if (history.length > maxMessages) {
    const removed = history.length - maxMessages;
    logMessage("DEBUG", "Truncating session history to max messages", { sessionId, removed, maxMessages });
    const trimmed = history.slice(history.length - maxMessages);
    sessions[sessionId] = trimmed;
  } else {
    sessions[sessionId] = history;
  }

  saveSessions(sessions);
}

export function clearSession(sessionId: string): boolean {
  if (!sessionId) return false;
  const sessions = loadSessions();
  if (sessions[sessionId]) {
    delete sessions[sessionId];
    saveSessions(sessions);
    return true;
  }
  return false;
}
