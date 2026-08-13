"""Generates the curated post-image set (SPEC.md §7).

These need to read as photographs at a glance — a flat vector scene looks like a
wireframe placeholder on a social card, which defeats the point: the learner has
to believe the post before they can be fooled by it.

So each scene is built like a photograph rather than a diagram:

  * three depth planes, with the far plane gaussian-blurred (depth of field)
  * a directional key light and a matching warm/cool grade
  * atmospheric haze that lightens with distance
  * a vignette, because every phone camera has one
  * film grain over the whole frame

Everything is still invented — no real place, no identifiable face. The image is
deliberately never the evidence; the caption is what makes the claim.
"""
import os

OUT = "/Users/vishalkalra/Documents/Github/the-misinformation-lab/src/assets/images/scenes"
os.makedirs(OUT, exist_ok=True)
W, H = 480, 320


def head(defs=""):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" preserveAspectRatio="xMidYMid slice" role="img">
<defs>
<filter id="far" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4.2"/></filter>
<filter id="mid" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.5"/></filter>
<filter id="near" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.6"/></filter>
<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
<radialGradient id="vig" cx="50%" cy="46%" r="72%">
  <stop offset="55%" stop-color="#000" stop-opacity="0"/>
  <stop offset="100%" stop-color="#000" stop-opacity="0.42"/>
</radialGradient>
<filter id="grain" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" stitchTiles="stitch"/>
  <feColorMatrix type="saturate" values="0"/>
</filter>
{defs}
</defs>'''


def tail(grade_top="#FFD9A8", grade_bot="#2A3A5E", grade_op=".16"):
    """Colour grade + vignette + grain, applied to every scene identically so
    the ten of them read as one camera."""
    return f'''
<linearGradient id="grade" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="{grade_top}" stop-opacity="{grade_op}"/>
  <stop offset="1" stop-color="{grade_bot}" stop-opacity="{grade_op}"/>
</linearGradient>
<rect width="{W}" height="{H}" fill="url(#grade)"/>
<rect width="{W}" height="{H}" fill="url(#vig)"/>
<rect width="{W}" height="{H}" filter="url(#grain)" opacity="0.085"/>
</svg>'''


def write(name, body, defs="", grade=("#FFD9A8", "#2A3A5E", ".16")):
    open(os.path.join(OUT, name), "w").write(head(defs) + body + tail(*grade))
    return name


def sky(a, b, c, sun_x=360, sun_y=54, sun="#FFE6BC", sun_op=".85"):
    return f'''
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="{a}"/><stop offset=".55" stop-color="{b}"/><stop offset="1" stop-color="{c}"/>
</linearGradient>
<radialGradient id="sun" cx="50%" cy="50%" r="50%">
  <stop offset="0" stop-color="{sun}" stop-opacity="{sun_op}"/>
  <stop offset="1" stop-color="{sun}" stop-opacity="0"/>
</radialGradient>''', f'''
<rect width="{W}" height="{H}" fill="url(#sky)"/>
<ellipse cx="{sun_x}" cy="{sun_y}" rx="150" ry="110" fill="url(#sun)"/>'''


def crowd(rows, seedx=0):
    """Layered silhouettes: far ones small, pale and blurred; near ones large,
    dark and sharp. Faceless throughout."""
    out = []
    for (y, scale, fill, op, blur, xs) in rows:
        f = f' filter="url(#{blur})"' if blur else ""
        g = [f'<g fill="{fill}" opacity="{op}"{f}>']
        for x in xs:
            x += seedx
            hh = 34 * scale
            g.append(f'<circle cx="{x}" cy="{y-hh:.0f}" r="{5.6*scale:.1f}"/>')
            g.append(f'<path d="M{x-7*scale:.1f} {y} v-{hh-7*scale:.1f} '
                     f'a{7*scale:.1f} {7*scale:.1f} 0 0 1 {14*scale:.1f} 0 V{y} z"/>')
        g.append("</g>")
        out.append("".join(g))
    return "".join(out)


# ---------------------------------------------------------------- 1 reservoir
d, s = sky("#7FA9D6", "#B6CDE4", "#DCE7F0", 380, 46)
write("reservoir.svg", s + f'''
<g filter="url(#far)">
  <path d="M0 150 L90 118 L170 146 L250 112 L340 148 L420 124 L480 150 V190 H0 Z" fill="#8FA5BE" opacity=".75"/>
  <rect y="150" width="480" height="26" fill="#A8BACD" opacity=".6"/>
