import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import numDigits from "../helpers/metadata-functions";

// Read from disk once per instance. Fetching them over HTTP from the deployment
// itself cost four extra requests (one a 477 KB JPEG) on every render.
const asset = (path: string) => readFile(join(process.cwd(), "public", path));

const assets = Promise.all([
  asset("fonts/regular-figtree.ttf"),
  asset("fonts/bold-figtree.ttf"),
  asset("fonts/medium-figtree.ttf"),
  asset("open-graph-background.jpg").then((jpeg) => `data:image/jpeg;base64,${jpeg.toString("base64")}`),
]);

// The og:image URL carries a dataset version, so a response never goes stale under
// its own URL and can be cached at the CDN indefinitely.
const CACHE_CONTROL = "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400";

const notFoundResponse = () => new Response("Not found", {
  status: 404,
  headers: { "Cache-Control": "public, s-maxage=3600" },
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const grantId = searchParams.get( "grant" ) ?? null;

  if ( !grantId ) {
    return notFoundResponse()
  }

  const url = process.env.VERCEL_URL !== undefined ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
  const path = `${url}/grants/${grantId}.json`

  const grantResponse = await fetch(path)
  if (!grantResponse.ok) {
    console.error(`Failed to fetch grant ${grantId}: ${grantResponse.status} ${grantResponse.statusText}`)
    return notFoundResponse()
  }
  const grant = await grantResponse.json()

  const grantTitle = grant.GrantTitleEng ?? 'Pandemic PACT Tracker'
  const title =  grantTitle.length > 140 ? `${grantTitle.slice(0, 140)}...` : grantTitle;

  const grantFunders = grant.FundingOrgName.join(', ') ?? null;
  const funders = grantFunders.length > 60 ? `${grantFunders.slice(0, 60)}...` : grantFunders

  const grantStart = Number(grant.GrantStartYear) ?? null
  const startYear = grantStart > 0 && numDigits(grantStart) !== null ? grantStart : null

  const grantCommitted = grant.GrantAmountConverted ?? null
  const amountCommitted = grantCommitted > 0 ? "$" + grantCommitted.toLocaleString() : null

  const [regularFontData, boldFontData, mediumFontData, background] = await assets;

  try {
    return new ImageResponse(
      (
        <div
          tw="flex"
          // The background is a `backgroundImage`, not an absolutely-positioned
          // `<img>`. Satori silently drops that `<img>` — it rendered a blank white
          // canvas with the (white) title invisible on it — whether the source was a
          // data URI or a URL. A background on the root element is the shape Satori
          // reliably paints.
          style={{
            width: 1200,
            height: 630,
            backgroundImage: `url(${background})`,
            backgroundSize: "1200px 630px",
          }}
        >
          <div tw="flex flex-col items-start justify-start pt-[80px] pl-[288px] pr-[40px]">
            <h1
              tw={`text-white ${title.length < 100 ? "text-5xl" : "text-4xl"}`}
              style={{ fontFamily: "figtreeRegular" }}
            >
              {title}
            </h1>
            {funders && (
              <h2 tw="text-gray-300 text-2xl" style={{ fontFamily: "figtreeMedium" }}>
                Funded by <span tw="ml-1" style={{ color: "hsl(178, 58%, 61%)" }}>{funders}</span>
              </h2>
            )}
            <div tw="flex">
              {startYear !== null && (
                <div
                  tw="min-w-[305px] flex flex-col rounded-xl py-3 px-4 mr-6"
                  style={{
                    backgroundColor: "hsl(178, 58%, 61%)",
                    color: "hsl(240, 100%, 12%)",
                    borderRadius: 10,
                    
                  }}
                >
                  <span tw="text-sm tracking-widest uppercase" style={{ fontFamily: "figtreeBold" }}>
                    Start Year
                  </span>
                  <span tw="text-3xl" style={{ fontFamily: "figtreeBold" }}>{startYear}</span>
                </div>
              )}
              {amountCommitted && (
                <div
                  tw="min-w-[305px] flex flex-col rounded-xl py-3 px-4"
                  style={{
                    backgroundColor: "hsl(178, 58%, 61%)",
                    color: "hsl(240, 100%, 12%)",
                    borderRadius: 10,
                    
                  }}
                >
                  <span tw="text-sm tracking-widest uppercase" style={{ fontFamily: "figtreeBold" }}>
                    Amount Committed
                  </span>
                  <span tw="text-3xl" style={{ fontFamily: "figtreeBold" }}>{amountCommitted}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: { "Cache-Control": CACHE_CONTROL },
        fonts: [
          {
            name: "figtreeRegular",
            data: regularFontData,
            weight: 400,
            style: "normal",
          },
          {
            name: "figtreeMedium",
            data: mediumFontData,
            weight: 500,
            style: "normal",
          },
          {
            name: "figtreeBold",
            data: boldFontData,
            weight: 700,
            style: "normal",
          }
        ],
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the open graph image`, {
      status: 500,
    });
  }
}
