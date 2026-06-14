import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 20% 20%, rgba(18,182,255,0.45), transparent 28%), radial-gradient(circle at 85% 25%, rgba(0,157,255,0.4), transparent 22%), linear-gradient(180deg, #02060B 0%, #07111D 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 620,
            height: 24,
            transform: "rotate(-28deg)",
            background: "linear-gradient(90deg, rgba(18,182,255,0), #12B6FF, rgba(18,182,255,0))",
            boxShadow: "0 0 40px rgba(18,182,255,0.55)",
          }}
        />
        <div
          style={{
            display: "flex",
            width: 320,
            height: 320,
            borderRadius: 80,
            border: "4px solid rgba(18,182,255,0.35)",
            background: "rgba(2,6,11,0.78)",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 70px rgba(18,182,255,0.25)",
          }}
        >
          <span
            style={{
              fontSize: 212,
              fontWeight: 900,
              color: "white",
              fontFamily: "Arial Black, Arial, sans-serif",
              lineHeight: 1,
              transform: "skewX(-10deg)",
            }}
          >
            C
          </span>
        </div>
      </div>
    ),
    size,
  );
}
