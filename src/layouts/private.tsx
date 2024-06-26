import { User } from "@prisma/client";
import { GenerateLayout, GenerateLayoutOptionsImpl } from "@scinorandex/layout";
import { NextSeo, NextSeoProps } from "next-seo";
import { Cleanse, Cleansed } from "../utils/Cleanse";
import styles from "./layout.module.scss";

interface PrivateLayoutOptions extends GenerateLayoutOptionsImpl {
  // the page can return NextSeoProps to define the SEO meta tags of the page
  ClientSideLayoutProps: { seo?: NextSeoProps; mainClassname?: string };
  // the layout needs the username of the currently logged in user
  ServerSideLayoutProps: { user: Cleansed["user"] };
  ServerSidePropsContext: { user: User };
}

export const PrivateLayout = GenerateLayout<PrivateLayoutOptions>({
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
            <h3>Logged in as: {internalProps.user.username}</h3>
          </header>

          <main className={styles.main + " " + layoutProps.mainClassname}>{layoutProps.children}</main>
        </div>
      </>
    );
  },

  /**
   * Fetch the created users from the database and return to the layout component
   */
  async getServerSideProps(ctx) {
    const user = ctx.res.locals.user;

    // redirect the user if they're not logged in
    if (user == null) return { redirect: { destination: "/login", permanent: false } };

    return {
      props: { layout: { user: Cleanse.user(user) }, locals: { user } },
    };
  },
});
