import { Channel } from "@prisma/client";
import { PrivateLayout } from "../../layouts/private";
import { db } from "../../utils/prisma";
import { useEffect, useRef, useState } from "react";
import { client } from "../../utils/apiClient";
import { useForm } from "react-hook-form";
import { formStyles } from "../../components/formStyles";
import styles from "./[uuid].module.scss";
import { simpliform } from "../../utils/lib/simpliform";

const Page = PrivateLayout.createPage<{ channel: Channel }>({
  page({ channel }) {
    const Form = useForm<{ contents: string }>();
    const r = simpliform(Form);
    const sendMessage = useRef<(contents: string) => void>();
    const [messages, setMessages] = useState<{ contents: string; username: string }[]>([]);

    useEffect(() => {
      const subscription = client["/channel"]["/:channel_uuid"].ws({ path: { channel_uuid: channel.uuid } });
      subscription.then((connection) => {
        sendMessage.current = (contents) => {
          connection.emit("send_message", { contents });
        };

        connection.on("new_message", async (message) => setMessages((m) => [...m, message]));
      });

      return () => subscription.close();
    }, []);

    return {
      children: (
        <div>
          <h3 className={styles.heading}>{channel.name}</h3>

          <form
            className={formStyles + " " + styles.Form}
            onSubmit={Form.handleSubmit(({ contents }) => {
              sendMessage.current!(contents.trim());
              Form.reset();
            })}
          >
            <div>
              <input {...r({ field: "contents", placeholder: `Send a message to ${channel.name}` })} />
            </div>

            <button type="submit">Send Message</button>
          </form>

          <div className={styles.messages}>
            <h3>Messages</h3>
            {messages.map((m) => (
              <p>
                <b>{m.username}</b>: {m.contents}
              </p>
            ))}
          </div>
        </div>
      ),
    };
  },

  async getServerSideProps(ctx, locals) {
    const uuid = ctx.params.uuid as string;
    const channel = await db.channel.findUnique({ where: { uuid } });
    if (channel) return { props: { channel } };
    else return { notFound: true };
  },
});

export default Page.defaultExport;
export const getServerSideProps = Page.getServerSideProps;
