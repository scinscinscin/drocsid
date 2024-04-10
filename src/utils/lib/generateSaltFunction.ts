import { Options, cryptoRandomStringAsync as crs } from "crypto-random-string";

export const generateSaltFunction = (opts?: Options) => () => crs({ length: 128, type: "base64", ...{ opts } });
