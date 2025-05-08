import { getCollection } from "astro:content";

export async function filterDraftAndSortBlogs() {
  const blogs = await getCollection("blog", ({ data }) => {
    return data.draft !== true;
  });
  return blogs.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export function toLocaleDateString(date) {
  return date.toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
