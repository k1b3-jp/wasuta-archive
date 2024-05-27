import type { NextRequest } from "next/server";
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export async function fetchFont(text: string): Promise<ArrayBuffer | null> {
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(
    text
  )}`;

  const css = await (
    await fetch(googleFontsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    })
  ).text();

  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (!resource) return null;
  const res = await fetch(resource[1]);
  return res.arrayBuffer();
}

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const hasTitle = searchParams.has("title");
    const title = hasTitle ? searchParams.get("title") : "";

    const font = fetchFont(`${title}わーすたアーカイブ`);
    const fontData = await font;

    const imageURL = searchParams.get("image");

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
            data: fontData || new ArrayBuffer(0),
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
