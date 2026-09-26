/* =====================================================================
   YOUR STUFF GOES HERE — this is the only file you need to edit.
   ---------------------------------------------------------------------
   Add an entry: copy one { ... } block in ENTRIES, change it, save.

   drawer : which drawer it goes in (must match an id in CABINETS)
   title  : shows on the folder tab
   date   : "YYYY-MM-DD" — newest sits at the top of the drawer
   media  : optional. A file in the files/ folder, e.g. "files/sketch.gif"
            images (jpg, png, gif, webp, svg) or video (mp4, webm)
            can also be a full https:// link
   text   : optional. Plain text, or simple HTML like <p>, <a>, <em>

   The cabinets and drawers are below. Each drawer id is also a folder
   on the site (drawings/ → yoursite.com/drawings). If you add a new
   drawer, copy one of the drawer folders and rename it to the new id.
   ===================================================================== */

const SITE_TITLE = "the cabinet";

const CABINETS = [
  { name: "making", drawers: [
      { id: "drawings",    label: "drawings" },
      { id: "electronics", label: "electronics" },
      { id: "animation",   label: "animation" } ] },
  { name: "consuming", drawers: [
      { id: "movies", label: "movies" },
      { id: "tv",     label: "tv shows" },
      { id: "food",   label: "food" } ] },
  { name: "wandering", drawers: [
      { id: "travels",  label: "travels" },
      { id: "thoughts", label: "thoughts" },
      { id: "logs",     label: "logs" } ] }
];

const ENTRIES = [
  { drawer: "drawings", title: "perspective cube", date: "2026-09-14", media: "files/cube.svg",
    text: `<p>Placeholder. Replace with your own drawing and notes.</p>` },
  { drawer: "drawings", title: "sketchbook 1", date: "2026-08-02",
    text: `<p>Placeholder entry with text only. No media, so the text shows in the frame.</p>` },
  { drawer: "drawings", title: "ink tests", date: "2026-07-19", media: "files/cube.svg" },
  { drawer: "drawings", title: "line weights", date: "2026-07-03", text: `<p>Placeholder.</p>` },
  { drawer: "drawings", title: "hands", date: "2026-06-11", text: `<p>Placeholder.</p>` },
  { drawer: "drawings", title: "chairs", date: "2026-06-02", text: `<p>Placeholder.</p>` },

  { drawer: "electronics", title: "macropad build", date: "2026-09-03", media: "files/circuit.svg",
    text: `<p>Placeholder build notes.</p>` },
  { drawer: "electronics", title: "dimmer lamp", date: "2026-07-11", text: `<p>Placeholder.</p>` },

  { drawer: "animation", title: "bouncing ball", date: "2026-08-21", media: "files/ball.gif",
    text: `<p>Placeholder. GIFs play right in the frame.</p>` },

  { drawer: "movies", title: "movie review", date: "2026-09-19", text: `<p>Placeholder review.</p>` },
  { drawer: "movies", title: "another movie", date: "2026-07-30", text: `<p>Placeholder review.</p>` },

  { drawer: "tv", title: "show review", date: "2026-08-28", text: `<p>Placeholder review.</p>` },

  { drawer: "food", title: "dumpling place", date: "2026-09-21", media: "files/bowl.svg",
    text: `<p>Placeholder review.</p>` },
  { drawer: "food", title: "focaccia attempt", date: "2026-09-06", text: `<p>Placeholder.</p>` },
  { drawer: "food", title: "taco truck", date: "2026-06-08", text: `<p>Placeholder.</p>` },

  { drawer: "travels", title: "coast trip", date: "2026-08-15", media: "files/map.svg",
    text: `<p>Placeholder trip notes.</p>` },

  { drawer: "thoughts", title: "on keeping things", date: "2026-09-24", text: `<p>Placeholder.</p>` },

  { drawer: "logs", title: "week 38", date: "2026-09-20", text: `<p>Placeholder.</p>` }
];
