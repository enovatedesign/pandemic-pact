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

  const regularFontData = await fetch(
    new URL("/public/fonts/regular-figtree.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const boldFontData = await fetch(
    new URL("/public/fonts/bold-figtree.ttf", import.meta.url)
    ).then((res) => res.arrayBuffer());

  const mediumFontData = await fetch(
    new URL("/public/fonts/medium-figtree.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const backgroundImageData = await fetch(
    new URL("/public/open-graph-background.jpg", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const backgroundBase64ImageData = Buffer.from(backgroundImageData).toString("base64");

  try {
    return new ImageResponse(
      (
        <div tw="flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            width="1200"
            height="630"
            src={`data:image/jpeg;base64,${backgroundBase64ImageData}`}
            alt="Open Graph Image"
            tw="-z-1 absolute"
          />
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
