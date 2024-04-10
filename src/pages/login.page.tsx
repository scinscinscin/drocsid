import { PublicLayout } from "../layouts/public";
import { client } from "../utils/apiClient";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import styles from "./login.module.scss";
import { simpliform } from "../utils/lib/simpliform";
import { useState } from "react";
import { formStyles } from "../components/formStyles";

const Page = PublicLayout.createPage<{}>({
  page() {
    const [selected, setSelected] = useState<"login" | "register">("login");

    const LoginForm = useForm<{ username: string; password: string }>({});
    const RegistrationForm = useForm<{ username: string; password: string }>({});

    const loginHelper = simpliform(LoginForm);
    const registrationHelper = simpliform(RegistrationForm);

    function Header(props: { children: string; set: "login" | "register" }) {
      return (
        <div
          className={styles.common + " " + (selected === props.set ? styles.selected : styles.unselected)}
          onClick={() => setSelected(props.set)}
        >
          <h2>{props.children}</h2>
        </div>
      );
    }
    return {
      mainClassname: styles.CentralizedMain,
      children: (
        <div className={styles.page}>
          <div className={styles.container}>
            <header>
              <Header set="login">Login</Header>
              <Header set="register">Register</Header>
            </header>

            <div className={styles.inner}>
              {selected === "login" ? (
                <form
                  key="login"
                  className={formStyles}
                  onSubmit={LoginForm.handleSubmit(async ({ username, password }) => {
                    try {
                      await client["/user"]["/login"].post({ body: { username, password } });
                      toast.success("Successfully logged in");
                      window.location.href = "/";
                    } catch {
                      toast.error("Incorrect credentials");
                    }
                  })}
                >
                  <label htmlFor="username">Username</label>
                  <input {...loginHelper({ field: "username", placeholder: "Enter username" })} />

                  <label htmlFor="password">Password</label>
                  <input {...loginHelper({ field: "password", placeholder: "Enter password" })} />

                  <button className={styles.submit}>Login</button>
                </form>
              ) : (
                <form
                  key="registration"
                  className={formStyles}
                  onSubmit={RegistrationForm.handleSubmit(async ({ username, password }) => {
                    try {
                      await client["/user"]["/register"].post({ body: { username, password } });
                      toast.success("Successfully created account");
                      window.location.href = "/";
                    } catch {
                      toast.error("Failed to create the account");
                    }
                  })}
                >
                  <label htmlFor="username">Username</label>
                  <input {...registrationHelper({ field: "username", placeholder: "Enter username" })} />

                  <label htmlFor="password">Password</label>
                  <input {...registrationHelper({ field: "password", placeholder: "Enter password" })} />

                  <button className={styles.submit}>Create Account</button>
                </form>
              )}
            </div>
          </div>
        </div>
      ),
    };
  },
});

export default Page.defaultExport;
export const getServerSideProps = Page.getServerSideProps;
