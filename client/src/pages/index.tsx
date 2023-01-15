import styles from "./index.module.scss";
import { useForm } from "react-hook-form";
import { SessionController } from "../utils/SessionController";
import { useEffect, useRef, useState } from "react";
import ReactModal from "react-modal";
import { api, httpClient } from "../utils/trpcClient";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Unsubscribable } from "@trpc/server/observable";

interface Room {
  name: string;
  uuid: string;
}

export function Index() {
  const LoginForm = useForm<{ username: string; password: string }>();
  const { user, login } = SessionController();

  const [rooms, setRooms] = useState<Room[]>(() => []);
  const RoomForm = useForm<{ name: string }>();
  const RoomJoinForm = useForm<{ uuid: string }>();
  const [newRoomModal, setNewRoomModal] = useState(false);
  const [messages, setMessages] = useState<{ username: string; msg: string }[]>([]);
  const [currentRoom, setCurrentRoom] = useState<{
    room: Room;
    subscription: Unsubscribable;
  } | null>(null);

  const [msgBox, setMsgBox] = useState<string>("");

  function addNewRoom(r: Room) {
    const savedRooms = JSON.parse(localStorage.getItem("rooms") || "[]") as string[];
    savedRooms.push(r.uuid);
    localStorage.setItem("rooms", JSON.stringify(savedRooms));

    setRooms((rooms) => [...rooms, r]);
  }

  useEffect(() => {
    // The uuids of the rooms the user has joined
    const savedRooms = JSON.parse(localStorage.getItem("rooms") || "[]") as string[];

    if (savedRooms.length > 0) {
      httpClient.room.getMany
        .query(savedRooms)
        .then((r) => setRooms(r))
        .catch(() => toast.error("Failed to fetch your saved rooms"));
    }
  }, []);

  if (user == null) {
    return (
      <div className={styles.login_container}>
        <header>
          <h1>Drocsid, a Discord clone made with React, SCSS Modules, tRPC, Prisma, and SQLite</h1>
          <h2>
            Get the code <a href="https://github.com/scinscinscin/drocsid">here</a>
          </h2>
        </header>

        <main>
          <form
            onSubmit={LoginForm.handleSubmit(async (d) => {
              await login(d);
            })}
          >
            <label>Username</label>
            <input type="text" placeholder="username" {...LoginForm.register("username", { required: true })} />

            <label>Password</label>
            <input type="password" placeholder="password" {...LoginForm.register("password", { required: true })} />
            <button type="submit">Login / Register</button>
          </form>
        </main>
      </div>
    );
  } else {
    return (
      <main className={styles.container}>
        <ReactModal
          isOpen={newRoomModal}
          onRequestClose={() => setNewRoomModal(false)}
          className="Modal"
          overlayClassName="Overlay"
        >
          <h2>Creating a new room</h2>
          <form
            onSubmit={RoomForm.handleSubmit(async (d) => {
              const newRoom = await httpClient.room.create.mutate({ name: d.name });
              addNewRoom(newRoom);
              setNewRoomModal(false);
            })}
          >
            <label>Room name</label>
            <input type="text" placeholder="Room name" {...RoomForm.register("name", { required: true })} />
            <button type="submit">Create</button>
          </form>

          <h2>Join an existing room</h2>
          <form
            onSubmit={RoomJoinForm.handleSubmit(async (d) => {
              const [roomData] = await httpClient.room.getMany.query([d.uuid]);

              addNewRoom(roomData);
              setNewRoomModal(false);
            })}
          >
            <label>Room uuid</label>
            <input type="text" placeholder="Room uuid" {...RoomJoinForm.register("uuid", { required: true })} />
            <button type="submit">join</button>
          </form>
        </ReactModal>

        <aside>
          <header className="space_between">
            <h1>Rooms</h1>
            <button onClick={() => setNewRoomModal(true)}>add</button>
          </header>

          <main>
            {rooms.map((r, idx) => {
              /** When the user selects a room, start listening to messages inside that room */
              return (
                <div
                  key={idx}
                  className={styles.room_card}
                  onClick={() => {
                    if (currentRoom !== null) currentRoom.subscription.unsubscribe();

                    const newSub = api.room.listen.subscribe(r.uuid, {
                      onData: (d) => {
                        setMessages((prev) => [...prev, d]);
                      },
                      onStopped: () => console.log("Stopped listening to room"),
                      onError: console.error,
                    });

                    setCurrentRoom({ room: r, subscription: newSub });
                  }}
                >
                  {r.name}
                </div>
              );
            })}
          </main>
        </aside>

        <section>
          <header>
            {currentRoom == null ? (
              <h1>Select a room...</h1>
            ) : (
              <>
                <h1>{currentRoom.room.name}</h1>
                <h4>({currentRoom.room.uuid})</h4>
              </>
            )}
          </header>

          <main>
            {messages.map((m, i) => {
              return (
                <div className={styles.msg} key={i}>
                  <p>
                    <b>{m.username}</b> {m.msg}
                  </p>
                </div>
              );
            })}
          </main>

          <footer>
            <input
              placeholder="Enter a message..."
              value={msgBox}
              onChange={(e) => setMsgBox(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter" && msgBox !== "" && currentRoom !== null) {
                  await httpClient.room.broadcast.mutate({
                    roomUuid: currentRoom.room.uuid,
                    msg: msgBox,
                  });

                  setMsgBox("");
                }
              }}
            />
          </footer>
        </section>
      </main>
    );
  }
}
