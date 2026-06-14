import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 18% 15%, rgba(18,182,255,0.38), transparent 26%), radial-gradient(circle at 88% 18%, rgba(0,157,255,0.4), transparent 22%), linear-gradient(180deg, #02060B 0%, #07111D 100%)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(90deg, transparent 0, transparent 78px, rgba(18,182,255,0.07) 79px, transparent 80px), repeating-linear-gradient(180deg, transparent 0, transparent 16px, rgba(255,255,255,0.025) 17px, transparent 18px)",
            opacity: 0.45,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -100,
            top: 130,
            width: 720,
            height: 34,
            transform: "rotate(-22deg)",
            background: "linear-gradient(90deg, rgba(18,182,255,0), #12B6FF, rgba(18,182,255,0))",
            boxShadow: "0 0 65px rgba(18,182,255,0.55)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -40,
            bottom: 115,
            width: 600,
            height: 24,
            transform: "rotate(-22deg)",
            background: "linear-gradient(90deg, rgba(0,157,255,0), #009DFF, rgba(0,157,255,0))",
            boxShadow: "0 0 60px rgba(0,157,255,0.45)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "78px 72px",
            width: "100%",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              alignItems: "center",
              gap: 14,
              padding: "10px 18px",
              borderRadius: 999,
              border: "1px solid rgba(18,182,255,0.22)",
              background: "rgba(18,182,255,0.09)",
              fontSize: 24,
              textTransform: "uppercase",
              letterSpacing: "0.24em",
              color: "#B6E9FF",
              fontWeight: 700,
            }}
          >
            Fast. Clean. Professional.
          </div>
          <div
            style={{
              marginTop: 34,
              fontSize: 128,
              lineHeight: 0.9,
              fontWeight: 900,
              fontStyle: "italic",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            CURBSIDE
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 56,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.92)",
              fontWeight: 700,
            }}
          >
            Exterior Co.
          </div>
          <div
            style={{
              marginTop: 32,
              maxWidth: 840,
              fontSize: 40,
              lineHeight: 1.3,
              color: "#D9E3EE",
            }}
          >
            Pressure washing, trash can cleaning, and curb appeal service for Marietta and nearby areas.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
