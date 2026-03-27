#!/usr/bin/env python3
"""
Capture landscaping website screenshots from a CSV or markdown target list.

What it does
- Reads targets from the CSV generated from the Top 200 markdown file.
- Visits each site with Playwright.
- Saves a homepage screenshot for each reachable site.
- Writes a CSV + JSONL crawl report.
- Builds a contact-sheet PDF so a human can scan screenshots fast.

Notes
- This script is honest about failures. It does not fake screenshots.
- It skips entries where the domain is unresolved.
- It tries a few URL variants for each site.
- Default mode is homepage screenshots. Full-page mode is optional.
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import json
import os
import re
import sys
import textwrap
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable, List, Optional
from urllib.parse import urlparse

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from PIL import Image


@dataclass
class Target:
    rank: int
    company: str
    domain: str
    url_guess: str
    status: str


@dataclass
class CrawlResult:
    rank: int
    company: str
    domain: str
    attempted_urls: List[str]
    final_url: str
    page_title: str
    status: str
    error: str
    screenshot_path: str


def slugify(text: str, limit: int = 80) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "_", text)
    text = text.strip("_")
    return text[:limit] or "site"


def load_targets(path: Path) -> List[Target]:
    if path.suffix.lower() == ".csv":
        with path.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            return [
                Target(
                    rank=int(row["rank"]),
                    company=row["company"],
                    domain=row["domain"],
                    url_guess=row.get("url_guess", ""),
                    status=row.get("status", "ready"),
                )
                for row in reader
            ]

    text = path.read_text(encoding="utf-8")
    pattern = re.compile(
        r"(?m)^(\d+)\. \*\*(.+?)\*\*\n(?:   - .*\n)*?   - Official domain: ([^\n]+)"
    )
    results: List[Target] = []
    for m in pattern.finditer(text):
        rank = int(m.group(1))
        company = m.group(2).strip()
        domain = m.group(3).strip()
        ready = "not batch-verified" not in domain.lower()
        url_guess = f"https://{domain}" if ready else ""
        results.append(
            Target(
                rank=rank,
                company=company,
                domain=domain,
                url_guess=url_guess,
                status="ready" if ready else "needs_domain_lookup",
            )
        )
    return results


def candidate_urls(target: Target) -> List[str]:
    domain = (target.domain or "").strip()
    out: List[str] = []
    if target.url_guess:
        out.append(target.url_guess)
    if domain and "not batch-verified" not in domain.lower():
        bare = domain.replace("http://", "").replace("https://", "").strip("/")
        variants = [
            f"https://{bare}",
            f"https://www.{bare}" if not bare.startswith("www.") else "",
            f"http://{bare}",
            f"http://www.{bare}" if not bare.startswith("www.") else "",
        ]
        for v in variants:
            if v and v not in out:
                out.append(v)
    return out


async def capture_one(
    browser,
    target: Target,
    out_dir: Path,
    timeout_ms: int,
    full_page: bool,
) -> CrawlResult:
    attempts = candidate_urls(target)
    file_slug = f"{target.rank:03d}_{slugify(target.company)}"
    screenshot_path = out_dir / f"{file_slug}.png"

    if target.status != "ready":
        return CrawlResult(
            rank=target.rank,
            company=target.company,
            domain=target.domain,
            attempted_urls=attempts,
            final_url="",
            page_title="",
            status="skipped_needs_domain_lookup",
            error="Domain unresolved in source list",
            screenshot_path="",
        )

    page = await browser.new_page(viewport={"width": 1440, "height": 1600}, device_scale_factor=1)
    await page.set_extra_http_headers(
        {
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
            )
        }
    )

    last_error = ""
    final_url = ""
    title = ""
    try:
        for url in attempts:
            try:
                response = await page.goto(url, wait_until="domcontentloaded", timeout=timeout_ms)
                await page.wait_for_timeout(1500)
                if response is None:
                    raise RuntimeError("No response")
                status = response.status
                if status >= 400:
                    raise RuntimeError(f"HTTP {status}")
                final_url = page.url
                title = await page.title()
                await page.screenshot(path=str(screenshot_path), full_page=full_page)
                return CrawlResult(
                    rank=target.rank,
                    company=target.company,
                    domain=target.domain,
                    attempted_urls=attempts,
                    final_url=final_url,
                    page_title=title,
                    status="ok",
                    error="",
                    screenshot_path=str(screenshot_path),
                )
            except Exception as e:
                last_error = f"{url}: {e}"
                continue

        return CrawlResult(
            rank=target.rank,
            company=target.company,
            domain=target.domain,
            attempted_urls=attempts,
            final_url=final_url,
            page_title=title,
            status="failed",
            error=last_error or "All attempts failed",
            screenshot_path="",
        )
    finally:
        await page.close()


async def run_crawl(targets: List[Target], args) -> List[CrawlResult]:
    from playwright.async_api import async_playwright

    out_dir = Path(args.output_dir)
    shot_dir = out_dir / "screenshots"
    shot_dir.mkdir(parents=True, exist_ok=True)

    results: List[CrawlResult] = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        semaphore = asyncio.Semaphore(args.concurrency)

        async def bound_capture(t: Target) -> CrawlResult:
            async with semaphore:
                return await capture_one(
                    browser=browser,
                    target=t,
                    out_dir=shot_dir,
                    timeout_ms=args.timeout_ms,
                    full_page=args.full_page,
                )

        tasks = [bound_capture(t) for t in targets]
        for coro in asyncio.as_completed(tasks):
            res = await coro
            results.append(res)
            print(f"[{res.rank:03d}] {res.company[:55]:55} -> {res.status}")

        await browser.close()

    results.sort(key=lambda x: x.rank)
    return results


def write_reports(results: List[CrawlResult], out_dir: Path) -> None:
    csv_path = out_dir / "crawl_report.csv"
    jsonl_path = out_dir / "crawl_report.jsonl"

    with csv_path.open("w", newline="", encoding="utf-8") as f:
        fieldnames = [
            "rank",
            "company",
            "domain",
            "final_url",
            "page_title",
            "status",
            "error",
            "screenshot_path",
            "attempted_urls",
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in results:
            row = asdict(r)
            row["attempted_urls"] = " | ".join(r.attempted_urls)
            writer.writerow(row)

    with jsonl_path.open("w", encoding="utf-8") as f:
        for r in results:
            f.write(json.dumps(asdict(r), ensure_ascii=False) + "\n")


def build_contact_sheet(results: List[CrawlResult], pdf_path: Path, title_text: str) -> None:
    c = canvas.Canvas(str(pdf_path), pagesize=letter)
    page_w, page_h = letter
    margin = 0.5 * inch

    def draw_header(page_num: int):
        c.setFont("Helvetica-Bold", 16)
        c.drawString(margin, page_h - margin, title_text)
        c.setFont("Helvetica", 9)
        c.drawRightString(page_w - margin, page_h - margin + 2, f"Page {page_num}")

    page_num = 1
    draw_header(page_num)
    y = page_h - 0.9 * inch
    box_h = 3.1 * inch
    thumb_w = 3.5 * inch
    thumb_h = 2.2 * inch

    ok_results = [r for r in results if r.status == "ok" and r.screenshot_path]
    if not ok_results:
        c.setFont("Helvetica", 11)
        c.drawString(margin, y, "No successful screenshots were captured.")
        c.save()
        return

    for r in ok_results:
        if y - box_h < margin:
            c.showPage()
            page_num += 1
            draw_header(page_num)
            y = page_h - 0.9 * inch

        c.setFont("Helvetica-Bold", 11)
        c.drawString(margin, y, f"{r.rank}. {r.company}")
        c.setFont("Helvetica", 8)
        url_text = r.final_url or r.domain
        c.drawString(margin, y - 14, url_text[:120])

        try:
            img = Image.open(r.screenshot_path)
            iw, ih = img.size
            scale = min(thumb_w / iw, thumb_h / ih)
            draw_w = iw * scale
            draw_h = ih * scale
            c.drawImage(
                r.screenshot_path,
                margin,
                y - 14 - 8 - draw_h,
                width=draw_w,
                height=draw_h,
                preserveAspectRatio=True,
                mask="auto",
            )
        except Exception:
            c.setFont("Helvetica", 9)
            c.drawString(margin, y - 36, "[Screenshot image could not be rendered in contact sheet]")

        y -= box_h

    c.save()


def build_summary_md(results: List[CrawlResult], md_path: Path) -> None:
    total = len(results)
    ok = sum(r.status == "ok" for r in results)
    failed = sum(r.status == "failed" for r in results)
    skipped = total - ok - failed

    lines = [
        "# Landscaping Screenshot Crawl Summary",
        "",
        f"- Total targets: {total}",
        f"- Successful screenshots: {ok}",
        f"- Failed: {failed}",
        f"- Skipped because domain was unresolved: {skipped}",
        "",
        "## Successful captures",
        "",
    ]

    for r in results:
        if r.status == "ok":
            lines.append(f"- {r.rank}. **{r.company}** - `{r.final_url}`")

    lines += ["", "## Failures and skips", ""]
    for r in results:
        if r.status != "ok":
            reason = r.error or r.status
            lines.append(f"- {r.rank}. **{r.company}** - {r.status} - {reason}")

    md_path.write_text("\n".join(lines), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Capture screenshots from landscaping website target list.")
    p.add_argument("--input", required=True, help="Path to CSV or markdown target list")
    p.add_argument("--output-dir", default="./landscaping_screenshot_run", help="Output directory")
    p.add_argument("--limit", type=int, default=0, help="Limit number of targets, 0 = all")
    p.add_argument("--timeout-ms", type=int, default=30000, help="Per-attempt timeout in ms")
    p.add_argument("--concurrency", type=int, default=4, help="Concurrent browser pages")
    p.add_argument("--full-page", action="store_true", help="Capture full-page screenshots instead of viewport")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    input_path = Path(args.input)
    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    targets = load_targets(input_path)
    if args.limit and args.limit > 0:
        targets = targets[: args.limit]

    print(f"Loaded {len(targets)} targets from {input_path}")
    results = asyncio.run(run_crawl(targets, args))
    write_reports(results, out_dir)
    build_summary_md(results, out_dir / "crawl_summary.md")
    build_contact_sheet(results, out_dir / "landscaping_homepage_contact_sheet.pdf", "Landscaping Website Screenshot Contact Sheet")

    ok = sum(r.status == "ok" for r in results)
    failed = sum(r.status == "failed" for r in results)
    skipped = len(results) - ok - failed
    print(f"Done. ok={ok} failed={failed} skipped={skipped}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
