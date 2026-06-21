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
      {/* Precision Vector Logo Graphic Matching Uploaded Reference */}
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} shrink-0 drop-shadow-md transition-transform duration-300 group-hover:scale-105`}
      >
        {/* Semicircular Framing Arcs (Navy & Royal Blue Accents) */}
        <path
          d="M 110 230 A 180 180 0 0 1 402 230"
          stroke="#005CFF"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 98 270 A 187 187 0 0 0 135 365"
          stroke="#005CFF"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 414 270 A 187 187 0 0 1 377 365"
          stroke="#005CFF"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />

        {/* Graduation Cap (Top Header Symbol of Wisdom) */}
        {/* Mortarboard Diamond */}
        <path d="M 160 95 L 256 55 L 352 95 L 256 135 Z" fill="#0A2540" />
        {/* Cap Skull Base */}
        <path d="M 200 108 L 200 138 C 200 158, 312 158, 312 138 L 312 108 Z" fill="#0A2540" />
        {/* Gold Tassel & Band */}
        <path d="M 256 95 L 328 107 L 328 165" stroke="#FFBC00" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 320 165 L 336 165 L 328 195 Z" fill="#FFBC00" />

        {/* Gold Achievement Key */}
        {/* Circular Key Head */}
        <circle cx="256" cy="180" r="54" fill="#FFBC00" stroke="#E59400" strokeWidth="6" />
        {/* Keyhole Accent inside Key Head */}
        <circle cx="256" cy="168" r="12" fill="#0A2540" />
        <path d="M 248 168 L 264 168 L 261 195 L 251 195 Z" fill="#0A2540" />

        {/* Key Stem / Shaft */}
        <rect x="245" y="228" width="22" height="150" fill="#FFBC00" stroke="#E59400" strokeWidth="3" rx="4" />
        {/* Key Bits / Teeth */}
        <path d="M 267 285 L 292 285 L 292 302 L 267 302 Z" fill="#FFBC00" stroke="#E59400" strokeWidth="3" />
        <path d="M 267 312 L 292 312 L 292 329 L 267 329 Z" fill="#FFBC00" stroke="#E59400" strokeWidth="3" />

        {/* Open Book Foundation Base */}
        {/* Under shadow support page edges */}
        <path
          d="M 256 385 L 140 345 C 130 341, 120 347, 120 357 L 120 415 C 120 425, 140 430, 256 465 C 372 430, 392 425, 392 415 L 392 357 C 392 347, 382 341, 372 345 Z"
          fill="#0035A8"
        />
        {/* Left Book Page */}
        <path d="M 250 379 C 210 345, 145 340, 125 353 L 125 413 C 145 400, 210 405, 250 439 Z" fill="#FFFFFF" />
        <path d="M 250 379 C 210 345, 145 340, 125 353" stroke="#005CFF" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 125 413 C 145 400, 210 405, 250 439" stroke="#005CFF" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 125 353 L 125 413" stroke="#005CFF" strokeWidth="6" strokeLinecap="round" fill="none" />
        
        {/* Right Book Page */}
        <path d="M 262 379 C 302 345, 367 340, 387 353 L 387 413 C 367 400, 302 405, 262 439 Z" fill="#FFFFFF" />
        <path d="M 262 379 C 302 345, 367 340, 387 353" stroke="#005CFF" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 387 413 C 367 400, 302 405, 262 439" stroke="#005CFF" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 387 353 L 387 413" stroke="#005CFF" strokeWidth="6" strokeLinecap="round" fill="none" />
      </svg>

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
