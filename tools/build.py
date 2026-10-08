#!/usr/bin/env python3
"""
Portfolio build helper.

Runs automatically on GitHub after every push to main (.github/workflows/build.yml),
so you normally never run it yourself. To run it locally (optional):

    pip install Pillow        # plus ffmpeg and node on your PATH
    python3 tools/build.py

What it does, every time:
  1. Media in assets/media/: renames files with spaces/capitals, compresses big videos
     (and converts .mov/.mkv/.webm to .mp4), turns big PNG/JPG screenshots into WebP,
     and makes a "<video>-poster.webp" still for every video.
     References in your content files are updated to the new names automatically.
  2. Writes projects/<slug>.html for every projects/<slug>.content.js
     (title, description, link-preview tags, preview image in assets/og/).
  3. Updates the ?v= numbers on CSS/JS so visitors always get the latest version.
  4. Rebuilds sitemap.xml, and docs/cloudflare-worker-single-file.js (the analytics worker with
     its dashboard built in, ready to paste into the Cloudflare web editor).
  5. Warns about leftover placeholder text, missing files and unused media.
It never deletes your files.
"""
import hashlib, html, json, os, re, struct, subprocess, sys

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

SITE_URL = 'https://3ezz.github.io/Moez_Melek_Portfolio/'
MEDIA_DIR = 'assets/media'
OG_DIR = 'assets/og'
VIDEO_EXT = ('.mp4', '.mov', '.m4v', '.mkv', '.webm', '.avi')
IMAGE_EXT = ('.png', '.jpg', '.jpeg', '.bmp', '.tif', '.tiff')
IMAGE_MAX_BYTES = 150_000     # screenshots bigger than this become WebP
VIDEO_MAX_BITRATE = 5_000_000 # videos above this (or >1080p, or not web-ready) get re-encoded
TEXT_FILES_GLOBS = ['index.html', 'projects.html', 'about.html', 'projects-data.js']

warnings = []
changed = []

def warn(msg):
    warnings.append(msg)

def log(msg):
    print(msg, flush=True)

def write_if_changed(path, data):
    mode = 'wb' if isinstance(data, bytes) else 'w'
    if os.path.exists(path):
        with open(path, 'rb' if mode == 'wb' else 'r', **({} if mode == 'wb' else {'encoding': 'utf-8'})) as f:
            if f.read() == data:
                return False
    with open(path, mode, **({} if mode == 'wb' else {'encoding': 'utf-8'})) as f:
        f.write(data)
    changed.append(path)
    return True

def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()

def content_files():
    return sorted(f'projects/{f}' for f in os.listdir('projects')
                  if f.endswith('.content.js') and not f.startswith('_'))

def text_files():
    return [p for p in TEXT_FILES_GLOBS if os.path.exists(p)] + content_files()

# --------------------------------------------------------------------------- JS data
def load_js(path, var):
    """Evaluate a data file like projects-data.js with node and return the object."""
    code = (f"global.window={{}};require({json.dumps(os.path.abspath(path))});"
            f"process.stdout.write(JSON.stringify(window.{var}))")
    out = subprocess.run(['node', '-e', code], capture_output=True, text=True)
    if out.returncode != 0:
        warn(f'{path} has a syntax error and was skipped:\n{out.stderr.strip()[:600]}')
        return None
    return json.loads(out.stdout or 'null')

# --------------------------------------------------------------------------- media
def slugify(name):
    stem, ext = os.path.splitext(name)
    stem = re.sub(r'\s*\(\d+\)$', '', stem)          # "clip (1)" -> "clip"
    s = re.sub(r'[^a-z0-9]+', '-', stem.lower()).strip('-') or 'file'
    return s, ext.lower()

def unique_path(folder, stem, ext, taken):
    cand, n = os.path.join(folder, stem + ext), 2
    while (os.path.exists(cand) or cand in taken):
        cand = os.path.join(folder, f'{stem}-{n}{ext}'); n += 1
    return cand

def mp4_is_faststart(path):
    with open(path, 'rb') as f:
        while True:
            head = f.read(8)
            if len(head) < 8:
                return False
            size, kind = struct.unpack('>I4s', head)
            if kind == b'moov':
                return True
            if kind == b'mdat':
                return False
            if size == 1:
                size = struct.unpack('>Q', f.read(8))[0]; f.seek(size - 16, 1)
            elif size < 8:
                return False
            else:
                f.seek(size - 8, 1)

