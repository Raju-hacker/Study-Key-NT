import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  textSize?: "sm" | "md" | "lg";
  lightText?: boolean;
}

export function StudyKeyLogo(props: LogoProps) {
  const { className = "w-10 h-10", showText = false, textSize = "md", lightText = false } = props;

  return (
    <div className="flex items-center space-x-3 select-none">
      {/* Real High-Resolution Favicon Logo replacing custom vector SVG */}
      <img
        src="/favicon.svg"
        alt="Study Key Favicon Logo"
        className={`${className} shrink-0 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105`}
        referrerPolicy="no-referrer"
      />

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center">
            <span
              className={`font-black tracking-tight ${
                lightText ? "text-white" : "text-[#0A2540]"
              } ${
                textSize === "sm"
                  ? "text-base"
                  : textSize === "lg"
                  ? "text-3xl md:text-4xl"
                  : "text-lg md:text-xl"
              }`}
            >
              Study
            </span>
            <span
              className={`font-black tracking-semibold ml-1 ${
                lightText ? "text-blue-200" : "text-[#005CFF]"
              } ${
                textSize === "sm"
                  ? "text-base"
                  : textSize === "lg"
                  ? "text-3xl md:text-4xl"
                  : "text-lg md:text-xl"
              }`}
            >
              Key
            </span>
          </div>
          <p
            className={`font-bold tracking-[0.2em] uppercase mt-1 ${
              lightText ? "text-blue-100/70" : "text-gray-400"
            } ${
              textSize === "sm"
                ? "text-[8px]"
                : textSize === "lg"
                ? "text-[10px] md:text-[11px]"
                : "text-[9px]"
            }`}
          >
            Unlock Your Potential
          </p>
        </div>
      )}
    </div>
  );
}
