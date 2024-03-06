import React from "react";
import dynamic from "next/dynamic";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

const LoadingSpinner: React.FC = () => {
  return (
    <div className="w-full h-full fixed top-0 left-0 bg-white opacity-75 z-50">
      <div className="opacity-100 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Player
          autoplay
          loop
          src="https://lottie.host/d43c5171-1f85-481e-8a61-d49060da559d/Iwnolur9tg.json"
          style={{ height: "100%", width: "100%" }}
        ></Player>
      </div>
    </div>
  );
};

export default LoadingSpinner;
