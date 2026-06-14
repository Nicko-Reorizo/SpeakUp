export type Role = "teacher" | "student";

export interface Session {
  role: Role;
  classId: number;
  classCode?: string;
  className?: string;
  teacherName?: string;
}

const SESSION_KEY = "speakup_session";

export function setSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
