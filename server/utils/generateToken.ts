import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  tokenVersion?: number;
}

interface TokenOptions {
  expiresIn?: string | number;
  refreshToken?: boolean;
  audience?: string;
  issuer?: string;
}

export class TokenGenerator {
  private static readonly DEFAULT_SECRET = crypto.randomBytes(32).toString('hex');
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;

  constructor() {
    // Use environment variables for secrets or generate strong random secrets
    this.accessTokenSecret = process.env.JWT_SECRET || TokenGenerator.DEFAULT_SECRET;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate an access token
   */
  generateAccessToken(payload: TokenPayload, options: TokenOptions = {}): string {
    const {
      expiresIn = '24h',
      audience = 'quantumtrade-api',
      issuer = 'quantumtrade'
    } = options;

    return jwt.sign(
      {
        ...payload,
        tokenVersion: payload.tokenVersion || 1,
        tokenType: 'access'
      },
      this.accessTokenSecret,
      {
        expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
        audience,
        issuer,
        jwtid: crypto.randomBytes(16).toString('hex') // Unique token ID
      }
    );
  }

  /**
   * Generate a refresh token with longer expiry
   */
  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(
      {
        userId: payload.userId,
        tokenVersion: payload.tokenVersion || 1,
        tokenType: 'refresh'
      },
      this.refreshTokenSecret,
      {
        expiresIn: '7d',
        audience: 'quantumtrade-api',
        issuer: 'quantumtrade',
        jwtid: crypto.randomBytes(16).toString('hex')
      }
    );
  }

  /**
   * Verify an access token
   */
  verifyAccessToken(token: string): TokenPayload & { exp: number; iat: number } {
    try {
      return jwt.verify(token, this.accessTokenSecret) as TokenPayload & { exp: number; iat: number };
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  /**
   * Verify a refresh token
   */
  verifyRefreshToken(token: string): { userId: string; tokenVersion: number } {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as { userId: string; tokenVersion: number };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  generateTokenPair(payload: TokenPayload): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }
}

// Export a singleton instance
export const tokenGenerator = new TokenGenerator();

// Example usage:
/*
const user = {
  userId: '123',
  email: 'user@example.com',
  role: 'user'
};

// Generate tokens
const { accessToken, refreshToken } = tokenGenerator.generateTokenPair(user);

// Verify tokens
try {
  const decoded = tokenGenerator.verifyAccessToken(accessToken);
  console.log('Valid token:', decoded);
} catch (error) {
  console.error('Token verification failed:', error);
}
*/
