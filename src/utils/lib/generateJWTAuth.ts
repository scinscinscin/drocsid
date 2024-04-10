import { CookieOptions, Request, Response } from "express";
import { IncomingMessage } from "http";
import jsonwebtoken from "jsonwebtoken";
import cookie from "cookie";

const isProd = process.env.NODE_ENV === "production";

interface Serializer<JWTData extends object, UserObject> {
  signIn: (req: Request, res: Response, data: JWTData, cookieOptions?: CookieOptions) => void;
  authenticate: (req: IncomingMessage) => Promise<UserObject>;
}

interface CreateJWTVerifierOptions<JWTData extends object, UserObject> {
  jwtKey: string;
  jwtOpts?: Parameters<(typeof jsonwebtoken)["sign"]>[2];
  cookieName: string;

  /**
   * Generate the options of the cookies
   * @returns Cookie options
   */
  getCookieOptions?: () => CookieOptions;

  /**
   * Fetch the user object from the jwt payload
   * @param payload The payload of the jwt cookie
   * @returns the User object
   */
  getUserFromPayload: (payload: JWTData) => Promise<UserObject>;
}

export const generateJWTAuth = <JWTData extends object, UserObject>(
  opts: CreateJWTVerifierOptions<JWTData, UserObject>
): Serializer<JWTData, UserObject> => {
  return {
    signIn: (req, res, data, cookieOpts) => {
      const jwt = jsonwebtoken.sign(data, opts.jwtKey, opts.jwtOpts);

      const cookieOptions = {
        httpOnly: true,
        sameSite: isProd ? "strict" : "lax",
        secure: isProd,
        ...(opts.getCookieOptions != null ? opts.getCookieOptions() : {}),
        ...cookieOpts,
      } satisfies CookieOptions;

      res.cookie(opts.cookieName, jwt, cookieOptions);
    },

    authenticate: async (req: IncomingMessage): Promise<UserObject> => {
      const cookieHeader = req.headers.cookie;
      if (!cookieHeader) throw new Error("No cookie header set");
      const cookies = cookie.parse(cookieHeader);

      const jwt = jsonwebtoken.verify(cookies[opts.cookieName], opts.jwtKey) as JWTData;
      return await opts.getUserFromPayload(jwt);
    },
  };
};
