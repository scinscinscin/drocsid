import { User } from "@prisma/client";
import { GenerateLayout, GenerateLayoutOptionsImpl } from "@scinorandex/layout";
import { NextSeo, NextSeoProps } from "next-seo";
import { Cleanse, Cleansed } from "../utils/Cleanse";
import styles from "./layout.module.scss";

interface PublicLayoutOptions extends GenerateLayoutOptionsImpl {
  // the page can return NextSeoProps to define the SEO meta tags of the page
  ClientSideLayoutProps: { seo?: NextSeoProps; mainClassname?: string };
}

export const PublicLayout = GenerateLayout<PublicLayoutOptions>({
  /**
   * Create a layout that prints the currently logged in user
   */
  layoutComponent({ internalProps, layoutProps }) {
    return (
      <>
        <NextSeo
          {...{
            title: "@scinorandex/ssr Layout Example",
            description: "A page made with @scinorandex/ssr",
            ...layoutProps.seo,
          }}
        />

        <div className={styles.Page}>
          <header className={styles.header}>
            <h2>Drocsid</h2>
          </header>

          <main className={styles.main + " " + layoutProps.mainClassname}>{layoutProps.children}</main>
        </div>
      </>
    );
  },
});
