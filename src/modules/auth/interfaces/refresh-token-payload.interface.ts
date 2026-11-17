
export interface RefreshTokenPayload {
  sub: string;
  familyId: string;
  jti: string;
  iat?: number;
  exp?: number;
}
