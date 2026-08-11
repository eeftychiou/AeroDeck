import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
    fs.writeFileSync(sessionsFilePath, JSON.stringify(sessions, null, 2));
  } catch (e) {
    console.error("Failed to write sessions.json:", e);
  }
}

export function getSessionHistory(sessionId: string): SessionMessage[] {
  if (!sessionId) return [];
  const sessions = loadSessions();
  return sessions[sessionId] || [];
}

export function appendSessionTurn(sessionId: string, userPrompt: string, assistantReply: string, maxMessages: number = 20) {
  if (!sessionId) return;
  const sessions = loadSessions();
  const history = sessions[sessionId] || [];

  history.push({ role: "user", content: userPrompt });
  history.push({ role: "assistant", content: assistantReply });

  // Trim older history while preserving latest turns
  if (history.length > maxMessages) {
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
