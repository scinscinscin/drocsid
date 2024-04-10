import { User } from "@prisma/client";
import type { Request, Response } from "express";
import type {
  GetServerSidePropsContext as OriginalGetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next/types";

// Changes the type of GetServerSidePropsContext to be of Express Request and Response
// https://github.com/vercel/next.js/discussions/36271

/**
 * Sets the type of res.locals, which can be accessed using ctx.res.locals
 */
interface MyLocals {
  user: User | null;
}

declare module "next" {
  export type GetServerSidePropsContext<
    Q extends ParsedUrlQuery = ParsedUrlQuery,
    D extends PreviewData = PreviewData
  > = OriginalGetServerSidePropsContext<Q, D> & {
    req: Request;
    res: Response<any, MyLocals>;
  };

  export type GetServerSideProps<
    P extends { [key: string]: any } = { [key: string]: any },
    Q extends ParsedUrlQuery = ParsedUrlQuery,
    D extends PreviewData = PreviewData
  > = (context: GetServerSidePropsContext<Q, D>) => Promise<GetServerSidePropsResult<P>>;
}

export {};
