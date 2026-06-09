# SAG Website Asset Pack — Selected

Paket ini berisi asset yang sudah dipilih dari Google Drive SAG dan siap dipakai untuk website modern/Vercel/Next/Astro/React.

## Struktur
- `brand/` — logo utama dan logo mark
- `hero/` — gambar lebar untuk hero dan unit usaha
- `sections/` — gambar section About, Director, Agronomy, Career/Culture, Office
- `maps/` — peta operasional
- `units/` — unit usaha tambahan
- `culture/` — foto gathering/event

## Rekomendasi implementasi
- Navbar: `brand/logo-ptsag.png`
- Favicon / app icon: `brand/logo-sag-transparent.png` atau generate dari file ini
- Hero homepage: `hero/sawit-plantation.webp`
- About Us: `sections/about-us.webp`
- Unit usaha: `hero/pt-pal-estate.webp`, `hero/pt-gbp-mill.webp`, `units/hsbs.webp`
- Career / Grow With Us: `sections/team-seragam.webp` atau `culture/gathering.webp`
- Contact / Office: `sections/office-front.webp`
- Map section: `maps/peta-indonesia.webp`

## Catatan teknis
- File JPG besar sudah dikonversi ke WebP agar lebih ringan untuk website.
- Logo tetap PNG agar transparansi aman.
- Untuk production, tetap pakai `alt` text deskriptif dan lazy loading untuk gambar non-hero.
