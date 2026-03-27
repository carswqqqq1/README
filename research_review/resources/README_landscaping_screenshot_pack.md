# Landscaping Website Screenshot Pack

This pack is for the job you actually asked for: grabbing real screenshots, not fake fluff.

## What is inside

- `landscaping_screenshot_targets.csv`
  - 200 targets extracted from the markdown list.
  - Columns: `rank`, `company`, `domain`, `url_guess`, `status`
- `landscaping_screenshot_crawler.py`
  - Playwright crawler that visits the sites and saves screenshots.
  - Writes a crawl report, a markdown summary, and a PDF contact sheet.
- `run_landscaping_screenshot_crawler.sh`
  - One-command runner.
- `top_200_landscaping_websites_usa_for_manus.md`
  - Original benchmark list.

## Reality check

This pack does not pretend unresolved domains are magically solved.

The source list has many entries marked `not batch-verified in this pass`.
The crawler will skip those until you or Manus fills the domain in first.
That is honest behavior.

## Install and run

```bash
python3 -m pip install --upgrade pip
python3 -m pip install playwright pillow reportlab
python3 -m playwright install chromium
bash run_landscaping_screenshot_crawler.sh
```

## Fast test first

Do a smaller run before the whole thing:

```bash
python3 landscaping_screenshot_crawler.py \
  --input landscaping_screenshot_targets.csv \
  --output-dir ./test_run \
  --limit 10 \
  --full-page
```

## Full run

```bash
python3 landscaping_screenshot_crawler.py \
  --input landscaping_screenshot_targets.csv \
  --output-dir ./full_run \
  --full-page \
  --concurrency 4 \
  --timeout-ms 30000
```

## Output files after a run

Inside the output folder you will get:

- `screenshots/`
  - PNG screenshots named like `001_brightview_holdings_blue_bell_pa.png`
- `crawl_report.csv`
  - Per-site status, final URL, title, errors, screenshot path
- `crawl_report.jsonl`
  - Same thing in machine-readable line-delimited JSON
- `crawl_summary.md`
  - Quick human summary of wins and failures
- `landscaping_homepage_contact_sheet.pdf`
  - PDF contact sheet of successful screenshots

## If you want every page instead of just the homepage

That is a different job. Bigger, slower, and more failure-prone.
Do not confuse homepage screenshot capture with full-site crawling.

If you want full-site capture, extend the script like this:

1. Start from the homepage
2. Collect internal links only
3. Filter junk routes like login, privacy, careers, querystring spam, and PDFs
4. Cap pages per domain so the run does not explode
5. Save page-level screenshots in per-domain folders
6. Build a per-domain PDF instead of one giant monster PDF

A sane cap is `10 to 25` pages per site, not infinite crawl chaos.

## Brutal truth

Trying to screenshot every single page of 200 websites in one pass is dumb unless you add crawl rules and limits.
Otherwise you will get bloated output, duplicate pages, broken sessions, and trash data.

Homepage screenshots first.
Then shortlist 20 to 40 sites worth deeper teardown.
That is the sane move.