def probe(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', path],
                         capture_output=True, text=True)
    return json.loads(out.stdout or '{}')

def video_needs_encode(path):
    if not path.lower().endswith('.mp4'):
        return True
    info = probe(path)
    v = next((s for s in info.get('streams', []) if s.get('codec_type') == 'video'), {})
    bitrate = int(info.get('format', {}).get('bit_rate') or 0)
    return (v.get('codec_name') != 'h264' or int(v.get('height') or 0) > 1080
            or bitrate > VIDEO_MAX_BITRATE or not mp4_is_faststart(path))

def encode_video(src, dst):
    tmp = dst + '.tmp.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-c:v', 'libx264', '-crf', '26', '-preset', 'medium',
                    '-pix_fmt', 'yuv420p',
                    '-vf', 'scale=-2:min(1080\\,ih):flags=lanczos,scale=trunc(iw/2)*2:trunc(ih/2)*2',
                    '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '96k', tmp], check=True)
    if src.lower().endswith('.mp4') and os.path.getsize(tmp) >= os.path.getsize(src):
        # re-encoding didn't help: keep the original stream, just make it web-ready
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-c', 'copy', '-movflags', '+faststart', tmp], check=True)
    before = os.path.getsize(src)
    os.remove(src)
    os.replace(tmp, dst)
    log(f'  video  {before/1e6:6.1f} MB -> {os.path.getsize(dst)/1e6:5.1f} MB  {dst}')

def make_poster(video, poster):
    tmp = poster + '.png'
    duration = float(probe(video).get('format', {}).get('duration') or 0)
    at = '1' if duration > 2 else '0'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', at, '-i', video, '-frames:v', '1', tmp], check=True)
    im = Image.open(tmp); im.thumbnail((1280, 1280)); im.save(poster, 'WEBP', quality=78)
    os.remove(tmp)
    changed.append(poster)
    log(f'  poster {poster}')

def convert_image(src, dst):
    im = Image.open(src)
    has_alpha = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
    im = im.convert('RGBA' if has_alpha else 'RGB')
    im.thumbnail((1920, 3840), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=84, method=6)
    before = os.path.getsize(src)
    if os.path.abspath(src) != os.path.abspath(dst):
        os.remove(src)
    log(f'  image  {before/1e3:6.0f} KB -> {os.path.getsize(dst)/1e3:5.0f} KB  {dst}')

def process_media():
    renames = {}   # old relative path -> new relative path
    taken = set()
    for folder, _, files in os.walk(MEDIA_DIR):
        for name in sorted(files):
            path = os.path.join(folder, name).replace(os.sep, '/')
            low = name.lower()
            if low.endswith('.tmp.mp4') or low.endswith('-poster.webp'):
                continue
            stem, ext = slugify(name)
            new = path
            try:
                if low.endswith(VIDEO_EXT):
                    if video_needs_encode(path):
                        new = path if (name == stem + '.mp4') else unique_path(folder, stem, '.mp4', taken)
                        encode_video(path, new)
                    elif name != stem + ext:
                        new = unique_path(folder, stem, ext, taken); os.rename(path, new)
                elif low.endswith(IMAGE_EXT) and os.path.getsize(path) > IMAGE_MAX_BYTES:
                    new = unique_path(folder, stem, '.webp', taken)
                    convert_image(path, new)
                elif name != stem + ext:
                    new = unique_path(folder, stem, ext, taken); os.rename(path, new)
                    log(f'  rename {path} -> {new}')
            except (subprocess.CalledProcessError, OSError) as e:
                warn(f'Could not process {path}: {e}')
                continue
            new = new.replace(os.sep, '/')
            taken.add(new)
            if new != path:
                renames[path] = new
                changed.append(new)
            if new.endswith('.mp4'):
                poster = new[:-4] + '-poster.webp'
                if not os.path.exists(poster):
                    try:
                        make_poster(new, poster)
                    except subprocess.CalledProcessError as e:
                        warn(f'Could not make a poster for {new}: {e}')
    return renames

def apply_renames(renames):
    if not renames:
        return
    for path in text_files():
        t = orig = read(path)
        for old, new in renames.items():
            t = t.replace(old, new)
        if t != orig:
            write_if_changed(path, t)
            log(f'  updated file names in {path}')

