import type { AppProps } from "next/app";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "react-toastify/dist/ReactToastify.css";
import "./globals.scss";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";

export default function App({ Component, pageProps }: AppProps) {
  // the buffer/ polyfill must be imported dynamically otherwise next will try to import it on the server
  // and will SUCCESSFULLY load the regular node module instead of the browser polyfill
  // if you get a base64url error, delete the .next folder and try again
  useEffect(() => {
    if (typeof window !== undefined) {
      import("buffer/").then((m) => {
        // @ts-ignore
        window.Buffer = m.Buffer;
      });
    }
  }, []);

  return (
    <>
      <ToastContainer />
      <Component {...pageProps} />
    </>
  );
}
