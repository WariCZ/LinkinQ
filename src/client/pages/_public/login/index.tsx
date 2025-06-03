import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useStore from "../../../store";
import { Button, Label, TextInput } from "flowbite-react";
import { useForm } from "react-hook-form";
import logo from "../../../static/logo.png";

const Login = () => {
  const setUser = useStore((state) => state.setUser);
  const getPageflow = useStore((state) => state.getPageflow);
  const navigate = useNavigate();

  const defaultValues = {
    email: "",
    password: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post("./login", {
        username: data.email,
        password: data.password,
      });
      if (response.data.message === "Login successful") {
        await setUser(data);
        await getPageflow();
        navigate("/admin/protected");
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 border-r dark:border-r lg:flex">
        <div className="absolute inset-0" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img alt="Linkinq" src={logo} width="100" height="30" />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">&ldquo;This is beta version.&rdquo;</p>
            <footer className="text-sm">LinkinQ team</footer>
          </blockquote>
        </div>
      </div>
      <div className="p-4 lg:p-8 h-full flex items-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {/* <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div> */}

          <div className="relative z-20 flex items-center text-lg font-medium lg:hidden">
            <img alt="Linkinq logo" src={logo} width="100" height="30" />
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 w-full">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email1" value="Your email" />
              </div>
              <TextInput
                data-testid="login-email"
                {...register("email", {
                  required: true,
                  pattern: /^\S+@\S+$/i,
                })}
                type="email"
                placeholder="name@physter.com"
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password1" value="Your password" />
              </div>
              <TextInput
                data-testid="login-password"
                {...register("password", { required: true })}
                type="password"
                required
              />
            </div>

            <Button type="submit" data-testid="login-button">
              Submit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
