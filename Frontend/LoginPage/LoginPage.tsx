import { useState } from "react";
import InputField from "../Components/General/InputField";
import GlowingButton from "../Components/General/GlowingButton";
import { useNavigate } from "react-router-dom";
import { Login } from "./Scripts/Login";
import { Register } from "./Scripts/Register";
import { useAuth } from "../Context/useAuth";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverMessage, setServerMessage] = useState<string>("");
  const [requestSuccess, setRequestSuccess] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState(true);
  return (
    <div className=" bg-[#0f172a] relative overflow-hidden w-screen">
      <div className="absolute inset-0 bg-linear-to-r from-[#0f172a] via-[#1f3a3a] to-[#6b8f8d]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.15),transparent_40%)]"></div>
      <div className="relative z-10 w-full py-5 min-h-screen flex justify-center items-center">
        <div className="absolute w-9/10  xl:h-7/10 h-140 rounded-2xl blur-2xl z-0"></div>
        <main className="w-9/10 max-w-250 h-9/10 xl:h-140 rounded-r-2xl shadow-amber-50/10 xl:flex-row flex-col items-center shadow-[0px_0px_26px_7px_rgba(0,0,0,0.1)] flex overflow-hidden z-1">
          <section className="xl:w-6/10 h-fit text-white px-10 py-10 gap-5 flex flex-col">
            <h1 className="text-[#F3FFCA] text-4xl font-extrabold">KINETIC</h1>
            <h2 className="xl:text-8xl text-4xl font-extrabold">
              PUSH BEYOND <span className="text-[#F3FFCA]">LIMITS</span>
            </h2>
            <p className="text-[#ADAAAA] text-sm">
              Elite performance tracking for those who demand the absolute best
              from their training.
            </p>
            <div className="flex gap-10">
              <div className="flex flex-col">
                <p className="text-[#F3FFCA] font-extrabold">SUPPORT</p>
                <p className="text-[#ADAAAA] font-extrabold text-xs">
                  WITHINGS
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-[#F3FFCA] font-extrabold">JOIN</p>
                <p className="text-[#ADAAAA] font-extrabold text-xs">TODAY!</p>
              </div>
            </div>
          </section>
          {/* Content */}
          <section className="xl:w-4/10 w-full h-full bg-[#262626]/60 flex flex-col px-10 gap-5 justify-center py-5">
            <h2 className="font-lexend text-white font-extrabold text-3xl">
              {loginMode ? "Welcome Back" : "Join Us!"}
            </h2>
            <p className="text-xs text-[#ADAAAA]">
              {loginMode
                ? "Log in to your Kinetic Edge account"
                : "Register your Kinetic Edge account now!"}
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);

                if (loginMode) {
                  const email = formData.get("email")?.toString();
                  const password = formData.get("password")?.toString();

                  const res = await Login(email!, password!);

                  if (res.success) {
                    login(res.data);
                    setServerMessage("");
                    navigate("/dashboard");
                  } else {
                    setRequestSuccess(false);
                    setServerMessage(res.error);
                  }
                } else {
                  const fullname = formData.get("fullname")?.toString();
                  const username = formData.get("username")?.toString();
                  const email = formData.get("email")?.toString();
                  const password = formData.get("password")?.toString();

                  const res = await Register(
                    fullname!,
                    username!,
                    email!,
                    password!,
                  );
                  if (res.success) {
                    setRequestSuccess(true);
                    setServerMessage("Your account has been registered!");
                  } else {
                    setRequestSuccess(false);
                    setServerMessage(res.error);
                  }
                }
              }}
              method="POST"
              className="gap-5 flex flex-col"
            >
              {loginMode ? (
                ""
              ) : (
                <>
                  <div className="flex flex-col">
                    <label
                      htmlFor="fullname"
                      className="text-[#ADAAAA] text-xs"
                    >
                      Fullname
                    </label>
                    <InputField
                      placeholder="John Doe"
                      id="fullname"
                      name="fullname"
                      required={true}
                      additionalClasses="bg-[#1A1A1A] rounded! border-0 h-10 w-full placeholder:text-[#ADAAAA]/60 placeholder:text-xs text-white text-[16px]"
                    ></InputField>
                  </div>
                  <div className="flex flex-col">
                    <label
                      htmlFor="username"
                      className="text-[#ADAAAA] text-xs"
                    >
                      Username
                    </label>
                    <InputField
                      placeholder="athlete1992"
                      id="username"
                      name="username"
                      required={true}
                      additionalClasses="bg-[#1A1A1A] rounded! border-0 h-10 w-full placeholder:text-[#ADAAAA]/60 placeholder:text-xs text-white text-[16px]"
                    ></InputField>
                  </div>
                </>
              )}
              <div className="flex flex-col">
                <label htmlFor="email" className="text-[#ADAAAA] text-xs">
                  EMAIL ADDRESS
                </label>
                <InputField
                  placeholder="athlete@kinetic.com"
                  id="email"
                  name="email"
                  required={true}
                  additionalClasses="bg-[#1A1A1A] rounded! border-0 h-10 w-full placeholder:text-[#ADAAAA]/60 placeholder:text-xs text-white text-[16px]"
                ></InputField>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between">
                  <label htmlFor="password" className="text-[#ADAAAA] text-xs">
                    PASSWORD
                  </label>
                </div>
                <InputField
                  placeholder="••••••••"
                  name="password"
                  required={true}
                  id="password"
                  type="password"
                  additionalClasses="bg-[#1A1A1A] rounded! border-0 h-10 w-full placeholder:text-[#ADAAAA]/60 placeholder:text-xs  text-white text-[16px]"
                ></InputField>
              </div>
              <p
                className={`font-black text-center text-xs ${requestSuccess ? "text-green-500" : "text-red-500"}`}
              >
                {serverMessage.toUpperCase()}
              </p>
              <GlowingButton
                outline={false}
                onClick={() => {}}
                additionalClasses="w-full h-10 !text-[#516700] !font-extrabold cursor-pointer"
              >
                {loginMode ? "LOGIN" : "REGISTER"}
              </GlowingButton>
            </form>

            <div className="flex justify-center gap-2">
              <p className="text-[#ADAAAA] text-xs">
                {loginMode
                  ? "New to the community?"
                  : "Already have an account?"}
              </p>
              <button
                onClick={() => setLoginMode((prev) => !prev)}
                className="text-white cursor-pointer text-xs"
              >
                {loginMode ? "Join Now!" : "Login Now!"}
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default LoginPage;
