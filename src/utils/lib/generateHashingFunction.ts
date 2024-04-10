import { pbkdf2 } from "pbkdf2";
export type HashingOptions = {
  /** The number of iterations, defaults to 10 */
  iterations?: number;
  /** The length of the key to generate, defaults to 128 */
  keylen?: number;
  /**
   *  The minimum amount of time (in ms) to hash the salt, defaults to 300ms.
   *  Set to false to disable the hashing function from waiting to timeout.
   */
  minimumTime?: number | boolean;
  /** The buffer encodng to use, defaults to 'base64 */
  bufferEncoding?: BufferEncoding;
};

/**
 * Create a hashing function for pbkdf2
 * @param opts Hashing options
 * @returns A function that accepts the plain password and salt and returns Promise<string>
 */
export const generateHashingFunction = (opts: HashingOptions) => (input: { plain: string; salt: string }) =>
  new Promise<string>((resolve, reject) => {
    const work = () =>
      pbkdf2(input.plain, input.salt, opts.iterations ?? 10, opts.keylen ?? 128, (err, buffer) => {
        if (err) return reject(err);
        else return resolve(buffer.toString(opts.bufferEncoding ?? "base64"));
      });

    if (opts.minimumTime === false) work();
    else setTimeout(work, typeof opts.minimumTime === "number" ? opts.minimumTime : 300);
  });
