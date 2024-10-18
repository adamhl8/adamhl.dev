import { getCollection } from "astro:content";

async function getSortedBlogPosts() {
	const posts = await getCollection("blog");
	return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export { getSortedBlogPosts };
