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
          background: "linear-gradient(180deg, #000000 0%, #030303 58%, #0047BD 100%)",
          color: "white",
          fontFamily: "Arial Narrow, Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 18%, rgba(11,103,240,0.34), transparent 28%), radial-gradient(circle at 82% 76%, rgba(7,91,230,0.42), transparent 24%), linear-gradient(120deg, transparent 0%, transparent 53%, rgba(255,255,255,0.08) 54%, transparent 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 42,
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 38,
            background: "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
            boxShadow: "0 36px 120px rgba(0,0,0,0.55)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 126,
            background: "#075BE6",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -92,
            bottom: 58,
            width: 470,
            height: 118,
            transform: "rotate(-12deg)",
            borderTop: "2px solid rgba(255,255,255,0.72)",
            background: "#075BE6",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "76px 82px",
            width: "100%",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              alignItems: "center",
              padding: "10px 18px 9px",
              borderRadius: 999,
              border: "1px solid rgba(11,103,240,0.72)",
              background: "rgba(11,103,240,0.14)",
              boxShadow: "0 0 34px rgba(11,103,240,0.34)",
              fontSize: 26,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#FFFFFF",
              fontWeight: 900,
              fontStyle: "italic",
            }}
          >
            Professional Exterior Cleaning
          </div>
          <div
            style={{
              marginTop: 30,
              display: "flex",
              flexDirection: "column",
              fontSize: 104,
              lineHeight: 0.88,
              fontWeight: 900,
              fontStyle: "italic",
              textTransform: "uppercase",
              letterSpacing: "-0.015em",
              maxWidth: 760,
            }}
          >
            <span>Exterior Cleaning</span>
            <span style={{ color: "#0B67F0" }}>Made Easy.</span>
          </div>
          <div
            style={{
              position: "absolute",
              left: 82,
              bottom: 56,
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                background: "#0B67F0",
                padding: "17px 30px 15px",
                fontSize: 28,
                fontWeight: 900,
                fontStyle: "italic",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                boxShadow: "0 0 38px rgba(11,103,240,0.5)",
              }}
            >
              Book Online
            </div>
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.2,
                fontWeight: 900,
                fontStyle: "italic",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              CURBSIDE EXTERIOR CO.
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