</g>
<g filter="url(#mid)">
  <rect x="18" y="120" width="86" height="64" rx="2" fill="#9BAEC4"/>
  <rect x="18" y="120" width="86" height="9" fill="#B4C4D6"/>
  <rect x="126" y="132" width="150" height="52" fill="#A3B6CB"/>
  <rect x="126" y="132" width="150" height="8" fill="#BCCAD9"/>
  <rect x="300" y="126" width="104" height="58" fill="#97ABC2"/>
  <rect x="300" y="126" width="104" height="8" fill="#B0C0D2"/>
  <rect x="156" y="98" width="13" height="36" fill="#8EA3BA"/>
</g>
<rect y="184" width="480" height="136" fill="#5E7C9E"/>
<rect y="184" width="480" height="9" fill="#4E6A8B"/>
<ellipse cx="150" cy="228" rx="146" ry="34" fill="#43617F"/>
<ellipse cx="150" cy="222" rx="146" ry="34" fill="#6D8FB4"/>
<ellipse cx="150" cy="222" rx="104" ry="22" fill="#5A7CA3" opacity=".8"/>
<ellipse cx="386" cy="268" rx="128" ry="30" fill="#43617F"/>
<ellipse cx="386" cy="262" rx="128" ry="30" fill="#6D8FB4"/>
<g opacity=".33" fill="#DCEAF6">
  <rect x="60" y="214" width="120" height="2" rx="1"/><rect x="96" y="228" width="76" height="2" rx="1"/>
  <rect x="320" y="256" width="110" height="2" rx="1"/><rect x="352" y="270" width="64" height="2" rx="1"/>
</g>
<g filter="url(#near)" opacity=".92">
  <rect y="292" width="480" height="28" fill="#2E3F52"/>
  <rect y="286" width="480" height="7" rx="3" fill="#3B4F66"/>
  <rect x="54" y="286" width="8" height="34" fill="#33455A"/>
  <rect x="248" y="286" width="8" height="34" fill="#33455A"/>
  <rect x="424" y="286" width="8" height="34" fill="#33455A"/>
</g>''', d)

# ----------------------------------------------------------------- 2 townhall
d, s = sky("#8FB0D8", "#CBD9E6", "#EADFCB", 120, 60)
write("townhall.svg", s + f'''
<g filter="url(#far)" opacity=".7">
  <rect x="0" y="150" width="120" height="80" fill="#B9BDC4"/>
  <rect x="380" y="140" width="100" height="90" fill="#B9BDC4"/>
</g>
<g filter="url(#mid)">
  <path d="M78 108 L240 44 L402 108 Z" fill="#C6B79B"/>
  <path d="M78 108 L240 44 L240 108 Z" fill="#D6C8AD"/>
  <rect x="94" y="108" width="292" height="14" fill="#CDBEA2"/>
  <rect x="94" y="122" width="292" height="112" fill="#E0D4BC"/>
  <rect x="94" y="122" width="292" height="112" fill="url(#wall)"/>
  {"".join(f'<g><rect x="{x}" y="140" width="20" height="94" fill="#F0E7D5"/><rect x="{x}" y="140" width="6" height="94" fill="#FFF9EC"/><rect x="{x+16}" y="140" width="4" height="94" fill="#C6B79B"/></g>' for x in (110,156,202,248,294,340))}
  <rect x="214" y="176" width="52" height="58" fill="#7E6C4F"/>
  <rect x="218" y="180" width="44" height="54" fill="#5E4F39"/>
  <rect x="94" y="228" width="292" height="8" fill="#BEAF93"/>
