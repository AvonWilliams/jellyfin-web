<h1 align="center">jellyfin-web — Browse Modes fork</h1>

<p align="center">
A fork of the official Jellyfin web client that adds a <strong>tile grid</strong> when you open a
Movies or TV library, instead of dropping straight into one long alphabetical list.
</p>

---

## What this fork changes

Opening a Movies or TV library shows **Browse by…** — a grid of tiles, each a different way in:

**All** · **Unwatched** · **Just Added** · **Best Unseen** · **Random** · **Favorites** ·
**Genres** · **Highest Rated** · **Top Rated** · **Trending** · **New Releases** ·
**Decades** · **Studios / Networks** · **Recently Played** · **Age Rating** ·
**Critics' Picks** *(films only)* · **Longest**

Nothing is hidden — the first tile, **All**, is the ordinary list exactly as it was. Each tile
also remembers its own sort, so changing the sort inside "Just Added" leaves your normal library
view alone.

That is 18 changed files against upstream, on the [`browse-modes`](../../tree/browse-modes)
branch. Everything else is stock Jellyfin.

> **This fork covers the browser and the Jellyfin _phone_ app** — the phone app is a WebView over
> this bundle, so it picks the change up automatically. The Jellyfin **TV** app is native and
> shares nothing with this code; it needs
> [its own fork](https://github.com/AvonWilliams/jellyfin-androidtv).

## Install

You almost certainly do not want to build this. Grab the prebuilt bundle:

**1. Download** `jellyfin-web-browse-modes.zip` from the
[Browse Modes releases](https://github.com/AvonWilliams/jellyfin-browse-modes/releases).

**2. Unpack it over your server's web directory.** For the official Docker image:

```bash
unzip jellyfin-web-browse-modes.zip
docker cp dist/. <your-jellyfin-container>:/jellyfin/jellyfin-web/
```

Without Docker it is wherever `--webdir` points, typically `/usr/share/jellyfin/web`.

**3. Hard-refresh your browser — `Ctrl+Shift+R`.** Jellyfin caches its own interface
aggressively. Skip this and the tiles will not appear and you will think the install failed.
On the phone app, force-close and reopen it.

### Optional: the server plugin

Two tiles — **Trending** and **Top Rated** — read curated TMDb lists and need the
[Browse Modes plugin](https://github.com/AvonWilliams/jellyfin-browse-modes) installed on your
server. Every other tile works without it; those two just come up empty.

Your Jellyfin server stays completely standard either way — there is no custom server build.

### Building from source

```bash
git clone -b browse-modes https://github.com/AvonWilliams/jellyfin-web.git
cd jellyfin-web
npm ci
npm run build:production        # -> dist/
```

Requires Node 24 or newer.

## Caveats

### This does not survive a Jellyfin update

In the official Docker image the web root is **baked into the image, not a mounted volume**.
Recreating the container or pulling a newer Jellyfin image silently restores the stock client and
the tiles vanish, with no error anywhere. The same applies to a package upgrade on bare metal or
in an LXC, which replaces the web directory wholesale.

To make it stick, mount the unpacked bundle over the web root rather than copying into it:

```
-v /path/to/dist:/jellyfin/jellyfin-web:ro
```

The mount wins over whatever the image ships. You will still want a fresh bundle when moving to a
new Jellyfin version, since client and server are versioned together.

Not sure where your web root is?

```bash
docker exec <container> sh -c 'cat /proc/1/cmdline | tr "\0" " "'   # a --webdir flag?
docker exec <container> sh -c 'find / -name index.html -path "*web*" -not -path "*/config/*" 2>/dev/null'
```

Usually `/jellyfin/jellyfin-web` (official Docker image) or `/usr/share/jellyfin/web` (Debian /
Ubuntu packages and most LXC installs). Back up before overwriting:

```bash
docker exec <container> cp -a /jellyfin/jellyfin-web /jellyfin/jellyfin-web.bak
```

### Other
- Built against **Jellyfin 12.0-rc3**. Other versions may work but are untested.
- The tile page is skipped entirely if you have set a specific landing view for a library.

## Documentation

- [User guide](https://github.com/AvonWilliams/jellyfin-browse-modes/blob/main/docs/USER-GUIDE.md)
  — what each tile does, install walkthrough, troubleshooting
- [Technical reference](https://github.com/AvonWilliams/jellyfin-browse-modes/blob/main/docs/TECHNICAL.md)
  — every change, why, and how to re-apply it to a newer Jellyfin release

## Upstream

This is a fork of [jellyfin/jellyfin-web](https://github.com/jellyfin/jellyfin-web) and remains
under **GPL-2.0**. All credit for Jellyfin itself goes to its maintainers and contributors; the
browse modes work is an unaffiliated addition.
