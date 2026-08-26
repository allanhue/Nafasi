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
          alignItems: "center",
          background: "#1d3d35",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "#f5f6f1",
            borderRadius: 112,
            display: "flex",
            height: 350,
            justifyContent: "center",
            position: "relative",
            width: 350,
          }}
        >
          <div
            style={{
              color: "#1d3d35",
              display: "flex",
              fontFamily: "Arial",
              fontSize: 244,
              fontWeight: 800,
              letterSpacing: -22,
              lineHeight: 1,
              marginLeft: -14,
            }}
          >
            N
          </div>
          <div
            style={{
              background: "#d6a63d",
              borderRadius: 12,
              bottom: 62,
              height: 24,
              position: "absolute",
              right: 74,
              transform: "rotate(-45deg)",
              width: 76,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