</g>
<rect y="234" width="480" height="86" fill="#B9AC92"/>
<rect y="234" width="480" height="8" fill="#A6987E"/>
<rect y="272" width="480" height="4" fill="#AC9F85" opacity=".7"/>
''' + crowd([
  (268, .8, "#3A3226", ".55", "mid", [126, 148, 300, 322, 344]),
  (300, 1.15, "#241E16", ".72", "near", [66, 200, 396]),
]) + '''
<g filter="url(#near)" opacity=".5"><rect x="0" y="0" width="30" height="320" fill="#1B160F"/></g>''',
d + '<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".08"/></linearGradient>')

# ----------------------------------------------------------- 3 school kitchen
# Rewritten: the first pass was near-white on near-white and read as a blur at
# card size. Warm overhead service lighting against a darker room gives it the
# tonal range a real interior photograph has.
d = """<linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#D3DAD8"/><stop offset=".45" stop-color="#8E9C98"/><stop offset="1" stop-color="#AEB9B5"/></linearGradient>
<linearGradient id="counter" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#E8EDEA"/><stop offset="1" stop-color="#9AA8A3"/></linearGradient>
<radialGradient id="pool" cx="50%" cy="0%" r="90%">
<stop offset="0" stop-color="#FFE4B0" stop-opacity=".75"/><stop offset="1" stop-color="#FFE4B0" stop-opacity="0"/></radialGradient>"""
write("school-kitchen.svg", f"""
<rect width="480" height="320" fill="#3F4A47"/>
<g filter="url(#far)" opacity=".9">
  <rect x="0" y="0" width="480" height="150" fill="#4C5754"/>
  <rect x="34" y="30" width="120" height="76" rx="3" fill="#6E7F79"/>
  <rect x="326" y="30" width="120" height="76" rx="3" fill="#6E7F79"/>
  <rect x="186" y="20" width="108" height="92" fill="#586661"/>
  <rect x="194" y="30" width="92" height="34" rx="2" fill="#75857F"/>
</g>
{"".join(f'<g><rect x="{x}" y="0" width="72" height="12" rx="2" fill="#2E3634"/><rect x="{x+6}" y="12" width="60" height="7" rx="3" fill="#FFF0CE"/><ellipse cx="{x+36}" cy="70" rx="86" ry="76" fill="url(#pool)"/></g>' for x in (58, 204, 350))}
<g filter="url(#mid)">
  <rect y="132" width="480" height="26" fill="#5C6A65"/>
  <rect x="24" y="158" width="190" height="76" fill="url(#steel)"/>
  <rect x="24" y="158" width="190" height="8" fill="#E4EAE7"/>
  <rect x="266" y="158" width="190" height="76" fill="url(#steel)"/>
  <rect x="266" y="158" width="190" height="8" fill="#E4EAE7"/>
  <rect x="222" y="146" width="36" height="88" fill="#6B7A75"/>
</g>
<rect y="234" width="480" height="86" fill="url(#counter)"/>
<rect y="234" width="480" height="9" fill="#F2F6F4"/>
{"".join(f'<g><rect x="{x}" y="252" width="72" height="50" rx="5" fill="#C2CCC8"/><rect x="{x+3}" y="255" width="66" height="44" rx="4" fill="#8FA09A"/><rect x="{x+9}" y="262" width="22" height="12" rx="2" fill="#D9E2DE"/><rect x="{x+37}" y="262" width="24" height="12" rx="2" fill="#D9E2DE"/><rect x="{x+9}" y="280" width="52" height="12" rx="2" fill="#E7EDEA"/><ellipse cx="{x+36}" cy="306" rx="34" ry="7" fill="#4E5A56" opacity=".45"/></g>' for x in (16, 110, 204, 298, 392))}
<g filter="url(#soft)" opacity=".4">
  <path d="M150 142 q16 -44 0 -84 M176 142 q16 -44 0 -84 M202 142 q16 -44 0 -84" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round"/>
</g>
""" + crowd([(234, .8, "#232B29", ".6", "mid", [244, 266])]) + """
<g filter="url(#near)" opacity=".8"><rect y="298" width="480" height="22" fill="#252C2A"/></g>""", d,
("#FFDCA0", "#141A19", ".2"))

# -------------------------------------------------------------- 4 platform
d, s = sky("#5C6E86", "#93A5B8", "#C3CCD6", 250, 40, "#FFD9A0", ".7")
write("platform.svg", s + f'''
<g filter="url(#far)" opacity=".8">
  <rect y="150" width="480" height="40" fill="#8492A3"/>
  {"".join(f'<rect x="{x}" y="120" width="26" height="34" fill="#7C8A9B"/>' for x in range(6, 480, 58))}
