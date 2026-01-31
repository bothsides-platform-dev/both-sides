import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default async function Icon() {
  const logoPath = path.join(process.cwd(), "src/app/logo.png");
  const logoData = await readFile(logoPath);
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoBase64}
          alt="BothSides"
          width={160}
          height={160}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
