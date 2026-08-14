# Exploration animation assets

The Yusuke Urameshi sprite atlas in `public/assets/fight/` was generated from
the user-supplied *Jump Ultimate Stars* fighter sheet. The original reference
was shared from [Sprite Database](https://spritedatabase.net/file/1064); the
sheet itself credits Dazz & Fret as the rippers and The Spriters Resource as its
source archive.

Rebuild the optimized transparent atlas with:

```sh
python3 scripts/build-fight-sprites.py \
  --yusuke "/path/to/yusuke-sheet.png" \
  --charge-strip "/path/to/charge-strip.png" \
  --fire-strip "/path/to/fire-strip.png" \
  --recovery-strip "/path/to/recovery-strip.png"
```
