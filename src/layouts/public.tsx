import { User } from "@prisma/client";
import { GenerateLayout, GenerateLayoutOptionsImpl } from "@scinorandex/layout";
import { NextSeo, NextSeoProps } from "next-seo";
import { Cleanse, Cleansed } from "../utils/Cleanse";

interface PublicLayoutOptions extends GenerateLayoutOptionsImpl {
  // the page can return NextSeoProps to define the SEO meta tags of the page
  ClientSideLayoutProps: { seo?: NextSeoProps };
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

        <div>
          <header>
            <h2>@scinorandex/ssr template</h2>
          </header>

          <main>{layoutProps.children}</main>
        </div>
      </>
    );
  },
});
