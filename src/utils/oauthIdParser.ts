import { decode } from 'jsonwebtoken'

import { JwtPayload } from '../auth/JwtPayload'

/**
 * Parse a JWT token and return a oauth id
 * @param jwtToken JWT token to parse
 * @returns a oauth id from the JWT token
 */
export function parseOAuthUId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}
