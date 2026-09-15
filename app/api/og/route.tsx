import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import numDigits from "../helpers/metadata-functions";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const grantId = searchParams.get( "grant" ) ?? null;

  if ( !grantId ) {
    notFound()
  }

  const url = process.env.VERCEL_URL !== undefined ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
  const path = `${url}/grants/${grantId}.json`

  const grantResponse = await fetch(path)
  if (!grantResponse.ok) {
    console.error(`Failed to fetch grant ${grantId}: ${grantResponse.status} ${grantResponse.statusText}`)
    notFound()
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

  // Fonts are fetched over HTTP from the deployment itself, the same way the grant
  // JSON above is. They were `new URL("/public/...", import.meta.url)`, which relied
  // on webpack rewriting them into asset URLs; Turbopack — the default bundler from
  // Next 16 — rejects server-relative imports outright. Note the paths lose the
  // `public/` prefix, because that directory *is* the web root.
  const asset = (path: string) => fetch(`${url}${path}`).then((res) => res.arrayBuffer());

  const [regularFontData, boldFontData, mediumFontData] = await Promise.all([
    asset("/fonts/regular-figtree.ttf"),
    asset("/fonts/bold-figtree.ttf"),
    asset("/fonts/medium-figtree.ttf"),
  ]);

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
            backgroundImage: `url(${url}/open-graph-background.jpg)`,
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
