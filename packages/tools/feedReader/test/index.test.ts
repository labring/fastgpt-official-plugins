import { describe, expect, it } from "vitest";
import {
  normalizeFeedUrl,
  parseFeedDocument,
  validatePublicFeedUrl,
} from "../src";

describe("Feed Reader", () => {
  it("parses RSS 2.0 feeds", async () => {
    const result = await parseFeedDocument({
      body: `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <title>FastGPT Blog</title>
            <description>FastGPT updates</description>
            <link>https://fastgpt.in/blog</link>
            <lastBuildDate>Fri, 12 Jun 2026 10:00:00 GMT</lastBuildDate>
            <item>
              <title>Plugin release</title>
              <link>/blog/plugin-release</link>
              <description><![CDATA[<p>New plugin shipped.</p>]]></description>
              <pubDate>Fri, 12 Jun 2026 09:00:00 GMT</pubDate>
              <category>plugins</category>
            </item>
          </channel>
        </rss>`,
      feedUrl: "https://fastgpt.in/feed.xml",
      maxItems: 10,
      includeContent: false,
    });

    expect(result.feed).toMatchObject({
      title: "FastGPT Blog",
      format: "rss",
      siteUrl: "https://fastgpt.in/blog",
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      title: "Plugin release",
      link: "https://fastgpt.in/blog/plugin-release",
      summary: "New plugin shipped.",
      categories: ["plugins"],
    });
    expect(result.markdown).toContain("# FastGPT Blog");
    expect(result.markdown).toContain("[Plugin release]");
  });

  it("parses Atom feeds", async () => {
    const result = await parseFeedDocument({
      body: `<?xml version="1.0"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <title>Atom News</title>
          <subtitle>Atom updates</subtitle>
          <link href="https://example.com/" rel="alternate" />
          <updated>2026-06-12T10:00:00Z</updated>
          <entry>
            <title>Atom entry</title>
            <link href="https://example.com/posts/1" />
            <author><name>Alice</name></author>
            <summary>Entry summary</summary>
            <updated>2026-06-12T09:30:00Z</updated>
          </entry>
        </feed>`,
      feedUrl: "https://example.com/atom.xml",
      maxItems: 10,
      includeContent: false,
    });

    expect(result.feed).toMatchObject({
      title: "Atom News",
      format: "atom",
      siteUrl: "https://example.com/",
    });
    expect(result.items[0]).toMatchObject({
      title: "Atom entry",
      link: "https://example.com/posts/1",
      author: "Alice",
      summary: "Entry summary",
    });
  });

  it("parses JSON Feed documents", async () => {
    const result = await parseFeedDocument({
      body: JSON.stringify({
        version: "https://jsonfeed.org/version/1.1",
        title: "JSON Feed",
        home_page_url: "https://example.com",
        feed_url: "https://example.com/feed.json",
        items: [
          {
            id: "1",
            title: "JSON entry",
            url: "https://example.com/json-entry",
            authors: [{ name: "Bob" }],
            content_text: "Full text",
            tags: ["json", "feed"],
          },
        ],
      }),
      feedUrl: "https://example.com/feed.json",
      maxItems: 10,
      includeContent: true,
    });

    expect(result.feed.format).toBe("json-feed");
    expect(result.items[0]).toMatchObject({
      title: "JSON entry",
      author: "Bob",
      content: "Full text",
      categories: ["json", "feed"],
    });
  });

  it("normalizes feed protocols", () => {
    expect(normalizeFeedUrl("feed:https://example.com/rss.xml")).toBe(
      "https://example.com/rss.xml",
    );
    expect(normalizeFeedUrl("feed://example.com/rss.xml")).toBe(
      "https://example.com/rss.xml",
    );
    expect(normalizeFeedUrl("rss://example.com/rss.xml")).toBe(
      "https://example.com/rss.xml",
    );
    expect(normalizeFeedUrl("atom://example.com/atom.xml")).toBe(
      "https://example.com/atom.xml",
    );
  });

  it("rejects internal feed URLs", () => {
    expect(() => validatePublicFeedUrl("http://localhost/feed.xml")).toThrow(
      /internal|reserved/,
    );
    expect(() =>
      validatePublicFeedUrl("http://169.254.169.254/latest/meta-data/"),
    ).toThrow(/internal|reserved/);
    expect(() => validatePublicFeedUrl("file:///tmp/feed.xml")).toThrow(
      /protocol/,
    );
  });
});
