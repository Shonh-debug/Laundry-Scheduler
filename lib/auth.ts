import { jwtVerify, SignJWT } from 'jose';
import { NextRequest } from 'next/server';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET_KEY || 'default_secret_key_for_development';
  return new TextEncoder().encode(secret);
};

export async function verifyJwtToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload;
  } catch (error) {
    return null;
  }
}

export async function signJwtToken(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h') // 12 hours expiration
    .sign(getJwtSecretKey());
  return token;
}

export async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return null;
  const payload = await verifyJwtToken(token);
  return payload;
}