</g>
<g filter="url(#mid)">
  <rect y="52" width="480" height="16" fill="#98A5B4"/>
  <rect y="68" width="480" height="6" fill="#6E7C8C" opacity=".5"/>
  {"".join(f'<rect x="{x}" y="74" width="11" height="120" fill="#8B98A8"/><rect x="{x-4}" y="74" width="19" height="7" fill="#79879A"/>' for x in (52, 208, 364))}
  <rect x="286" y="96" width="112" height="34" rx="4" fill="#232A34"/>
  <rect x="296" y="106" width="34" height="5" rx="2" fill="#8FE0B0"/>
  <rect x="296" y="116" width="62" height="5" rx="2" fill="#D9E4EE"/>
</g>
<rect y="194" width="480" height="126" fill="#9AA6B4"/>
<rect y="194" width="480" height="10" fill="#828F9E"/>
<rect y="236" width="480" height="7" fill="#6F7C8B"/>
<rect y="272" width="480" height="7" fill="#6F7C8B"/>
{"".join(f'<rect x="{x}" y="230" width="12" height="56" fill="#7E8B99" opacity=".45"/>' for x in range(4, 480, 46))}
<rect x="0" y="286" width="480" height="34" fill="#B4BEC9"/>
<rect x="0" y="286" width="480" height="5" fill="#D2DAE2"/>
{"".join(f'<rect x="{x}" y="292" width="26" height="6" rx="3" fill="#E0B14A" opacity=".8"/>' for x in range(10, 480, 44))}
''' + crowd([
  (194, .85, "#33404F", ".6", "mid", [246, 268, 402, 424]),
  (286, 1.2, "#1D2530", ".8", None, [96, 120, 340]),
]), d, ("#FFC98A", "#101A2A", ".28"))

# --------------------------------------------------------------- 5 clinic
d, s = sky("#9AB4D8", "#C9D6E6", "#E4E2EC", 90, 50)
write("clinic.svg", s + f'''
<g filter="url(#far)" opacity=".65"><rect x="0" y="120" width="150" height="110" fill="#AAB4C6"/><rect x="360" y="132" width="120" height="98" fill="#AAB4C6"/></g>
<g filter="url(#mid)">
  <rect x="60" y="96" width="360" height="134" fill="#DCD8EA"/>
  <rect x="60" y="96" width="360" height="12" fill="#C4BEDC"/>
  <rect x="60" y="96" width="360" height="134" fill="url(#lit)"/>
  {"".join(f'<g><rect x="{x}" y="124" width="42" height="34" rx="2" fill="#8FA6C4"/><rect x="{x}" y="124" width="42" height="14" fill="#B9CBE0" opacity=".7"/></g>' for x in (78, 136, 194, 252, 310, 362))}
  {"".join(f'<rect x="{x}" y="172" width="42" height="30" rx="2" fill="#8FA6C4"/>' for x in (78, 136, 310, 362))}
  <rect x="200" y="168" width="86" height="62" fill="#4E4470"/>
  <rect x="206" y="172" width="74" height="58" fill="#B7C8DE"/>
  <rect x="240" y="172" width="4" height="58" fill="#4E4470"/>
