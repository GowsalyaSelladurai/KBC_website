import { liveClasses } from "@/data/mock";

export default function LiveList() {
  return (
    <div className="space-y-2">
      {liveClasses.map((l) => {
        const isBridal = l.title === "Bridal Makeup Masterclass";
        const isHair = l.title === "Hair Styling Q&A";
        const isFeatured = isBridal || isHair;

        return (
          <div
            key={l.id}
            className="card flex items-center gap-3 !p-3"
          >
            <span>🎥</span>

            <div className="flex-1">
              <b
                className={
                  isFeatured
                    ? "font-semibold text-[#E8D5A3] transition-all duration-300 hover:text-[#FFF0C2]"
                    : ""
                }
                style={
                  isFeatured
                    ? {
                        textShadow:
                          "0 0 7px rgba(201,164,92,0.5), 0 0 15px rgba(201,164,92,0.25)",
                      }
                    : undefined
                }
              >
                {l.title}
              </b>

              <p className="text-sm text-mute">
                {l.when} · {l.freq}
              </p>
            </div>

            <button className="btn btn-sm">
              Join
            </button>
          </div>
        );
      })}
    </div>
  );
}