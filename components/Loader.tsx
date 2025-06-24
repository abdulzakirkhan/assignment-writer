import React from 'react'
import Animations from "../public/assets/animations/Animation.json";
import Lottie from "lottie-react";
import Typewriter from 'typewriter-effect';

export default function Loader({text}) {
  return (
    <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-4">
        <div className="w-56">
            <Lottie animationData={Animations} loop={true} />
        </div>
        <div className="flex gap-1">
            <span>{text}</span>
            <Typewriter
                options={{
                    strings: ['This may take a few minutes. Please hold on...'],
                    autoStart: true,
                    loop: true,
                }}
            />
        </div>
    </div>
  )
}
