import { PublicLayout } from "../layouts/public";
import { client } from "../utils/apiClient";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const Page = PublicLayout.createPage<{}>({
  page() {
    const RegistrationForm = useForm<{ username: string; password: string }>();

    return {
      children: (
        <div>
          <h2 style={{ marginTop: "30px" }}>Registration Form</h2>

          <form
            onSubmit={RegistrationForm.handleSubmit(async ({ username, password }) => {
              try {
                await client["/user"]["/register"].post({ body: { username, password } });
                toast.success("Successfully created the account, please login");
                setTimeout(() => (window.location.href = "/login"), 3000);
              } catch {
                toast.error("Incorrect credentials");
              }
            })}
          >
            <label htmlFor="username">Username</label>
            <input {...RegistrationForm.register("username", { required: true })} />

            <label htmlFor="password">Password</label>
            <input {...RegistrationForm.register("password", { required: true })} />
            <button>Login</button>
          </form>
        </div>
      ),
    };
  },
});

export default Page.defaultExport;
export const getServerSideProps = Page.getServerSideProps;