# --------------------------------------------------------------------------- previews
def og_image(src, name):
    im = Image.open(src)
    ratio = im.width / im.height
    im = im.convert('RGBA')
    if 'logo' in src or ratio < 1.3 or ratio > 2.6 or im.getpixel((2, 2))[3] < 200:
        corner = im.getpixel((2, 2))
        bg = corner if corner[3] > 200 else (5, 6, 10, 255)
        canvas = Image.new('RGBA', (1200, 630), bg)
        im.thumbnail((1000, 500), Image.LANCZOS)
        canvas.alpha_composite(im, ((1200 - im.width) // 2, (630 - im.height) // 2))
        im = canvas
    else:
        flat = Image.new('RGBA', im.size, (5, 6, 10, 255)); flat.alpha_composite(im)
        im = ImageOps.fit(flat, (1200, 630), Image.LANCZOS)
    out = f'{OG_DIR}/{name}.jpg'
    os.makedirs(OG_DIR, exist_ok=True)
    from io import BytesIO
    buf = BytesIO()
    im.convert('RGB').save(buf, 'JPEG', quality=82, optimize=True, progressive=True)
    write_if_changed(out, buf.getvalue())
    return out

def head_meta(url, title, desc, image, noindex=False):
    e = lambda s: html.escape(s, quote=True)
    lines = [f'<title>{html.escape(title)}</title>',
             f'<meta name="description" content="{e(desc)}" />',
             f'<link rel="canonical" href="{url}" />']
    if noindex:
        lines.append('<meta name="robots" content="noindex" />')
    lines += ['<meta property="og:type" content="website" />',
              '<meta property="og:site_name" content="Moez Melek — Portfolio" />',
              f'<meta property="og:url" content="{url}" />',
              f'<meta property="og:title" content="{e(title)}" />',
              f'<meta property="og:description" content="{e(desc)}" />',
              f'<meta property="og:image" content="{SITE_URL}{image}" />',
              '<meta property="og:image:width" content="1200" />',
              '<meta property="og:image:height" content="630" />',
              '<meta name="twitter:card" content="summary_large_image" />']
    return ''.join(f'  {l}\n' for l in lines)

# --------------------------------------------------------------------------- checks
PLACEHOLDER = re.compile(r'\[[A-Z][^\]]{2,}\]|\bAdd your\b|\bReplace (?:this|each|with|placeholder)|\blorem ipsum\b|\bTODO\b', re.I)

def walk_strings(obj, where=''):
    if isinstance(obj, str):
        yield where, obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            yield from walk_strings(v, f'{where}.{k}' if where else k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from walk_strings(v, f'{where}[{i}]')

def check_page(path, data):
    for where, s in walk_strings(data):
        if PLACEHOLDER.search(s):
            warn(f'{path}: placeholder text still in "{where}": {s[:90]}')
        if s.startswith('../assets/') and not os.path.exists(os.path.normpath(os.path.join('projects', s))):
            warn(f'{path}: "{where}" points to a missing file: {s}')

# --------------------------------------------------------------------------- pages
def build_pages(cards):
    shell = read('tools/page-shell.html')
    card_by_href = {c.get('href'): c for c in cards or []}
    pages = []
    home_og = og_image('assets/media/coffre-fort/cover.webp', 'home') if os.path.exists('assets/media/coffre-fort/cover.webp') else f'{OG_DIR}/home.jpg'
    for cpath in content_files():
        slug = os.path.basename(cpath)[:-len('.content.js')]
        data = load_js(cpath, 'PROJECT_PAGE_DATA')
        if not data:
            continue
        check_page(cpath, data)
        href = f'projects/{slug}.html'
        card = card_by_href.get(href)
        if card is None:
            warn(f'{cpath}: no card in projects-data.js links to {href}, so the page is not listed anywhere.')
        hidden = bool(card) and card.get('showProjectsPage') is False and not (
            card.get('showFeaturedRow') or card.get('showHomeUnity') or card.get('showHomeUe') or card.get('showCarousel'))
        title = f"{data.get('title', slug)} — Moez Melek"
        desc = data.get('metaDescription') or data.get('lead') or (card or {}).get('description', '')
        hero = (data.get('heroThumbnail') or '').replace('../', '', 1)
        image = home_og
        if hero and os.path.exists(hero) and not hero.endswith('.svg'):
            try:
                image = og_image(hero, slug)
            except OSError as e:
                warn(f'{cpath}: could not make a preview image from {hero}: {e}')
        page = shell.replace('{{HEAD}}', head_meta(SITE_URL + href, title, desc, image, hidden)).replace('{{SLUG}}', slug)
        write_if_changed(href, with_versions(page, 'projects'))
        pages.append((href, hidden))
    for c in cards or []:
        h = c.get('href', '')
        if h.startswith('projects/') and not os.path.exists(h):
            warn(f'projects-data.js: card "{c.get("title")}" links to {h}, which does not exist.')
    return pages

VERSION_PAT = re.compile(r'((?:src|href)=")((?:\.\./|\./)?[\w./-]+\.(?:css|js))\?v=[\w.-]*(")')

def with_versions(text, base):
    """Set ?v=<content hash> on local CSS/JS includes, so caches refresh exactly when a file changes."""
    def repl(m):
        f = os.path.normpath(os.path.join(base, m.group(2)))
        if not os.path.exists(f):
            return m.group(0)
        v = hashlib.sha1(open(f, 'rb').read()).hexdigest()[:8]
        return f'{m.group(1)}{m.group(2)}?v={v}{m.group(3)}'
    return VERSION_PAT.sub(repl, text)

def bump_versions():
    htmls = [p for p in os.listdir('.') if p.endswith('.html')] + \
            [f'projects/{p}' for p in os.listdir('projects') if p.endswith('.html')]
    for h in htmls:
        write_if_changed(h, with_versions(read(h), os.path.dirname(h)))

def build_sitemap(pages):
    urls = [SITE_URL, SITE_URL + 'projects.html', SITE_URL + 'about.html']
    urls += [SITE_URL + href for href, hidden in pages if not hidden]
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    xml += ''.join(f'  <url><loc>{u}</loc></url>\n' for u in urls) + '</urlset>\n'
    write_if_changed('sitemap.xml', xml)

def build_worker_single_file():
    """One self-contained worker file for people who deploy by pasting into the Cloudflare editor."""
    src_path, html_path = 'docs/cloudflare-analytics-worker.js', 'docs/analytics-dashboard.html'
    if not (os.path.exists(src_path) and os.path.exists(html_path)):
        return
    src = read(src_path)
    line = re.search(r"^import DASHBOARD_HTML from '\./analytics-dashboard\.html';.*$", src, re.M)
    if not line:
        warn(f'{src_path}: dashboard import line not found; single-file worker not updated.')
        return
    inlined = src[:line.start()] + 'const DASHBOARD_HTML = ' + json.dumps(read(html_path), ensure_ascii=False) + ';' + src[line.end():]
    header = ('// GENERATED by tools/build.py: do not edit. Edit docs/cloudflare-analytics-worker.js and\n'
              '// docs/analytics-dashboard.html instead. Paste this whole file into the Cloudflare Worker editor.\n')
    write_if_changed('docs/cloudflare-worker-single-file.js', header + inlined)

def unused_media():
    alltext = '\n'.join(read(p) for p in text_files())
    for folder, _, files in os.walk(MEDIA_DIR):
        for name in files:
            p = os.path.join(folder, name).replace(os.sep, '/')
            if name.endswith('-poster.webp') and p[:-len('-poster.webp')] + '.mp4' in alltext:
                continue
            if p not in alltext and name not in alltext:
                warn(f'Unused file (not referenced anywhere, but still published): {p}')

# --------------------------------------------------------------------------- main
def main():
    log('Media…')
    apply_renames(process_media())
    log('Pages…')
    cards = load_js('projects-data.js', 'PROJECTS_DATA')
    pages = build_pages(cards)
    bump_versions()
    build_sitemap(pages)
    build_worker_single_file()
    unused_media()

    gh = os.environ.get('GITHUB_ACTIONS') == 'true'
    log(f'\nDone. {len(set(changed))} file(s) created or updated.')
    if warnings:
        log(f'{len(warnings)} thing(s) to look at:')
        for w in warnings:
            log(('::warning::' if gh else '  - ') + w.replace('\n', ' '))
    if gh and os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a', encoding='utf-8') as f:
            f.write('## Portfolio build\n\n' + (''.join(f'- {w}\n' for w in warnings) if warnings else 'No issues found.\n'))

if __name__ == '__main__':
    main()
