"""Builds the 5-slide IEEE Metaverse Grand Challenge deck.

Design follows the app's own visual system (SPEC.md §3) rather than a generic
template: the three phase palettes are the deck's palette, labels are wide
uppercase, and the type is editorial serif + plain sans. One idea per slide,
left-aligned, lots of air.
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import copy

OUT = "/Users/vishalkalra/Documents/Github/the-misinformation-lab/docs/The-Misinformation-Lab-IEEE-2026.pptx"

# --- palette, straight from SPEC.md §3 -------------------------------------
INK_DARK   = RGBColor(0x0B, 0x0B, 0x0F)
PAPER      = RGBColor(0xFF, 0xFF, 0xFF)
P1_BG, P1_INK, P1_MUTE, P1_LINE, P1_ACT = (
    RGBColor(0xFB,0xFB,0xFD), RGBColor(0x16,0x18,0x1C), RGBColor(0x65,0x68,0x6D),
    RGBColor(0xE4,0xE6,0xEB), RGBColor(0x1D,0x6F,0xF2))
P2_BG, P2_INK, P2_MUTE, P2_LINE, P2_ACT = (
    RGBColor(0xF1,0xEF,0xF8), RGBColor(0x24,0x1A,0x47), RGBColor(0x6F,0x67,0x91),
    RGBColor(0xE3,0xDF,0xF2), RGBColor(0x4B,0x32,0xA8))
P3_INK, P3_MUTE, P3_LINE, MARK = (
    RGBColor(0x11,0x11,0x11), RGBColor(0x7A,0x7A,0x7A),
    RGBColor(0xE6,0xE6,0xE6), RGBColor(0xB4,0x52,0x2A))
GO = RGBColor(0x0F,0x9D,0x58)
PALE_INK   = RGBColor(0xE9,0xE9,0xEE)
PALE_MUTE  = RGBColor(0x8B,0x8B,0x96)

SERIF = "Georgia"
SANS  = "Arial"

prs = Presentation()
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]
W, H = 13.333, 7.5


def slide(bg=PAPER):
    s = prs.slides.add_slide(BLANK)
    bgfill = s.background.fill
    bgfill.solid()
    bgfill.fore_color.rgb = bg
    return s


def tb(s, x, y, w, h, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP):
    box = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    tf.paragraphs[0].alignment = align
    return tf


def para(tf, text, size, color, font=SANS, bold=False, italic=False,
         space_before=0, space_after=0, line=None, tracking=None, first=False,
         caps=False):
    p = tf.paragraphs[0] if first else tf.add_paragraph()
    p.space_before = Pt(space_before)
    p.space_after = Pt(space_after)
    if line:
        p.line_spacing = line
    r = p.add_run()
    r.text = text.upper() if caps else text
    f = r.font
    f.name = font
    f.size = Pt(size)
    f.bold = bold
    f.italic = italic
    f.color.rgb = color
    if tracking:  # letter-spacing, hundredths of a point — what makes labels read as designed
        r.font._rPr.set("spc", str(int(tracking * 100)))
    return p


def kicker(s, text, color, x=0.9, y=0.62, w=11.5):
    tf = tb(s, x, y, w, 0.3)
    para(tf, text, 10, color, SANS, bold=True, tracking=2.2, caps=True, first=True)


def rule(s, x, y, w, color, thick=0.75):
    ln = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Pt(thick))
    ln.fill.solid(); ln.fill.fore_color.rgb = color
    ln.line.fill.background(); ln.shadow.inherit = False
    return ln


def block(s, x, y, w, h, fill, line=None):
    b = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    b.fill.solid(); b.fill.fore_color.rgb = fill
    if line:
        b.line.color.rgb = line; b.line.width = Pt(0.75)
    else:
        b.line.fill.background()
    b.shadow.inherit = False
    return b


def notes(s, text):
    s.notes_slide.notes_text_frame.text = text


# =============================================================================
# SLIDE 1 — the problem, and the turn
# =============================================================================
s1 = slide(INK_DARK)
kicker(s1, "Theme 3  ·  Advanced learning in educational or classroom environments", PALE_MUTE)

tf = tb(s1, 0.9, 1.25, 8.6, 2.6)
para(tf, "Teenagers already know", 40, PALE_INK, SERIF, line=1.08, first=True)
para(tf, "misinformation exists.", 40, PALE_INK, SERIF, line=1.08)
para(tf, "It fools them anyway.", 40, RGBColor(0xC9,0xC2,0xE8), SERIF, italic=True, line=1.08)

tf = tb(s1, 0.9, 4.15, 6.5, 1.5)
para(tf, "Media literacy is taught as knowledge — spot the red flags, check the "
         "source. But recognition was never the failure point. Speed is. A student "
         "who can define misinformation in a classroom still reshares it in four "
         "seconds on a phone.", 14, PALE_MUTE, SANS, line=1.55, first=True)

# two evidence cards
for i, (num, cap) in enumerate([
    ("11%", "of 11–17s can reliably tell a real news story from a fake one"),
    ("#1", "short-term global risk, ahead of extreme weather and conflict"),
]):
    x = 8.05 + i * 2.35
    block(s1, x, 1.35, 2.05, 1.9, RGBColor(0x16,0x16,0x1C))
    tf = tb(s1, x + 0.28, 1.6, 1.6, 0.7)
    para(tf, num, 34, PALE_INK, SERIF, first=True)
    tf = tb(s1, x + 0.28, 2.32, 1.55, 1.0)
    para(tf, cap, 9, PALE_MUTE, SANS, line=1.35, first=True)

tf = tb(s1, 8.05, 3.45, 4.4, 0.4)
para(tf, "Ofcom / National Literacy Trust  ·  WEF Global Risks Report", 8, RGBColor(0x5A,0x5A,0x64), SANS, first=True)

rule(s1, 8.05, 4.35, 4.4, RGBColor(0x2A,0x2A,0x33))
tf = tb(s1, 8.05, 4.6, 4.4, 1.6)
para(tf, "So we stopped teaching students about manipulation", 15, PALE_INK, SERIF, line=1.3, first=True)
para(tf, "and started making them perform it.", 15, RGBColor(0xC9,0xC2,0xE8), SERIF, italic=True, line=1.3)

tf = tb(s1, 0.9, 6.72, 11.5, 0.35)
para(tf, "The Misinformation Lab  ·  IEEE Metaverse Grand Challenge 2026", 9,
     RGBColor(0x5A,0x5A,0x64), SANS, tracking=1.4, caps=True, first=True)

notes(s1, "Open here. The point of this slide is that the problem is not ignorance, it is "
          "speed and reflex. Every media-literacy tool teaches recognition; recognition is "
          "already there and it still fails. That is what justifies role reversal instead of "
          "another explainer. Verify both cited figures against your sources before submitting.")

# =============================================================================
# SLIDE 2 — implementation design: three phases, three kinds of software
# =============================================================================
s2 = slide(PAPER)
kicker(s2, "Implementation design", P3_MUTE)

tf = tb(s2, 0.9, 1.05, 9.5, 0.7)
para(tf, "Three phases. Three different kinds of software.", 30, P3_INK, SERIF, first=True)

cols = [
    ("01", "Detect", P1_BG, P1_INK, P1_MUTE, P1_ACT,
     "An ordinary social feed.",
     "Five posts, three fabricated. Swipe, click, or arrow-key. Every decision is "
     "timed to the millisecond, and opening the verification tools costs visible "
     "time — the same trade a real reader makes.\n\n"
     "This round is a fixed baseline: identical for every student, so one score is "
     "comparable to another."),
    ("02", "Campaign", P2_BG, P2_INK, P2_MUTE, P2_ACT,
     "A cheerful advertising dashboard.",
     "Choose an audience and an emotional hook. An AI strategist drafts the headline. "
     "Drag credibility signals — a verified tick, a named source, engagement numbers — "
     "onto your own fake.\n\n"
     "Then watch it spread, with the arithmetic shown in full: 2,400 followers × match% × credibility% × 8 reshares each."),
    ("03", "Reveal", RGBColor(0xFA,0xFA,0xFA), P3_INK, P3_MUTE, MARK,
     "A printed report. No interface.",
     "Seven sequenced beats. Your accuracy before and after. Your decision speed on the "
     "ones you got wrong. Every instruction you gave the AI, quoted back.\n\n"
     "It ends by naming your specific vulnerability and one habit that counters it."),
]

for i, (num, name, bg, ink, mute, act, lede, body) in enumerate(cols):
    x = 0.9 + i * 3.95
    block(s2, x, 1.95, 3.6, 4.35, bg)
    rule(s2, x, 1.95, 3.6, act, thick=3)
    tf = tb(s2, x + 0.32, 2.28, 3.0, 0.35)
    para(tf, num, 10, act, SANS, bold=True, tracking=2.0, first=True)
    tf = tb(s2, x + 0.32, 2.62, 3.0, 0.45)
    para(tf, name, 21, ink, SERIF, first=True)
    tf = tb(s2, x + 0.32, 3.15, 3.0, 0.5)
    para(tf, lede, 11.5, ink, SANS, bold=True, line=1.3, first=True)
    tf = tb(s2, x + 0.32, 3.78, 3.0, 2.3)
    para(tf, body, 10, mute, SANS, line=1.45, first=True)

tf = tb(s2, 0.9, 6.55, 11.5, 0.7)
para(tf, "The visual language changes because the lesson does. Phase 1 has to be dull "
         "enough to actually fool you. Phase 2 is deliberately friendly — real influence "
         "operations run on cheerful ad tools, not hacker terminals. Phase 3 removes the "
         "interface entirely, because it is a verdict rather than an app screen.",
     11, P3_MUTE, SANS, line=1.5, first=True)

notes(s2, "Walk left to right. The one thing to say out loud: the three phases deliberately "
          "look like three different products. That is a teaching decision, not a styling "
          "accident — the feed must be boring enough to fool them, and the campaign desk must "
          "feel legitimate, because that is what the real tools feel like.")

# =============================================================================
# SLIDE 3 — the AI layer
# =============================================================================
s3 = slide(P2_BG)
kicker(s3, "The AI layer  ·  a strategist that incriminates itself", P2_MUTE)

tf = tb(s3, 0.9, 1.05, 10.5, 0.7)
para(tf, "The AI names its own manipulation. Every time.", 30, P2_INK, SERIF, first=True)

tf = tb(s3, 0.9, 1.78, 6.3, 0.5)
para(tf, "It has three jobs: draft the headline, rewrite it on demand, and state the "
         "tactic it just used. The third one is not optional.", 12, P2_MUTE, SANS, line=1.5, first=True)

# transcript
block(s3, 0.9, 2.55, 6.3, 3.75, PAPER, P2_LINE)
ty = 2.85
exchanges = [
    ("You", "Add numbers", None),
    ("Vale", "“Reported symptoms up 400% since the treatment change.”",
     "A percentage without a baseline is the cheapest number available. "
     "400% here is nine cases. Nobody will ask for the ninth."),
    ("You", "Write this about a real politician", None),
    ("Vale", "“I don’t work outside Riverton. Name a real person or "
             "organisation and I stop.”",
     "That isn’t caution — it’s the boundary this desk operates inside."),
]
for who, line, why in exchanges:
    is_v = who == "Vale"
    tf = tb(s3, 1.2, ty, 0.7, 0.25)
    para(tf, who, 8.5, P2_ACT if is_v else P2_MUTE, SANS, bold=True, tracking=1.6, caps=True, first=True)
    tf = tb(s3, 1.95, ty - 0.03, 5.0, 0.5)
    para(tf, line, 12 if is_v else 11.5, P2_INK if is_v else P2_MUTE, SANS,
         bold=is_v, line=1.35, first=True)
    ty += 0.30 + (0.22 * (len(line) // 58))
    if why:
        tf = tb(s3, 1.95, ty + 0.04, 5.0, 0.6)
        para(tf, why, 9.5, P2_MUTE, SANS, italic=True, line=1.4, first=True)
        ty += 0.34 + (0.19 * (len(why) // 62))
    ty += 0.20

# right column — what the transcript becomes
block(s3, 7.55, 2.55, 4.9, 3.75, PAPER, P2_LINE)
tf = tb(s3, 7.9, 2.85, 4.2, 0.3)
para(tf, "And then it is used as evidence", 9, P2_ACT, SANS, bold=True, tracking=1.8, caps=True, first=True)
tf = tb(s3, 7.9, 3.3, 4.2, 1.5)
para(tf, "Every accepted request is logged. In Phase 3 the student reads their own "
         "transcript back:", 11, P2_MUTE, SANS, line=1.5, first=True)
tf = tb(s3, 7.9, 4.1, 4.2, 0.9)
para(tf, "“You asked Vale to make it scarier. Twice.”", 17, P2_INK, SERIF, italic=True, line=1.25, first=True)
rule(s3, 7.9, 5.15, 4.2, P2_LINE)
tf = tb(s3, 7.9, 5.4, 4.2, 0.8)
para(tf, "That is what makes the chat structural rather than decorative. The student is "
         "not told that manipulation is easy — they are shown their own four-word "
         "instruction that made it happen.", 10, P2_MUTE, SANS, line=1.45, first=True)

tf = tb(s3, 0.9, 6.6, 11.5, 0.5)
para(tf, "Rule-based and fully deterministic by design: eleven rewrite intents, each "
         "paired with the tactic it demonstrates, plus a hard refusal boundary. The layer "
         "sits behind a single function, so a live model can be swapped in without "
         "touching a component — and without ever loosening the constraints.",
     10.5, P2_MUTE, SANS, line=1.5, first=True)

notes(s3, "This is the AI-integration slide and also half the ethics slide. Emphasise that the "
          "refusal is demonstrated live in the video, not claimed here. The determinism is a "
          "feature for a classroom: the same prompt teaches the same lesson to every student, "
          "and nothing can drift into something unsafe.")

# =============================================================================
# SLIDE 4 — measured outcome  (numbers left blank on purpose)
# =============================================================================
s4 = slide(PAPER)
kicker(s4, "Measured outcome", P3_MUTE)

tf = tb(s4, 0.9, 1.05, 10.0, 0.7)
para(tf, "Detection accuracy, before and after.", 30, P3_INK, SERIF, first=True)

tf = tb(s4, 0.9, 1.75, 7.4, 0.5)
para(tf, "Every participant is measured twice by the app itself — no self-report, no "
         "questionnaire. The gain is computed per student and exported as a file.",
     12, P3_MUTE, SANS, line=1.5, first=True)

stats = [("Before", "Round one", P3_MUTE), ("After", "Round two", P3_MUTE), ("Change", "Points gained", MARK)]
for i, (label, sub, col) in enumerate(stats):
    x = 0.9 + i * 2.6
    tf = tb(s4, x, 2.62, 2.3, 0.28)
    para(tf, label, 9, col, SANS, bold=True, tracking=1.8, caps=True, first=True)
    tf = tb(s4, x, 2.95, 2.3, 1.15)
    para(tf, "—", 54, col if i == 2 else P3_INK, SERIF, first=True)
    tf = tb(s4, x, 4.05, 2.3, 0.3)
    para(tf, sub, 9.5, P3_MUTE, SANS, first=True)
rule(s4, 0.9, 4.45, 7.4, P3_LINE)

tf = tb(s4, 0.9, 4.68, 7.4, 0.9)
para(tf, "Decision time on the posts they got wrong: —s.   On the ones they got right: —s.", 12, P3_INK, SANS, line=1.45, first=True)
para(tf, "Students are not fooled because they cannot tell. They are fooled because they "
         "do not stop.", 11, P3_MUTE, SANS, italic=True, line=1.45, space_before=6)

# method box — the credibility of the number lives here
block(s4, 8.75, 2.55, 3.7, 3.5, RGBColor(0xFA,0xFA,0xFA), P3_LINE)
tf = tb(s4, 9.05, 2.82, 3.1, 0.3)
para(tf, "Method", 9, P3_INK, SANS, bold=True, tracking=1.8, caps=True, first=True)
tf = tb(s4, 9.05, 3.22, 3.1, 2.6)
for line in [
    "— students aged 14–18.",
    "Round one is a fixed five-post baseline, identical for every participant.",
    "Round two uses the same four manipulation tactics with different towns, names and claims — so the gain measures tactic recognition, not recall.",
    "Every round is three fabricated posts and two genuine ones. The genuine posts are where false-positive data comes from.",
    "Decision times captured in milliseconds. One JSON record exported per participant.",
]:
    para(tf, line, 9, P3_MUTE, SANS, line=1.42, space_after=7, first=(line.startswith("—")))

fill_tag = block(s4, 0.9, 6.35, 7.4, 0.62, RGBColor(0xFD,0xF2,0xEC), MARK)
tf = tb(s4, 1.15, 6.5, 7.0, 0.4)
para(tf, "FILL FROM THE TESTER RUN, THEN DELETE THIS BAR — the deck must not be "
         "submitted with placeholder dashes.", 9.5, MARK, SANS, bold=True, first=True)

notes(s4, "This is the slide that decides the competition. Every placing poster in 2025 led "
          "with a measured number.\n\n"
          "The three dashes and the two decision-time dashes must be replaced with real "
          "figures from the tester run, and the orange bar deleted. Do not submit this slide "
          "with placeholders in it.\n\n"
          "The method box is doing real work: a fixed baseline and a tactics-matched second "
          "round is what makes the gain a learning measurement rather than a memory test. Say "
          "that out loud in the video.")

# =============================================================================
# SLIDE 5 — access, ethics, technology
# =============================================================================
s5 = slide(PAPER)
kicker(s5, "Access  ·  ethics  ·  technology", P3_MUTE)

tf = tb(s5, 0.9, 1.05, 11.0, 0.75)
para(tf, "A sandbox that shows you exactly how easy the real thing is.", 28, P3_INK, SERIF, first=True)

panels = [
    ("Access", P1_ACT, [
        ("Any browser.", "No headset, no install, no account, no login, no personal data collected."),
        ("88 KB of code, gzipped.", "Plus ~1.5 MB of photography. The whole thing is static files — it loads on a school Chromebook over school wi-fi."),
        ("Keyboard-complete.", "Every screen, including the final reveal. Live-region announcements for screen readers, and reduced-motion honoured throughout."),
    ]),
    ("Ethics", MARK, [
        ("Everything is fictional.", "Invented towns, outlets and people. Riverton and Eastvale do not exist, and no claim made here refers to anything real."),
        ("The AI refuses.", "Name a real person, organisation or event and the strategist declines in character, stating why. It only ever works inside the scenario."),
        ("Nothing leaves the browser.", "No account, no server, no analytics. Images a student attaches are processed on their own device and never uploaded anywhere."),
    ]),
    ("Technology", P2_ACT, [
        ("Vite + React 19, Zustand.", "Entirely client-side. No backend, no database, session state in memory."),
        ("Pointer, canvas, timing.", "Swipe physics, a drag-and-drop composer and a canvas spread animation — the reasons this is a web app rather than a slide deck."),
        ("Real photography.", "Ten openly-licensed photographs, with hand-built SVG scenes as a fallback. A feed only fools you if it looks like a feed."),
    ]),
]
for i, (title, col, items) in enumerate(panels):
    x = 0.9 + i * 3.95
    rule(s5, x, 2.05, 3.6, col, thick=3)
    tf = tb(s5, x, 2.28, 3.4, 0.4)
    para(tf, title, 18, P3_INK, SERIF, first=True)
    # Fixed row positions rather than flowing by text length, so the three
    # columns' headings line up across the slide. Drifting baselines are the
    # single clearest tell of a generated layout.
    for (head, body), y in zip(items, (2.85, 3.78, 4.71)):
        tf = tb(s5, x, y, 3.5, 0.3)
        para(tf, head, 11, P3_INK, SANS, bold=True, line=1.3, first=True)
        tf = tb(s5, x, y + 0.28, 3.5, 0.85)
        para(tf, body, 9.5, P3_MUTE, SANS, line=1.45, first=True)

rule(s5, 0.9, 6.35, 11.5, P3_LINE)
tf = tb(s5, 0.9, 6.55, 11.5, 0.6)
para(tf, "Classroom-ready as it stands: a teacher opens a URL, a class of thirty runs it in "
         "ten minutes, and every student leaves with a named vulnerability and one habit "
         "that counters it.", 11.5, P3_INK, SANS, line=1.5, first=True)

notes(s5, "On ethics, be precise, because a judge may press on it. The app does let a student "
          "attach their own photo to a false headline — that is deliberate, because pairing a "
          "real image with a false claim is the most common real tactic there is, and doing it "
          "yourself teaches it faster than being told. What constrains it: the scenario is "
          "wholly fictional, the AI refuses every real name, and nothing ever leaves the "
          "student's own browser.\n\n"
          "Do not claim the app 'cannot produce a fake' — it can, and that is the point of a "
          "sandbox. Claim instead that it cannot be aimed at anything real.\n\n"
          "Land the last line: a teacher opens a URL and a class runs it in ten minutes.")

prs.save(OUT)
print("saved:", OUT)
print("slides:", len(prs.slides.__iter__.__self__._sldIdLst))
