import { PrivateLayout } from "../layouts/private";
import { useEffect, useState } from "react";
import { client } from "../utils/apiClient";
import { useForm } from "react-hook-form";
import { Channel } from "@prisma/client";
import { db } from "../utils/prisma";
import styles from "./index.module.scss";
import { simpliform } from "../utils/lib/simpliform";
import { formStyles } from "../components/formStyles";

const Page = PrivateLayout.createPage<{ channels: Channel[] }>({
  page({ channels: _channels }) {
    const [channels, setChannels] = useState<Channel[]>(_channels);
    const Form = useForm<{ name: string }>();
    const r = simpliform(Form);

    return {
      children: (
        <div className={styles.Page}>
          {channels.length != 0 && (
            <div>
              <h3>List of all channels available</h3>
              <ul>
                {channels.map((c, i) => (
                  <li key={i}>
                    <a href={`/channel/${c.uuid}`}>{c.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form
            className={formStyles + " " + styles.Form}
            onSubmit={Form.handleSubmit(async ({ name }) => {
              const { channel } = await client["/channel"]["/create"].post({ body: { name } });
              setChannels([...channels, channel]);
              Form.reset();
            })}
          >
            <h3>Create your own channel</h3>
            <input {...r({ field: "name", placeholder: "Channel Name" })} />
            <button type="submit">Submit</button>
          </form>
        </div>
      ),
    };
  },

  async getServerSideProps() {
    const channels = await db.channel.findMany();
    return { props: { channels } };
  },
});

export default Page.defaultExport;
export const getServerSideProps = Page.getServerSideProps;
