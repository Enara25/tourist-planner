const crypto = require('crypto');

const COOKIE_NAME = 'tourist_planner_auth';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const secret = process.env.AUTH_COOKIE_SECRET || process.env.SESSION_SECRET || 'visit-moratuwa-e2320627';
const isProduction = process.env.NODE_ENV === 'production';

function sign(value) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function encodeSession(user) {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    name: user.name,
    role: user.role
  })).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

function decodeSession(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || sign(payload) !== signature) return null;

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((acc, item) => {
    const [rawName, ...rawValue] = item.trim().split('=');
    if (!rawName) return acc;
    acc[rawName] = decodeURIComponent(rawValue.join('=') || '');
    return acc;
  }, {});
}

function buildCookie(value, maxAgeMs) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`
  ];

  if (isProduction) parts.push('Secure');
  return parts.join('; ');
}

function attachAuth(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const auth = decodeSession(cookies[COOKIE_NAME]);

  req.session = auth ? {
    userId: auth.id,
    name: auth.name,
    role: auth.role
  } : {};

  next();
}

function setAuthCookie(res, user) {
  res.setHeader('Set-Cookie', buildCookie(encodeSession(user), ONE_WEEK_MS));
}

function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', buildCookie('', 0));
}

module.exports = {
  attachAuth,
  clearAuthCookie,
  setAuthCookie
};