</g>
<g fill="#C6483F"><rect x="330" y="118" width="42" height="12" rx="3"/><rect x="345" y="103" width="12" height="42" rx="3"/></g>
<rect y="230" width="480" height="90" fill="#B2AEC4"/>
<rect y="230" width="480" height="9" fill="#9E9AB4"/>
<rect y="266" width="480" height="4" fill="#A6A2BA" opacity=".7"/>
''' + crowd([(230, .82, "#3B3556", ".5", "mid", [154, 176]),
             (296, 1.15, "#242041", ".72", "near", [72, 402])]), d)

# --------------------------------------------------------------- 6 library
d = '''<linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A6E4B"/><stop offset="1" stop-color="#5F4A31"/></linearGradient>
<radialGradient id="lamp" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE0A8" stop-opacity=".85"/><stop offset="1" stop-color="#FFE0A8" stop-opacity="0"/></radialGradient>'''
write("library.svg", f'''

<rect width="480" height="320" fill="#42341F"/>
<rect width="480" height="320" fill="#4A3A24"/>
<g filter="url(#far)" opacity=".85">
  <rect x="150" y="20" width="180" height="150" rx="3" fill="#C9B98F" opacity=".5"/>
  <rect x="150" y="20" width="180" height="150" rx="3" fill="url(#lamp)"/>
</g>
<g filter="url(#mid)">
  <rect x="0" y="10" width="140" height="270" fill="url(#wood)"/>
  <rect x="340" y="10" width="140" height="270" fill="url(#wood)"/>
  {"".join(f'<rect x="{bx}" y="{y}" width="128" height="8" fill="#3A2C1B"/>' for bx in (6, 346) for y in (58, 110, 162, 214))}
  {"".join(f'<rect x="{bx + i*9}" y="{y-30}" width="7" height="30" rx="1" fill="{["#A8794C","#8E5F3C","#B98C58","#6F4E33","#C2A06A"][i%5]}"/>' for bx in (10, 350) for y in (58,110,162,214) for i in range(13))}
</g>
<ellipse cx="240" cy="150" rx="170" ry="120" fill="url(#lamp)" opacity=".55"/>
<rect x="150" y="196" width="180" height="14" rx="3" fill="#6B5334"/>
<rect x="150" y="196" width="180" height="5" rx="2" fill="#8A6E4B"/>
<g filter="url(#near)" opacity=".95">
  <rect x="96" y="248" width="288" height="72" rx="4" fill="#4A3A24"/>
  <rect x="96" y="248" width="288" height="8" rx="3" fill="#6B5334"/>
  <g transform="rotate(-4 200 262)"><rect x="150" y="238" width="86" height="60" rx="2" fill="#EFE6D2"/><rect x="150" y="238" width="86" height="60" rx="2" fill="#000" opacity=".05"/>
  {"".join(f'<rect x="158" y="{y}" width="{w}" height="3" rx="1.5" fill="#B9AC93"/>' for y,w in ((250,68),(258,68),(266,52),(276,68),(284,40)))}</g>
  <ellipse cx="300" cy="270" rx="26" ry="9" fill="#2E2416" opacity=".5"/>
</g>''', d, ("#FFD08A", "#1A1206", ".22"))

# ---------------------------------------------------------------- 7 chart
d = '''<linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFDF8"/><stop offset="1" stop-color="#EDE7DA"/></linearGradient>
<linearGradient id="barg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C2603A"/><stop offset="1" stop-color="#9A4526"/></linearGradient>
<linearGradient id="barq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9C0AC"/><stop offset="1" stop-color="#ABA189"/></linearGradient>'''
write("chart.svg", f'''
<rect width="480" height="320" fill="#8E8267"/>
<g filter="url(#far)" opacity=".5"><rect x="-20" y="-10" width="240" height="340" fill="#7C7156"/></g>
<g transform="rotate(-1.6 240 160)">
  <rect x="52" y="24" width="376" height="276" rx="3" fill="#6B6047" opacity=".35" transform="translate(6 9)"/>
  <rect x="52" y="24" width="376" height="276" rx="3" fill="url(#paper)"/>
  <rect x="84" y="52" width="150" height="10" rx="4" fill="#B5A98E"/>
  <rect x="84" y="70" width="96" height="6" rx="3" fill="#D2C9B4"/>
  {"".join(f'<rect x="84" y="{y}" width="316" height="1.2" fill="#E2DACA"/>' for y in (112, 146, 180, 214, 248))}
  {"".join(f'<rect x="{x}" y="{248-h}" width="34" height="{h}" rx="1" fill="url(#{g})"/>' for x,h,g in ((96,26,"barq"),(148,32,"barq"),(200,38,"barq"),(252,52,"barq"),(304,84,"barg"),(356,124,"barg")))}
  <rect x="84" y="248" width="316" height="2.4" fill="#A89C82"/>
  <rect x="84" y="108" width="2.4" height="142" fill="#A89C82"/>
  <rect x="84" y="266" width="46" height="6" rx="3" fill="#D2C9B4"/>
  <rect x="354" y="266" width="46" height="6" rx="3" fill="#D2C9B4"/>
  <rect x="286" y="278" width="114" height="6" rx="3" fill="#E0D8C6"/>
</g>
<g filter="url(#near)" opacity=".75"><rect x="0" y="286" width="480" height="34" fill="#5F553F"/></g>''',
d, ("#FFE7BE", "#3A3020", ".18"))

