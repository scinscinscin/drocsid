import { User } from "@prisma/client";

export const Cleanse = {
  user(u: User) {
    return {
      username: u.username,
      uuid: u.uuid,
    };
  },
};

export type Cleansed = {
  [K in keyof typeof Cleanse]: ReturnType<(typeof Cleanse)[K]>;
};
