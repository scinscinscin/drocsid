import { PrivateLayout } from "../layouts/private";
import { useEffect, useState } from "react";
import { client } from "../utils/apiClient";
import { useForm } from "react-hook-form";
import { Channel } from "@prisma/client";
import { db } from "../utils/prisma";

const Page = PrivateLayout.createPage<{ channels: Channel[] }>({
  page({ channels: _channels }) {
    const [channels, setChannels] = useState<Channel[]>(_channels);
    const Form = useForm<{ name: string }>();

    return {
      children: (
        <div>
          <h2>Create a Channel</h2>
          <form
            onSubmit={Form.handleSubmit(async ({ name }) => {
              const { channel } = await client["/channel"]["/create"].post({ body: { name } });
              setChannels([...channels, channel]);
            })}
          >
            <label htmlFor="name">Channel Name</label>
            <input {...Form.register("name")} required />
            <button type="submit">Submit</button>
          </form>

          {channels.length == 0 ? (
            <h2>There are no channels available</h2>
          ) : (
            <div>
              <h2>List of all channels available</h2>
              <ul>
                {channels.map((c, i) => (
                  <li key={i}>
                    <a href={`/channel/${c.uuid}`}>{c.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