# ------------------------------------------------------------- 8 gathering
d, s = sky("#3E4C6B", "#8A7E92", "#D8A57A", 300, 78, "#FFC27A", ".8")
write("gathering.svg", s + f'''
<g filter="url(#far)" opacity=".72">
  <rect x="0" y="96" width="140" height="150" fill="#4A5470"/>
  <rect x="150" y="70" width="180" height="176" fill="#525C78"/>
  <rect x="340" y="88" width="140" height="158" fill="#4A5470"/>
  {"".join(f'<rect x="{x}" y="{y}" width="16" height="20" fill="#F2C98E" opacity=".55"/>' for x in (20,52,84,170,202,234,266,298,360,392,424) for y in (110,146,182))}
</g>
<g filter="url(#mid)" opacity=".9">
  <rect x="176" y="150" width="128" height="96" fill="#3E4760"/>
  <rect x="176" y="150" width="128" height="9" fill="#4E5876"/>
</g>
''' + crowd([
  (250, .72, "#2B3145", ".72", "mid",
   [14, 36, 58, 80, 104, 128, 152, 176, 200, 226, 250, 274, 300, 326, 350, 374, 398, 422, 446, 468]),
  (282, .95, "#1E2233", ".85", None,
   [4, 34, 64, 96, 128, 162, 196, 230, 264, 298, 332, 366, 400, 434, 468]),
  (320, 1.35, "#12151F", ".93", None, [24, 92, 164, 240, 316, 392, 458]),
]) + '''
<g opacity=".95">
  <g transform="rotate(-7 120 190)"><rect x="82" y="152" width="78" height="52" rx="2" fill="#EFE7D6"/><rect x="86" y="156" width="70" height="44" rx="1" fill="#E2D8C2"/>
  <rect x="94" y="166" width="54" height="6" rx="3" fill="#8A7F6B"/><rect x="94" y="178" width="42" height="6" rx="3" fill="#8A7F6B"/><rect x="94" y="190" width="48" height="5" rx="2.5" fill="#A79B85"/>
  <rect x="118" y="204" width="5" height="42" fill="#7A6A52"/></g>
  <g transform="rotate(5 330 178)"><rect x="292" y="140" width="86" height="56" rx="2" fill="#F4EDDD"/><rect x="296" y="144" width="78" height="48" rx="1" fill="#E8DFC9"/>
  <rect x="304" y="154" width="62" height="7" rx="3.5" fill="#7E7360"/><rect x="304" y="168" width="46" height="7" rx="3.5" fill="#7E7360"/><rect x="304" y="182" width="56" height="5" rx="2.5" fill="#A79B85"/>
  <rect x="332" y="196" width="5" height="50" fill="#7A6A52"/></g>
  <g transform="rotate(-3 226 156)"><rect x="196" y="118" width="62" height="44" rx="2" fill="#E9E0CC"/>
  <rect x="204" y="130" width="44" height="6" rx="3" fill="#8A7F6B"/><rect x="204" y="142" width="32" height="6" rx="3" fill="#8A7F6B"/>
  <rect x="224" y="162" width="4" height="88" fill="#7A6A52"/></g>
</g>
<g filter="url(#soft)" opacity=".3"><ellipse cx="300" cy="86" rx="130" ry="60" fill="#FFC27A"/></g>''',
d, ("#FFB877", "#151A2A", ".24"))

