import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.REVALIDATE_API_TOKEN) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    let uri = req.body.sender.uri;

    console.log(`URI: ${uri}`);

    // The following code attempts to revalidate all parent pages
    // as well as the given URI. For example, if the URI is
    // /blog/post-1/comment-1, it will revalidate the following
    // pages:
    // - /blog/post-1/comment-1
    // - /blog/post-1
    // - /blog

    const segments = uri.split("/");

    const paths = segments
      .reduce(
        (accumulator: string[], currentValue: string): string[] =>
          accumulator.concat([(accumulator.at(-1) ?? "") + "/" + currentValue]),
        []
      )
      .reverse();

    for (const path of paths) {
      console.log(`Revalidating Path: ${path}`);
      await res.revalidate(path);
    }

    console.log(`Done Revalidating`);

    return res.json({ revalidated: true });
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    console.log(err);
    return res.status(500).send("Error revalidating");
  }
}
