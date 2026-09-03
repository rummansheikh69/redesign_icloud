"""Generate the Apple-style logo with colored dots ring (transparent bg)."""
import math
import os

APPLE_PATH = (
    "M18.71 19.5c-.83 1.24-1.74 2.47-3.06 2.5-1.32.03-1.75-.78-3.27-.78"
    "-1.52 0-2 .8-3.25.83-1.31.03-2.3-1.31-3.14-2.53C4.49 15.94 5.08 10.52 7.53 7.7"
    "c1.22-1.42 2.65-2.39 4.41-2.42 1.39-.02 2.7.94 3.55.94.85 0 2.43-1.16 4.1-1 "
    "1.26.05 2.53.74 3.44 1.86-.1.06-2.06 1.2-2.05 3.59.02 2.86 2.49 3.82 2.55 3.84"
    "-.03.13-.39 1.37-1.18 2.19zM13 3.5c.73-.88 1.23-2.1 1.09-3.32-1.06.05-2.35.71-3.1 1.6"
    "-.67.78-1.26 2.04-1.1 3.26 1.17.09 2.37-.74 3.11-1.54z"
)


def hsl_to_hex(h, s, l):
    s /= 100
    l /= 100
    c = (1 - abs(2 * l - 1)) * s
    x = c * (1 - abs((h / 60) % 2 - 1))
    m = l - c / 2
    if 0 <= h < 60:
        r, g, b = c, x, 0
    elif 60 <= h < 120:
        r, g, b = x, c, 0
    elif 120 <= h < 180:
        r, g, b = 0, c, x
    elif 180 <= h < 240:
        r, g, b = 0, x, c
    elif 240 <= h < 300:
        r, g, b = x, 0, c
    else:
        r, g, b = c, 0, x
    return "#{:02x}{:02x}{:02x}".format(
        int((r + m) * 255), int((g + m) * 255), int((b + m) * 255)
    )


def dot_hue(x, y, cx, cy):
    """Top orange -> sides pink -> bottom blue (no green)."""
    dx = x - cx
    dy = y - cy
    angle = math.degrees(math.atan2(dy, dx))
    from_top = (angle + 90) % 360
    theta = min(from_top, 360 - from_top)
    hue = 30 - theta
    if hue < 0:
        hue += 360
    return hue


def generate_svg():
    size = 400
    cx = cy = size / 2
    dots_per_ring = [22, 28, 34, 40, 46, 52, 58]
    inner_radius = 58
    ring_spacing = 13
    dot_radius = 3.1

    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">',
    ]

    for ring_idx, count in enumerate(dots_per_ring):
        radius = inner_radius + ring_idx * ring_spacing
        for i in range(count):
            angle = (2 * math.pi * i) / count + ring_idx * 0.09
            x = cx + radius * math.cos(angle)
            y = cy + radius * math.sin(angle)
            color = hsl_to_hex(dot_hue(x, y, cx, cy), 88, 58)
            parts.append(
                f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{dot_radius:.2f}" fill="{color}"/>'
            )

    parts.append(
        f'<g transform="translate(145,155) scale(4.8)" fill="#000">'
        f'<path d="{APPLE_PATH}"/></g>'
    )
    parts.append("</svg>")
    return "\n".join(parts)


if __name__ == "__main__":
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_path = os.path.join(root, "frontend", "public", "logo.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(generate_svg())
    print(f"Logo written to {out_path}")