# -------------------------------------------------------------- 9 document
d = '''<linearGradient id="sheet" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFEFA"/><stop offset=".6" stop-color="#F4EFE4"/><stop offset="1" stop-color="#DED7C7"/></linearGradient>
<radialGradient id="desklight" cx="42%" cy="30%" r="62%"><stop offset="0" stop-color="#FFF3D8" stop-opacity=".9"/><stop offset="1" stop-color="#FFF3D8" stop-opacity="0"/></radialGradient>'''
write("document.svg", f'''
<rect width="480" height="320" fill="#4A4438"/>
<rect width="480" height="320" fill="url(#desklight)"/>
<g filter="url(#far)" opacity=".6"><rect x="330" y="0" width="150" height="320" fill="#3B362C"/></g>
<g transform="rotate(6 250 170)" opacity=".85" filter="url(#mid)">
  <rect x="150" y="52" width="200" height="252" rx="2" fill="#2E2A22" opacity=".35" transform="translate(8 10)"/>
  <rect x="150" y="52" width="200" height="252" rx="2" fill="#E8E1D2"/>
</g>
<g transform="rotate(-3.5 230 160)">
  <rect x="92" y="30" width="252" height="266" rx="2" fill="#2A261F" opacity=".42" transform="translate(10 13)"/>
  <rect x="92" y="30" width="252" height="266" rx="2" fill="url(#sheet)"/>
  <rect x="120" y="58" width="118" height="11" rx="4" fill="#A99C80"/>
  <rect x="120" y="78" width="168" height="6" rx="3" fill="#CEC4AE"/>
  <rect x="120" y="94" width="86" height="6" rx="3" fill="#DAD1BD"/>
  {"".join(f'<rect x="120" y="{y}" width="{w}" height="5" rx="2.5" fill="#D6CCB7"/>' for y,w in ((122,196),(134,196),(146,164),(176,196),(188,182),(200,196),(212,128),(248,196),(260,104)))}
  <rect x="120" y="158" width="112" height="11" rx="1" fill="#26221A" opacity=".82"/>
  <rect x="176" y="224" width="82" height="11" rx="1" fill="#26221A" opacity=".82"/>
  <rect x="252" y="248" width="60" height="34" rx="2" fill="#B94A3A" opacity=".18"/>
  <rect x="252" y="248" width="60" height="34" rx="2" fill="none" stroke="#B94A3A" stroke-width="2.5" opacity=".55"/>
</g>
<g filter="url(#near)" opacity=".7"><rect x="0" y="292" width="480" height="28" fill="#332F27"/></g>''',
d, ("#FFE9BE", "#2A2318", ".2"))

# ------------------------------------------------------------ 10 roadworks
d, s = sky("#6C86A8", "#AEBCCB", "#D7D3C6", 400, 50, "#FFDCA6", ".7")
write("roadworks.svg", s + f'''
<g filter="url(#far)" opacity=".7">
  <rect x="0" y="118" width="130" height="112" fill="#93A0AE"/>
  <rect x="352" y="104" width="128" height="126" fill="#93A0AE"/>
  <rect x="150" y="134" width="170" height="96" fill="#9DAAB6"/>
</g>
<g filter="url(#mid)">
  <rect x="46" y="60" width="12" height="170" fill="#8C97A3"/>
  <rect x="40" y="48" width="24" height="14" rx="2" fill="#6F7A86"/>
  <path d="M52 60 L232 30" stroke="#8C97A3" stroke-width="4"/>
  <rect x="222" y="22" width="34" height="16" rx="2" fill="#6F7A86"/>
  <rect x="236" y="38" width="4" height="40" fill="#8C97A3"/>
  <rect x="206" y="76" width="64" height="42" rx="3" fill="#C08A3E"/>
  <rect x="206" y="76" width="64" height="10" rx="3" fill="#D9A45C"/>
</g>
<rect y="230" width="480" height="90" fill="#7E7B74"/>
<rect y="230" width="480" height="9" fill="#6C6962"/>
{"".join(f'<rect x="{x}" y="272" width="42" height="7" rx="3" fill="#E8E3D4" opacity=".65"/>' for x in range(12, 480, 78))}
<g>
  <rect x="150" y="238" width="180" height="58" rx="4" fill="#565249"/>
  <rect x="158" y="246" width="164" height="42" rx="3" fill="#413E37"/>
  <rect x="158" y="246" width="164" height="8" rx="3" fill="#605C52"/>
</g>
{"".join(f'<g><rect x="{x}" y="196" width="13" height="52" fill="#D8D2C2"/><rect x="{x-20}" y="176" width="53" height="22" rx="3" fill="#C8722E"/><rect x="{x-20}" y="176" width="53" height="10" rx="3" fill="#E09148"/><rect x="{x-20}" y="192" width="53" height="6" fill="#F0EAD8"/></g>' for x in (72, 396))}
<g filter="url(#near)" opacity=".9">
  <rect x="0" y="288" width="480" height="32" fill="#3E3B34"/>
  {"".join(f'<rect x="{x}" y="282" width="56" height="10" rx="4" fill="#C8722E"/>' for x in range(-10, 480, 92))}
</g>''' + crowd([(230, .78, "#3A3730", ".55", "mid", [122, 142])]),
d, ("#FFCE8A", "#191712", ".26"))

print("wrote", len(os.listdir(OUT)), "scenes")
