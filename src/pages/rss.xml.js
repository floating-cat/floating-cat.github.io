import rss from "@astrojs/rss";
import { SITE_DESCRIPTION } from "../consts";
import { filterDraftAndSortBlogs } from "../util";

import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export async function GET(context) {
  const blogs = await filterDraftAndSortBlogs();

  return rss({
    title: "monsoon’s Blog",
    description: SITE_DESCRIPTION,
    site: context.site,
    trailingSlash: false,
    items: await Promise.all(
      blogs.map(async (blog) => ({
        title: blog.data.title,
        pubDate: blog.data.pubDate,
        link: `/blog/${blog.id}/`,
        content: await render(blog.body),
      })),
    ),
    customData: `<language>zh-Hans</language>`,
  });
}

export async function render(md) {
  return String(
    await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(md),
  );
}
