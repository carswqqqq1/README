import * as cheerio from "cheerio";
import { chromium } from "playwright";

export type ScrapedPage = { url: string; title: string; text: string; css: string; imageUrls: string[]; links: string[] };

async function scrapeWithPlaywright(url: string): Promise<ScrapedPage> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
  const result = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a[href]"))
      .map((a) => (a as HTMLAnchorElement).href)
      .filter(Boolean)
      .slice(0, 80);
    const css = Array.from(document.querySelectorAll("style")).map((s) => s.textContent || "").join("\n");
    const imageUrls = Array.from(document.images).map((img) => img.src).filter(Boolean).slice(0, 20);
    return {
      title: document.title || "",
      text: document.body?.innerText?.slice(0, 12000) || "",
      css,
      imageUrls,
      links
    };
  });
  await browser.close();
  return { ...result, url };
}

async function scrapeWithCheerio(url: string): Promise<ScrapedPage> {
  const html = await fetch(url).then((r) => r.text());
  const $ = cheerio.load(html);
  const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 12000);
  const title = $("title").text();
  const css = $("style").map((_, el) => $(el).text()).get().join("\n");
  const links = $("a[href]").map((_, el) => $(el).attr("href") || "").get();
  const imageUrls = $("img[src]").map((_, el) => $(el).attr("src") || "").get();
  return {
    url,
    title,
    text,
    css,
    imageUrls: imageUrls.slice(0, 20),
    links: links.slice(0, 80).map((l) => new URL(l, url).toString())
  };
}

export async function scrapeWebsite(rootUrl: string): Promise<ScrapedPage[]> {
  const homepage = await scrapeWithPlaywright(rootUrl).catch(() => scrapeWithCheerio(rootUrl));
  const internal = homepage.links
    .filter((l) => l.startsWith(new URL(rootUrl).origin))
    .filter((l) => /about|service|pricing|contact/i.test(l))
    .slice(0, 4);

  const pages: ScrapedPage[] = [homepage];
  for (const link of internal) {
    try {
      pages.push(await scrapeWithCheerio(link));
    } catch {
      // ignore failures for individual pages
    }
  }
  return pages;
}
