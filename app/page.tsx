"use client";

import Image from "next/image";
import GitHub from './icon';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  function redirect() {
    router.push("https://github.com/pierreuntas");
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-center sm:text-left">
          SPACEWOLF JOURNEY
        </h1>
        <p className="text-lg sm:text-xl text-center sm:text-left">
          Hi, I'm SpaceWolf, a French human known as Pierre Untas, who wants to share his love for Web3. Programming as a C# web developer, I'm learning Solidity and stuff about blockchain at Alyra. Welcome home, feel free to travel around my GitHub projects.
        </p>
        <Image
          className=""
          src="/space-wolf-large.png"
          alt="Spacewolf Journey logo"
          width={380}
          height={380}
          priority
        />
        <button onClick={redirect} className="cursor-pointer">
          <Image
            className=""
            src="/GitHub_light.svg"
            alt="GitHub"
            width={50}
            height={50}
            priority
          />
        </button>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
