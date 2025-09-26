# DePIN, Airdrop, Mining Feeds Pushed to RA Platform

This is a small Node.js project that fetches DePIN-related content from RSS feeds (RSSHub and native sources), deduplicates items, and pushes them into a Quickbase table **“Depin RSS Feeds”**.

### Project Name

**depin-rss-feeds-to-ra-platform**

---

### Features & Behavior

- **Deduplication**: Every RSS item is hashed (`ItemHash`) based on its source, title, GUID, and link. Quickbase’s `upsert` API uses that hash to avoid duplicates.
- **Storage**: No external database is used—**Quickbase is the single source of truth**.
- **Feeds**: Supports RSSHub routes (X, GitHub, YouTube), Medium tags, and native RSS (Reddit, Medium).
- **Flexibility**: You can swap feed sources simply by editing **feeds.json**.

---

### Setup & Usage

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-org/depin-rss-feeds-to-ra-platform.git
   cd depin-rss-feeds-to-ra-platform
   ```
