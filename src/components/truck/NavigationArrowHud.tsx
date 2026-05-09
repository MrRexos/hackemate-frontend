/** Fletxa de navegació fixa al centre (amunt); el mapa porta el rumb. */
export function NavigationArrowHud() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[2]">
      {/* Centre horitzontal; lleugerament per sota del mig vertical (HUD de conducció) */}
      <div className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 sm:top-[55%]">
        <div className="drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
          <svg fill="none" height="58" viewBox="0 0 52 58" width="52">
            <path
              d="M26 4 48 46 26 38 4 46 26 4Z"
              fill="#ea580c"
              stroke="#ffffff"
              strokeLinejoin="round"
              strokeWidth="3"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
