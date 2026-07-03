# Logo dosyaları

Logolar orijinal PDF'ten çıkarıldı ve kullanılıyor:

- `logo-dark.png` — tam kilit, koyu (açık zeminlerde: footer değil, açık bölümler)
- `logo-light.png` — tam kilit, beyaz (footer gibi koyu zeminlerde)
- `mark-dark.png` — sadece makas ikonu, koyu (navbar)
- `mark-light.png` — sadece makas ikonu, beyaz (koyu zemin)

Kaynak: `line cadde & iba kuaför _logo.pdf` (sayfa 1 = koyu logo, sayfa 2 = beyaz logo).

## Yeniden üretmek gerekirse (macOS)
```bash
cd public/assets/logo
PDF="line cadde & iba kuaför _logo.pdf"
pdftoppm -png -r 500 -f 1 -l 1 "$PDF" p1
pdftoppm -png -r 500 -f 2 -l 2 "$PDF" p2
magick p1-1.png -fuzz 8% -trim +repage -fuzz 14% -transparent white logo-dark.png
magick p2-2.png -fuzz 8% -trim +repage -fuzz 14% -transparent black logo-light.png
# ikon (üst ~%30) kırpma:
magick logo-dark.png -crop x30%+0+0 +repage -trim +repage mark-dark.png
magick logo-light.png -crop x30%+0+0 +repage -trim +repage mark-light.png
rm -f p1-1.png p2-2.png
```

Yolları değiştirmek isterseniz: `src/data/site.ts` → `brand.logoDark / logoLight / markDark / markLight`.
