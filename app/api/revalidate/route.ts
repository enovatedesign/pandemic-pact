import {NextRequest} from 'next/server';
import {headers} from 'next/headers';
import {revalidatePath, revalidateTag} from 'next/cache';

export async function POST(req: NextRequest) {
    
    const secret = req.nextUrl.searchParams.get("secret");

    // Check for secret to confirm this is a valid request
    if (secret !== process.env.REVALIDATE_API_TOKEN) {
        return new Response("Invalid token", { status: 401 });
    }

    if (req.method !== 'POST') {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        const headersList = headers();

        const uri = headersList.get('sender') ?? null;
        const slug = headersList.get('slug') ?? null;

        if (!uri && !slug) {
            return new Response("No URI or slug provided", { status: 400 });
        }

        console.log(`URI: ${uri}`);
        console.log(`Slug: ${slug}`);

        // Revalidate based on the supplied slug
        if (slug && slug === 'announcement') {
            // Because the announcement is used across the site, 
            // we need to revalidate all pages
            console.log('Revalidating all CMS routes via Tag');
            revalidateTag('cms');
        }

        // Revalidate based on the supplied URI
        if (uri) {

            // The following code attempts to revalidate all parent pages
            // as well as the given URI. For example, if the URI is
            // /blog/post-1/comment-1, it will revalidate the following
            // pages:
            // - /blog/post-1/comment-1
            // - /blog/post-1
            // - /blog

            const segments = uri.split("/").filter(Boolean);

            const paths = segments
            .reduce(
                (accumulator: string[], currentValue: string): string[] =>
                    accumulator.concat([(accumulator.at(-1) ?? "") + "/" + currentValue]),
                []
            )
            .reverse();

            for (const path of paths) {

                if (path === '/homepage') {
                    console.log(`Revalidating Path: ${path} -> /`);
                    revalidatePath('/');
                } else {
                    console.log(`Revalidating Path: ${path}`);
                    revalidatePath(path);
                }
            }

        }

        console.log(`Done Revalidating`);

        return new Response("Revalidated", { status: 200 });

    } catch (err) {

        // If there was an error, Next.js will continue
        // to show the last successfully generated page
        console.log(err);

        return new Response("Error revalidating", { status: 500 });

    }
}
