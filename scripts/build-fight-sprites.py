#!/usr/bin/env python3
"""Build the transparent Yusuke atlas used by the Exploration runway."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image


CELL_WIDTH = 128
CELL_HEIGHT = 96
ATLAS_COLUMNS = 8
SHEET_BACKGROUND = (128, 128, 255)
STRIP_BACKGROUND = (51, 112, 108)


def chroma_key(image: Image.Image, background: tuple[int, int, int]) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            if pixels[x, y][:3] == background:
                pixels[x, y] = (0, 0, 0, 0)
    return rgba


def idle_frames(source_path: Path) -> list[Image.Image]:
    source = chroma_key(Image.open(source_path), SHEET_BACKGROUND)
    frames: list[Image.Image] = []
    for column in range(4):
        x0 = round(column * source.width / 10)
        x1 = round((column + 1) * source.width / 10)
        y1 = round(source.height / 23)
        frame = source.crop((x0, 0, x1, y1))
        content = frame.getbbox()
        if content is None:
            raise ValueError(f"Idle frame {column} has no visible pixels")
        frames.append(frame.crop(content))
    return frames


def strip_frames(source_path: Path, expected_count: int) -> list[Image.Image]:
    """Split a 2x reference strip into frames while preserving group alignment."""

    source = chroma_key(Image.open(source_path), STRIP_BACKGROUND)
    content = source.getbbox()
    if content is None:
        raise ValueError(f"{source_path.name} has no visible pixels")
    y0, y1 = content[1], content[3]

    occupied_columns = [
        x
        for x in range(source.width)
        if source.crop((x, y0, x + 1, y1)).getbbox() is not None
    ]
    runs: list[tuple[int, int]] = []
    start = previous = occupied_columns[0]
    for x in occupied_columns[1:]:
        if x - previous > 8:
            runs.append((start, previous + 1))
            start = x
        previous = x
    runs.append((start, previous + 1))

    if len(runs) != expected_count:
        raise ValueError(
            f"{source_path.name} contains {len(runs)} frames; expected {expected_count}"
        )

    frames: list[Image.Image] = []
    for x0, x1 in runs:
        frame = source.crop((x0, y0, x1, y1))
        frames.append(
            frame.resize(
                (round(frame.width / 2), round(frame.height / 2)),
                Image.Resampling.NEAREST,
            )
        )
    return frames


def build_atlas(
    groups: dict[str, list[Image.Image]],
    output_path: Path,
    manifest_path: Path,
) -> None:
    frame_count = sum(len(frames) for frames in groups.values())
    atlas_rows = (frame_count + ATLAS_COLUMNS - 1) // ATLAS_COLUMNS
    atlas = Image.new(
        "RGBA", (ATLAS_COLUMNS * CELL_WIDTH, atlas_rows * CELL_HEIGHT)
    )
    manifest: dict[str, object] = {
        "cell": {
            "width": CELL_WIDTH,
            "height": CELL_HEIGHT,
            "columns": ATLAS_COLUMNS,
        },
        "groups": {},
    }

    frame_index = 0
    manifest_groups: dict[str, list[int]] = {}
    for name, frames in groups.items():
        manifest_groups[name] = []
        for frame in frames:
            content = frame.getbbox()
            if content is None:
                raise ValueError(f"{name} frame {frame_index} has no visible pixels")
            if frame.width > CELL_WIDTH or frame.height > CELL_HEIGHT:
                frame.thumbnail((CELL_WIDTH, CELL_HEIGHT), Image.Resampling.NEAREST)

            cell_x = (frame_index % ATLAS_COLUMNS) * CELL_WIDTH
            cell_y = (frame_index // ATLAS_COLUMNS) * CELL_HEIGHT
            paste_x = cell_x + (CELL_WIDTH - frame.width) // 2
            paste_y = cell_y + CELL_HEIGHT - frame.height
            atlas.alpha_composite(frame, (paste_x, paste_y))
            manifest_groups[name].append(frame_index)
            frame_index += 1

    manifest["groups"] = manifest_groups
    output_path.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(output_path, optimize=True)
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--yusuke", type=Path, required=True)
    parser.add_argument("--charge-strip", type=Path, required=True)
    parser.add_argument("--fire-strip", type=Path, required=True)
    parser.add_argument("--recovery-strip", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path("public/assets/fight"))
    args = parser.parse_args()

    build_atlas(
        {
            "idle": idle_frames(args.yusuke),
            "charge": strip_frames(args.charge_strip, 10),
            "fire": strip_frames(args.fire_strip, 4),
            "recovery": strip_frames(args.recovery_strip, 4),
        },
        args.output / "yusuke-atlas.png",
        args.output / "yusuke-frames.json",
    )


if __name__ == "__main__":
    main()
