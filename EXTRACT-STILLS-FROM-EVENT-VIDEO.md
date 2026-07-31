# Extracting speaking stills from event video

**Standalone brief. Paste this into a new chat and attach the video files.**
Written 31 July 2026 as part of the picture-first work on the SIA speaking pages.

---

## 1. What this is for

Two events on `syedirfanajmal.com/speaking` have **no usable photograph at all**:

| Event | Photo situation | Video source |
|---|---|---|
| **MaGIC, Cyberjaya, Malaysia (2016)** | Nothing in the gallery. Malaysia is missing from every photo strip on the site. | YouTube `50SIoLI-TW4` |
| **Durshal, Peshawar (2018)** | Only a 400x224, 7 second clip. Too small for any use. | YouTube `rRUS5dlJdc4` |

The job is to pull sharp frames from the full videos so both rooms can appear as
photographs. MaGIC matters most: it is the only Southeast Asian room on the
speaking record and nothing currently shows it.

## 2. Attach the video files. Yes, this is required.

**Download both videos at the highest quality available and attach them to the
chat.** A cloud session cannot fetch YouTube, so without the files nothing can be
done. Original camera files, if they exist, beat a YouTube re-download every time.

Attach whichever you have, in this order of preference:

1. Original recording files from the organiser or your own camera
2. Highest quality YouTube download (1080p if offered, else 720p)
3. Nothing else is worth the round trip. A 480p source will not produce a frame
   that survives being placed at card width.

**If both files together exceed the upload limit, do them one at a time.** One
good event beats two bad ones.

## 3. How to extract

Frames should be chosen, not sampled. The goal is a small number of good
photographs, not a contact sheet of every second.

**Step 1. Get the real resolution first.**

```
ffprobe -v error -show_entries stream=width,height,r_frame_rate,codec_name \
  -show_entries format=duration -of default=noprint_wrappers=1 INPUT.mp4
```

If the height is under 720, say so plainly and stop rather than producing soft
frames that will look bad on the site.

**Step 2. Pull candidates on scene changes, not on a fixed interval.**
Fixed-interval sampling lands mid-blink and mid-gesture. Scene detection lands on
shot boundaries, which is where the camera has settled.

```
ffmpeg -i INPUT.mp4 -vf "select='gt(scene,0.25)',showinfo" \
  -vsync vfr -q:v 2 cand_%03d.jpg
```

If that returns too few frames, lower the threshold to `0.15`. If it returns
hundreds, raise it to `0.4`.

**Step 3. Add a deliberate sweep of the wide shots.** Scene detection favours cuts;
a talk shot on one locked-off camera may produce almost none. Supplement with:

```
ffmpeg -i INPUT.mp4 -vf "fps=1/15" -q:v 2 sweep_%03d.jpg
```

**Step 4. Build a contact sheet and LOOK at it.** Do not pick frames by filename or
by any automated sharpness score alone. Assemble the candidates into a grid image
and actually view it, then shortlist by eye.

**Step 5. For each shortlisted frame, re-extract it losslessly at full quality** by
timestamp rather than keeping the batch JPEG:

```
ffmpeg -ss 00:03:21.400 -i INPUT.mp4 -frames:v 1 -q:v 1 out.jpg
```

## 4. What makes a frame usable

Take these in order. A frame failing any of the first three is not worth keeping.

1. **Eyes open, mouth not mid-syllable.** Video frames catch faces in states no
   photographer would ever release. This eliminates most candidates.
2. **Sharp.** Interlacing combs, compression blocking and motion blur all look far
   worse enlarged than they do in the frame grab. Deinterlace with `yadif` if you
   see combing.
3. **It proves the sentence it will sit next to.** Per the project's picture-first
   rules: a photograph beside a claim is evidence, and a decorative frame is not.
   A workshop shot must show a workshop.
4. **The audience is in frame at least as often as the speaker.** The crowd is the
   proof. Shots showing the backs of attendees' heads with him at the front are
   worth more than a tight portrait.
5. **Any visible event branding is a bonus worth hunting for.** A banner, a lectern
   sign or a title slide in frame lets the caption name the venue with the picture
   itself as the evidence. See the caption rule below.

**Target: 3 to 5 keepers per event.** Not more. A wall of stills from one room
proves one room.

## 5. Caption and accuracy rules, which are not optional

These come from the project's standing rules and bind harder on captions than on
prose, because a caption is a claim with a photograph vouching for it.

- **Name a venue only where it is verified.** Either branding is visible in the
  frame, or the event is corroborated by the Past Stages inventory on `/speaking`.
  MaGIC (Cyberjaya, 2016) and Durshal (KP, 2018) are both in that inventory, so
  both may be named. Do not add a city the inventory does not give.
- **No year unless it is verified.** The inventory has both; use those and nothing
  else.
- **Live audiences cap at 500.** No exceptions, ever.
- **No em dashes and no en dashes** in any caption or alt text. Use a middle dot or
  restructure the sentence.
- **Alt text describes what is actually in the frame**, not what the section is
  about.
- **Never state a headcount from a video frame.** You cannot count a room from one
  camera angle. If you cannot verify it, leave it out.

## 6. Where the output goes

Name files by venue, lowercase, hyphenated, no dates in the filename:

```
public/assets/gallery/magic-malaysia-1.jpg
public/assets/gallery/magic-malaysia-2.jpg
public/assets/gallery/durshal-peshawar-1.jpg
```

Save at quality 88, and **do not upscale**. If the source is 720p, the output is
720p. An upscaled frame looks worse than a smaller one placed honestly.

Then they can be wired into:

- **`RoomBand`** in `src/app/speaking/page.tsx` — the venue strip under the Past
  Stages table. Malaysia belongs here; it currently has no representation.
- **`FORMAT_PROOF`** in the same file — the proof thumbnails on the Available
  Formats cards. Both MaGIC and Durshal are workshops.
- **The Formats block** on both session pages, `src/app/speaking/earned-media-ai/`
  and its `travel/` subfolder.

Read `src/app/speaking/page.tsx` before wiring anything: the `RoomBand` and
`FORMAT_PROOF` comment blocks explain exactly which caption is allowed to say what,
and why some entries deliberately carry no venue or no year.

## 7. What not to do

- **Do not upscale, sharpen aggressively, or run an AI enhancer.** These invent
  detail. A photograph on a credibility page should not contain pixels that were
  never in the room.
- **Do not remove a watermark.** If a frame carries a photographer's or organiser's
  mark, crop above or beside it, or pick a different frame. Cropping is fair;
  erasing someone's credit to reuse their work is not. Credit the photographer in
  the caption where one is identifiable.
- **Do not use a title card or slide as a room photo.** A slide proves a deck, not
  an audience.
- **Do not caption a webinar or recorded session as a stage credit.** On-camera
  work is on-camera work; the site keeps these deliberately separate.
