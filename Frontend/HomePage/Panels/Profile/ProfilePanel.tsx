import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../Context/useAuth.tsx";
import NavBar from "../../../NavBar.tsx";
import { useSessions } from "../../../Context/useSessions.tsx";
import type { Session } from "../../../types/Session.ts";
import { formatWeight } from "../../../utils/FormatWeight.ts";
import { updateUser } from "./Scripts/UpdateUser.ts";
import { useParams } from "react-router-dom";
import { Footprints } from "lucide-react";

type OtherProfile = {
  fullname: string;
  username: string;
  bio: string;
  volume: string;
  workouts: string;
  streak: string;
  beststreak: string;
  profilePicture: string;
  membersince: string;
  totalDistanceTraveled: number;
  mostStepsOneDay: number;
};

function ProfilePanel() {
  const { user, login } = useAuth();
  const [bio, setBio] = useState<string>(
    user?.bio ||
      "Hybrid Athlete. Pushing the boundaries of human performance through data-driven strength and endurance protocols.",
  );
  const { username } = useParams();

  const otherProfile = username !== user?.username;

  const [otherUser, setOtherUser] = useState<OtherProfile | undefined>(
    undefined,
  );

  useEffect(() => {
    const fetchUser = async () => {
      if (!username) return;
      console.log("Username:" + username);
      try {
        const res = await fetch(
          import.meta.env.DEV
            ? "http://192.168.1.201:3000/profile/" + username
            : "https://api.kineticedge.liamjorgensen.dev/profile/" + username,
          {
            cache: "no-store",
          },
        );

        if (!res.ok) return;

        const data = await res.json();
        if (!data.success) return;
        setOtherUser(data.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchUser();
  }, [username]);

  const { sessions } = useSessions();

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const fileRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = () => {
    fileRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const img = new Image();

    reader.onload = () => {
      img.src = reader.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const size = Math.min(img.width, img.height);

      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;

      const outputSize = 300;
      canvas.width = outputSize;
      canvas.height = outputSize;

      ctx.drawImage(img, sx, sy, size, size, 0, 0, outputSize, outputSize);
      const base64 = canvas.toDataURL("image/jpeg", 0.7);

      if (user) {
        const updatedUser = {
          ...user,
          profilePicture: base64,
        };

        updateUser(updatedUser);
        login(updatedUser);
      }
    };

    reader.readAsDataURL(file);
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resizeTextarea = () => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const resizeTextarea = () => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };

    const observer = new ResizeObserver(() => {
      resizeTextarea();
    });

    observer.observe(el);

    resizeTextarea();

    return () => observer.disconnect();
  }, []);

  if (!user && !username)
    return (
      <>
        <NavBar />
        <p>No User is logged in</p>
      </>
    );

  if (!otherUser && otherProfile) {
    return (
      <p className="text-white w-full h-full text-center flex items-center justify-center">
        No user with that username was found...
      </p>
    );
  }

  return (
    <>
      <div>
        <NavBar />
        <main className="flex flex-col px-10 gap-10 h-full pt-10 w-full">
          <section className="flex flex-col lg:flex-row justify-between lg:px-10 gap-5 h-fit">
            <div className="flex flex-col-reverse lg:flex-row gap-2 w-full ">
              <div className="lg:self-end self-center relative">
                <img
                  src={
                    otherProfile
                      ? otherUser
                        ? otherUser.profilePicture
                          ? otherUser.profilePicture
                          : "../profilePicture.png"
                        : "../profilePicture.png"
                      : user
                        ? user.profilePicture
                        : "../profilePicture.png"
                  }
                  alt=""
                  className="rounded-full border-5 border-[#1A1A1A] h-50 w-auto aspect-square"
                />
                {!otherProfile && (
                  <a
                    className=" w-10 h-10 rounded-full cursor-pointer absolute -bottom-4 -right-5"
                    onClick={openFilePicker}
                  >
                    <input
                      type="file"
                      ref={fileRef}
                      onChange={onFileChange}
                      accept="image/png, image/jpeg"
                      className="hidden bottom-0 -left-5 absolute w-5 h-5 z-10"
                    />
                    <div className="bg-[#CAFD00] rounded-full w-8 h-8 flex justify-center items-center">
                      <img
                        src="../penIcon.png"
                        alt=""
                        className="h-4 w-4 object-cover"
                      />
                    </div>
                  </a>
                )}
              </div>

              <div className="flex flex-col gap-4 w-full lg:w-fit">
                <h2 className="font-black text-4xl lg:text-2xl xl:text-6xl text-center text-white tracking-tighter lg:self-start self-center">
                  {otherProfile
                    ? otherUser
                      ? otherUser.fullname.toUpperCase()
                      : "Loading..."
                    : user
                      ? user.fullname.toUpperCase()
                      : "No name"}
                </h2>
                <span className="rounded-2xl bg-[#262626] px-3 text-xs py-1 w-fit text-[#F3FFCA] lg:self-start self-center">
                  {otherProfile
                    ? otherUser
                      ? otherUser.username
                      : "Loading..."
                    : user
                      ? user.username
                      : "No user"}
                </span>
                <textarea
                  ref={textareaRef}
                  className="text-[#ADAAAA] w-full resize-none overflow-hidden lg:self-start self-center"
                  value={
                    otherProfile
                      ? otherUser
                        ? otherUser.bio
                          ? otherUser.bio
                          : "Hybrid Athlete. Pushing the boundaries of human performance through data-driven strength and endurance protocols."
                        : "Loading..."
                      : bio
                  }
                  id="bio"
                  name="bio"
                  maxLength={150}
                  onChange={(e) => {
                    setBio(e.currentTarget.value);
                    resizeTextarea();
                  }}
                  onBlur={() => {
                    if (user) {
                      login({
                        ...user,
                        bio,
                      });
                    }
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // prevents newline
                      e.currentTarget.blur(); // removes focus
                    }
                  }}
                  readOnly={otherProfile}
                  disabled={otherProfile}
                />
              </div>
            </div>
            <div className="h-full w-fit flex flex-col justify-end items-center px-3 self-center lg:self-end">
              <h3 className="text-[#ADAAAA] text-l w-fit text-nowrap">
                MEMEBER SINCE
              </h3>
              <h2 className="text-[#F3FFCA] text-3xl font-extrabold w-fit text-nowrap">
                {otherProfile
                  ? otherUser
                    ? monthNames[
                        new Date(otherUser.membersince).getMonth()
                      ].toUpperCase() +
                      " " +
                      new Date(
                        otherUser
                          ? otherUser.membersince
                          : user
                            ? user.createdAt
                            : "None",
                      ).getFullYear()
                    : "Loading..."
                  : user
                    ? monthNames[
                        new Date(user.createdAt).getMonth()
                      ].toUpperCase() +
                      " " +
                      new Date(
                        otherUser
                          ? otherUser.membersince
                          : user
                            ? user.createdAt
                            : "None",
                      ).getFullYear()
                    : "Loading..."}
              </h2>
            </div>
          </section>

          {/* Stats Board */}
          <main className="h-full w-full flex flex-col justify-around">
            {/* Heading */}
            <div className="flex items-center gap-2 mb-5">
              <span className="w-25 block bg-[#ADAAAA] h-0.5" />
              <p className="text-[#ADAAAA]">Statistics</p>
            </div>
            {/* Stats */}
            <section className="flex xl:flex-row flex-col gap-5 pb-10">
              <article className="bg-[#1A1A1A] w-full xl:items-start items-center xl:w-100 h-40 rounded-3xl flex flex-col p-8 justify-around overflow-hidden relative">
                <div className="bg-[#F3FFCA] absolute bottom-0 left-0 h-1 w-full"></div>
                <h2 className="text-[#ADAAAA]  font-light tracking-tighter">
                  TOTAL VOLUME THIS MONTH
                </h2>
                <p className="text-white font-black text-6xl tracking-tighter flex gap-5 items-end">
                  {formatWeight(
                    otherUser
                      ? Number(otherUser.volume)
                      : sessions === undefined
                        ? 0
                        : sessions
                            .filter(
                              (session: Session) =>
                                session.completed &&
                                new Date(session.date).getMonth() ===
                                  new Date().getMonth() &&
                                new Date(session.date).getFullYear() ===
                                  new Date().getFullYear(),
                            )
                            .reduce((sessionAcc, session) => {
                              return (
                                sessionAcc +
                                session.exercices.reduce(
                                  (exerciseAcc, exercise) => {
                                    return (
                                      exerciseAcc +
                                      (exercise.sets ?? []).reduce(
                                        (setAcc, set) => {
                                          return (
                                            setAcc +
                                            (set.weight || 0) * (set.reps || 0)
                                          );
                                        },
                                        0,
                                      )
                                    );
                                  },
                                  0,
                                )
                              );
                            }, 0),
                  )}
                  <span className="text-2xl font-light text-[#ADAAAA]">KG</span>
                </p>
              </article>
              <article className="bg-[#1A1A1A] w-full xl:w-40 h-40 rounded-3xl flex flex-col p-5 items-center justify-around overflow-hidden relative">
                <div className="bg-[#F3FFCA] absolute bottom-0 left-0 h-1 w-full"></div>
                <h2 className="text-[#ADAAAA]  font-light tracking-tighter">
                  WORKOUTS
                </h2>
                <p className="text-white font-black text-6xl">
                  {otherUser
                    ? otherUser.workouts
                    : sessions === undefined
                      ? "..."
                      : sessions.filter(
                          (session: Session) => session.completed === true,
                        ).length}
                </p>
              </article>
              <article className="bg-[#1A1A1A] w-full xl:w-60 h-40 rounded-3xl flex flex-col px-10 py-5 xl:items-start items-center justify-around overflow-hidden relative">
                <div className="bg-[#FF7441] absolute bottom-0 left-0 h-1 w-full"></div>
                <h2 className="text-[#ADAAAA]  font-light tracking-tighter">
                  DISTANCE
                </h2>
                <div className="flex gap-2 items-center">
                  <p className="text-white font-black text-6xl">
                    {otherUser
                      ? otherUser.streak
                      : sessions === undefined
                        ? "..."
                        : (() => {
                            const completedDays = new Set(
                              sessions
                                .filter((s) => s.completed)
                                .map((s) => new Date(s.date).toDateString()),
                            );
                            const today = new Date();
                            const yesterday = new Date();
                            yesterday.setDate(today.getDate() - 1);
                            const todayKey = today.toDateString();
                            const yesterdayKey = yesterday.toDateString();
                            // Gate condition: must have today or yesterday
                            if (
                              !completedDays.has(todayKey) &&
                              !completedDays.has(yesterdayKey)
                            ) {
                              return "0";
                            }
                            // Start from the most recent valid day (today if possible, else yesterday)
                            const cursor = new Date(
                              completedDays.has(todayKey) ? today : yesterday,
                            );
                            let streak = 0;
                            while (completedDays.has(cursor.toDateString())) {
                              streak++;
                              cursor.setDate(cursor.getDate() - 1);
                            }
                            return streak;
                          })()}
                  </p>

                  <img src="../StreakIcon.png" alt="" className="h-10" />
                </div>
                <p className="text-[#ADAAAA] text-xs">
                  {otherUser
                    ? "Personal Best: " + otherUser.beststreak + " Days"
                    : sessions === undefined
                      ? "..."
                      : (() => {
                          const completedDays = new Set(
                            sessions
                              .filter((s) => s.completed)
                              .map((s) => new Date(s.date).toDateString()),
                          );

                          const days = Array.from(completedDays)
                            .map((d) => new Date(d))
                            .sort((a, b) => a.getTime() - b.getTime());

                          if (days.length === 0) return 0;

                          let longest = 1;
                          let current = 1;

                          for (let i = 1; i < days.length; i++) {
                            const prev = days[i - 1];
                            const curr = days[i];

                            const diff =
                              (curr.getTime() - prev.getTime()) /
                              (1000 * 60 * 60 * 24);

                            if (diff === 1) {
                              current++;
                            } else {
                              longest = Math.max(longest, current);
                              current = 1;
                            }
                          }

                          longest = Math.max(longest, current);

                          return "Personal Best: " + longest + " Days";
                        })()}
                </p>
              </article>
              <article className="bg-[#1A1A1A] w-full xl:w-60 h-40 rounded-3xl flex flex-col px-5 py-5 xl:items-start items-center justify-around overflow-hidden relative">
                <div className="bg-green-500 absolute bottom-0 left-0 h-1 w-full"></div>
                <h2 className="text-[#ADAAAA]  font-light tracking-tighter flex gap-2">
                  ACHEIVEMENTS
                  <Footprints className="font-black text-green-500" />
                </h2>
                <div className="flex gap-2 items-center">
                  <p className="text-white font-black text-sm"></p>
                </div>
                <p className="text-[#ADAAAA] text-xs">
                  Total Distance Traveled{" "}
                  {otherUser
                    ? String(
                        (otherUser!.totalDistanceTraveled! / 1000).toFixed(2),
                      )
                    : 0}{" "}
                  KM
                </p>
                <p className="text-[#ADAAAA] text-xs">
                  Most Steps In One Day{" "}
                  {otherUser ? String(otherUser!.mostStepsOneDay!) : 0}
                </p>
              </article>
            </section>
          </main>
        </main>
      </div>
    </>
  );
}

export default ProfilePanel;
