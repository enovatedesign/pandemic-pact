import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import numDigits from "../helpers/metadata-functions";

// Read from disk once per instance rather than fetched from the deployment on every
// render. Paths must stay literal: a variable path makes file tracing bundle all of
// `public/` (~30K grant files) into this function.
const assets = Promise.all([
  readFile(join(process.cwd(), "public/fonts/regular-figtree.ttf")),
  readFile(join(process.cwd(), "public/fonts/bold-figtree.ttf")),
  readFile(join(process.cwd(), "public/fonts/medium-figtree.ttf")),
  readFile(join(process.cwd(), "public/open-graph-background.jpg"))
    .then((jpeg) => `data:image/jpeg;base64,${jpeg.toString("base64")}`),
]);

// Only URLs carrying the dataset version (`v`) are immutable. Unversioned ones are
// still out there in old shares, so they must refresh after a dataset release.
const VERSIONED_CACHE_CONTROL = "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400";
const UNVERSIONED_CACHE_CONTROL = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400";

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

    // S3 answers 403, not 404, for a key that doesn't exist. Anything else may be
    // transient, so it mustn't be cached as a missing grant.
    if (grantResponse.status === 403 || grantResponse.status === 404) {
      return notFoundResponse()
    }

    return new Response("Failed to load grant", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    })
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
        headers: {
          "Cache-Control": searchParams.has("v") ? VERSIONED_CACHE_CONTROL : UNVERSIONED_CACHE_CONTROL,
        },
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
