import type { NextRequest } from "next/server";
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

const font = fetch(
  new URL("../../assets/NotoSansJP-Bold.otf", import.meta.url)
).then((res) => res.arrayBuffer());

export default async function handler(req: NextRequest) {
  try {
    const fontData = await font;
    const { searchParams } = new URL(req.url);

    const hasTitle = searchParams.has("title");
    const title = hasTitle
      ? searchParams.get("title")?.slice(0, 100)
      : "My default title";

    const imageURL = searchParams.get("image")?.slice(0, 100);

    return new ImageResponse(
      (
        <div
          style={{
            backgroundImage:
              "linear-gradient(160deg, #ffffff 0%, #7bdcb5 100%)",
            backgroundSize: "100% 100%",
            height: "100%",
            width: "100%",
            display: "flex",
            textAlign: "left",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "10px",
            fontFamily: '"NotoSansJP"',
          }}
        >
          <div
            style={{
              display: "flex",
              flexBasis: "45%",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              marginLeft: "40px",
              color: "#2f2f2f",
            }}
          >
            <div
              style={{
                fontSize: 34,
                marginBottom: 20,
              }}
            >
              🌐 わーすたアーカイブ
            </div>
            <div
              style={{
                fontSize: 50,
                lineHeight: 1.1,
                wordBreak: "keep-all",
              }}
            >
              {title}
            </div>
          </div>
          <img
            src={imageURL}
            alt="イベントの様子"
            style={{
              flexBasis: "55%",
              maxHeight: "70%",
              objectFit: "contain",
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "NotoSansJP",
            data: fontData,
            style: "normal",
          },
        ],
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response("Failed to generate the image", {
      status: 500,
    });
  }
}
