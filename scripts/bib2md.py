#!/usr/bin/env python3
"""Generate content/publications.md from publications.bib.

No dependencies beyond the standard library. Handles the subset of BibTeX
used in publications.bib: @type{key, field = {value}, ...}. Nested braces in
values are allowed. Entry types: article, preprint, book, chapter (anything
else is treated as article).

Usage:  python scripts/bib2md.py            # writes content/publications.md
        python scripts/bib2md.py --check    # prints entries with TODOs
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BIB = ROOT / "publications.bib"
OUT = ROOT / "content" / "publications.md"

HEADER = """---
title: "Publications"
description: "Peer-reviewed papers, preprints and a book."
---

Also on [Google Scholar](https://scholar.google.com/citations?user=HXiSLuoAAAAJ) and [ORCID](https://orcid.org/0000-0002-4949-7463).

<div class="pub-list">
"""

FOOTER = "\n</div>\n"

SECTIONS = [
    ("preprint", "Preprints"),
    ("article", "Journal articles"),
    ("inproceedings", "Conference papers"),
    ("book", "Books"),
    ("chapter", "Book chapters"),
]


def strip_comments(text: str) -> str:
    return "\n".join(line for line in text.splitlines() if not line.lstrip().startswith("%"))


def parse_bib(text: str) -> list[dict]:
    """Minimal BibTeX parser: returns a list of dicts with 'type', 'key' and fields."""
    entries = []
    i = 0
    n = len(text)
    while True:
        at = text.find("@", i)
        if at < 0:
            break
        brace = text.find("{", at)
        if brace < 0:
            break
        etype = text[at + 1:brace].strip().lower()
        # find matching closing brace
        depth = 0
        j = brace
        while j < n:
            c = text[j]
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        body = text[brace + 1:j]
        i = j + 1

        key, _, fields_text = body.partition(",")
        entry = {"type": etype, "key": key.strip()}
        # fields: name = {value} or name = "value" or name = 123
        pos = 0
        while pos < len(fields_text):
            m = re.match(r"\s*([A-Za-z][\w-]*)\s*=\s*", fields_text[pos:])
            if not m:
                break
            name = m.group(1).lower()
            pos += m.end()
            if pos >= len(fields_text):
                break
            if fields_text[pos] == "{":
                depth = 0
                k = pos
                while k < len(fields_text):
                    if fields_text[k] == "{":
                        depth += 1
                    elif fields_text[k] == "}":
                        depth -= 1
                        if depth == 0:
                            break
                    k += 1
                value = fields_text[pos + 1:k]
                pos = k + 1
            elif fields_text[pos] == '"':
                k = fields_text.find('"', pos + 1)
                value = fields_text[pos + 1:k]
                pos = k + 1
            else:
                m2 = re.match(r"[^,]*", fields_text[pos:])
                value = m2.group(0)
                pos += m2.end()
            # skip trailing comma
            m3 = re.match(r"\s*,?", fields_text[pos:])
            pos += m3.end()
            entry[name] = clean(value)
        entries.append(entry)
    return entries


def clean(value: str) -> str:
    value = value.strip()
    value = value.replace("{", "").replace("}", "")
    value = value.replace("--", "–")
    value = re.sub(r"\s+", " ", value)
    return value


def format_authors(raw: str) -> str:
    """'First Last and First Last' -> 'F. Last, F. Last'. Bold for the site owner."""
    names = [a.strip() for a in re.split(r"\s+and\s+", raw) if a.strip()]
    out = []
    for name in names:
        if "," in name:  # Last, First
            last, first = [p.strip() for p in name.split(",", 1)]
        else:
            parts = name.split()
            last, first = parts[-1], " ".join(parts[:-1])
        initials = " ".join(f"{p[0]}." for p in first.replace("-", " ").split() if p)
        short = f"{initials} {last}".strip()
        if last.lower() == "santini" and initials.startswith("A."):
            short = f"<strong>{short}</strong>"
        out.append(short)
    if len(out) > 1:
        return ", ".join(out[:-1]) + " and " + out[-1]
    return out[0] if out else ""


def format_venue(e: dict) -> str:
    t = e["type"]
    if t == "preprint":
        return f"arXiv:{e.get('eprint', '')}"
    if t in ("book", "chapter"):
        parts = [e.get("booktitle") or "", e.get("publisher") or ""]
        return ", ".join(p for p in parts if p)
    venue = e.get("booktitle") if t == "inproceedings" else e.get("journal", "")
    if e.get("volume"):
        venue += f" <strong>{e['volume']}</strong>"
    if e.get("pages"):
        venue += f", {e['pages']}" if e.get("volume") else f" {e['pages']}"
    return venue


def format_links(e: dict) -> str:
    links = []
    if e.get("doi"):
        links.append(f'<a href="https://doi.org/{e["doi"]}">doi</a>')
    if e.get("eprint") and e["eprint"] != "TODO":
        links.append(f'<a href="https://arxiv.org/abs/{e["eprint"]}">arXiv</a>')
    if e.get("url"):
        label = "OpenReview" if "openreview.net" in e["url"] else "link"
        links.append(f'<a href="{e["url"]}">{label}</a>')
    return " ".join(links)


def format_entry(e: dict) -> str:
    authors = format_authors(e.get("author", ""))
    title = e.get("title", "")
    venue = format_venue(e)
    links = format_links(e)
    note = e.get("note", "")
    year = e.get("year", "")
    body = f'<span class="pub-title">{title}</span>'
    body += f'<span class="pub-authors">{authors}</span>. '
    body += f'<span class="pub-venue">{venue}</span>.'
    if links:
        body += f' <span class="pub-links">{links}</span>'
    if note and not note.startswith("TODO"):
        body += f" <em>{note}</em>"
    return f'<div class="pub"><span class="pub-year">{year}</span><div>{body}</div></div>'


def sort_key(e: dict):
    try:
        year = int(e.get("year", "0"))
    except ValueError:
        year = 0
    return (-year, e.get("author", ""))


def main(argv: list[str]) -> int:
    text = strip_comments(BIB.read_text(encoding="utf-8"))
    entries = parse_bib(text)

    if "--check" in argv:
        todo = [e for e in entries if "TODO" in " ".join(e.values())]
        for e in todo:
            print(f"TODO  {e['key']}: {e.get('title', '')}")
        print(f"{len(entries)} entries, {len(todo)} with TODOs")
        return 0

    out = [HEADER]
    for etype, heading in SECTIONS:
        group = sorted((e for e in entries if e["type"] == etype), key=sort_key)
        if not group:
            continue
        out.append(f"\n## {heading}\n")
        for e in group:
            out.append(format_entry(e))
    out.append(FOOTER)
    OUT.write_text("\n".join(out), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({len(entries)} entries)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
