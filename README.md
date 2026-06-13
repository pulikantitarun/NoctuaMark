# NoctuaMark

**PixInsight Astrophotography Watermark & Annotation Tool**

Created by **Tarun Pulikanti** — [@hyderabadiastro](https://github.com/pulikantitarun)

NoctuaMark is an automation script for PixInsight designed to streamline the process of watermarking, signing, and annotating your deep-sky images before sharing them online.

---

## Features

- **Signature** — Add your name, handles, and copyright year with custom fonts, colours, and proportional sizing.
- **FITS / XISF Metadata** — Automatically extracts target object, integration date, telescope, camera, filters, and exposure settings into an editable paragraph.
- **Description / Caption** — Write a free-form, multi-line custom text block directly on your image.
- **PNG Logo Integration** — Drag-and-drop support for your personal logo with full transparency layers.
- **Draggable Elements** — Every single text or graphic layer can be individually dragged to reposition on-screen.
- **Live Interactive Preview** — Real-time preview window supporting zooming (Scroll Wheel) and panning (Middle-Click + Drag).
- **Smart Font Scaling** — Text sizes dynamically scale as a percentage of the overall image width, ensuring sharpness at any resolution.
- **Collapsible Panels** — Clean user interface layouts that stay out of your way until you need them.
- **Persistent Settings** — All your custom preferences, handles, and layout presets automatically persist between sessions.

---

## Installation (Automated Updates)

Adding NoctuaMark as an official update repository ensures you receive automatic enhancements and feature updates directly inside PixInsight.

1. Launch **PixInsight**.
2. From the top menu, go to **Resources** ➔ **Updates** ➔ **Manage Repositories**.
3. Click the **Add** button.
4. Paste the following URL exactly as shown (ensure you include the trailing slash):
   ```text
   https://githubusercontent.com
   ```
5. Click **OK**, then click **OK** again to close the repository manager.
6. Navigate to **Resources** ➔ **Updates** ➔ **Check for Updates**.
7. PixInsight will find the `NoctuaMark Utility Script`. Click **Apply**, then close PixInsight to allow the system updater daemon to install the files.
8. Relaunch PixInsight. Your tool is now ready to use under **Script** ➔ **Utilities** ➔ **NoctuaMark**.

- **Tip:** Right-click the menu entry inside PixInsight and choose **Add to Toolbar** for one-click utility access in the future.

---

## How to Use

| Control / Input               | Action Triggered                                                                                    |
| :---------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Scroll wheel on preview**   | Zoom in / out of your image                                                                         |
| **Middle-click + drag**       | Pan across your image when zoomed in                                                                |
| **Left-click + drag element** | Move any text, signature, or logo block across the canvas                                           |
| **Triangle section headers**  | Expand or collapse user interface utility panels                                                    |
| **`+ Add Annotation` button** | Click the button, then click the preview canvas twice to draw an arrow pointing to a cosmic feature |

---

## Credits & Community

- **Developer:** Tarun Pulikanti
- **Instagram / Astrobin:** [@hyderabadiastro](https://instagram.com)
- **GitHub Repository:** [pulikantitarun/NoctuaMark](https://github.com/pulikantitarun/NoctuaMark)

---

## License

This project is licensed under the **MIT License** — completely free to use, share, and modify, provided credit is maintained to the original author.
