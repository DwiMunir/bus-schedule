import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const AUTH_COOKIE = "terminal_operator_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

export type OperatorSession = {
  sub: string;
  role: "terminal_operator";
  exp: number;
};

const fallbackSecret = "dev-only-terminal-operator-session-secret";

function getSessionSecret() {
  return process.env.AUTH_SESSION_SECRET ?? process.env.SESSION_SECRET ?? fallbackSecret;
}

function getOperatorUsername() {
  return process.env.OPERATOR_USERNAME ?? "operator@terminal.local";
}

function getOperatorPassword() {
  return process.env.OPERATOR_PASSWORD ?? "terminal-kutoarjo";
}

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decode<T>(value: string): T {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function createToken(payload: OperatorSession) {
  const encodedPayload = encode(payload);
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function verifyToken(token: string): OperatorSession | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  const session = decode<OperatorSession>(payload);
  if (session.role !== "terminal_operator" || session.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return session;
}

export function validateOperatorCredentials(username: string, password: string) {
  return username === getOperatorUsername() && password === getOperatorPassword();
}

export async function createOperatorSession(username: string) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  const token = createToken({
    sub: username,
    role: "terminal_operator",
    exp: Math.floor(expiresAt.getTime() / 1000),
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteOperatorSession() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

export async function getOperatorSession() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}
