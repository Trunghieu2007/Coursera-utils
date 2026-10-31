<div align="center">
  <img src="icons/icon128.png" width="80" height="80" alt="Coursera Helper Icon" />
  <h1>Coursera Helper</h1>
  <p>A browser extension that extracts questions from Coursera quizzes and assignments and copies them to the clipboard as structured JSON for study notes, revision, and review. It can also mark the videos, readings, discussions, practice items, labs and app items of a course as completed through Coursera's own API, one kind at a time or all at once.</p>

  <p>
    <a href="README.md"><b>English</b></a> | <a href="README.vi.md"><b>Tiếng Việt</b></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Manifest-V3-1f2937?style=flat-square" alt="Manifest V3" />
    <img src="https://img.shields.io/badge/Storage-Local%20Only-1f2937?style=flat-square" alt="Local Storage" />
    <img src="https://img.shields.io/badge/License-MIT-1f2937?style=flat-square" alt="MIT License" />
  </p>
</div>

---

## Overview

I developed this project to make working with Coursera question content more convenient and efficient, especially when preparing study notes and reviewing course materials.

By converting questions into structured text instead of relying on screenshots, the extension makes content easier to copy, organize, and reuse with a wide range of large language models (LLMs). Text-based input may also reduce token usage compared with image-based input, depending on the model and context.

## Preview

<div align="center">
  <table>
    <tr>
      <td align="center">
        <b>Light Mode</b><br/><br/>
        <img src="pics/Lightmode.png" alt="Light Mode" width="280" />
      </td>
      <td align="center">
        <b>Dark Mode</b><br/><br/>
        <img src="pics/Darkmode.png" alt="Dark Mode" width="280" />
      </td>
    </tr>
  </table>
</div>

---

## Features

- **Auto Copy:** Automatically copies questions to the clipboard when a supported assignment page loads.
- **Manual Copy:** Copies questions on demand through a button in the side panel.
- **Structured JSON:** Organizes questions, answer choices, and question types into clean, readable JSON.
- **Math and Diagrams:** Formulas are copied as their LaTeX source between `$` signs, and pictures are copied as markdown image links that point to the original file, so questions containing equations or figures are not lost. Links keep their address, and a table is copied as one line per row.
- **Code and Answers:** The code a question gives you is copied as a fenced block with its own language and its indentation kept, so a starter file survives the paste as runnable text. Code shown inside the question text is copied with it, and anything you have already typed into an answer box comes along too.
- **LLM-Friendly Workflow:** Makes extracted text easy to paste into different LLMs or personal note-taking tools, without requiring screenshots.
- **Bilingual Interface:** Supports English and Vietnamese across the side panel, including its dashboard and status line.
- **Appearance:** Follows the system theme or allows manual Light/Dark selection.
- **Side Panel:** The interface opens in Chrome's side panel on the right and stays open while you move through a course. Chrome 116 or later is required. Every notice is shown in the panel's status line; nothing is drawn on the page.
- **Skip Mode for Standalone Modules:** One setting that only the seven standalone skip modules follow. Sequential, the default, waits a little between items; Instantly sends the same one-at-a-time requests with no pause. Neither mode ever sends two requests at once. The two skip-all buttons carry their own pacing instead.
- **Auto Web Reload after Skip:** The second switch in General settings. With it on, the side panel reloads the active tab once after a run it followed has applied at least one mark, so the course page shows the new state without a manual refresh. It never reloads in the middle of a run, and it is off by default.
- **Auto Info Update:** The third switch, on by default. When you open, switch to or finish loading a Coursera tab, the side panel re-reads the account and the two progress cards, and if both progress cards still have nothing it reads once more after a short wait. It refreshes only the panel: it never reloads the extension or the page, and it waits while a skip run is following its items.
- **Account Card:** Shows the name, email and profile photo of the Coursera account signed in to the current tab, at the top of the side panel under a small "User information" label. The values come from the page's own start-up state, are shown only in the side panel and never stored or sent, and a photo is displayed only when its address is https. The card stays visible on every page with a Synced/Not synced pill; its eye button folds it down to its title, and the folded state is remembered.
- **Learning Progress:** Always shown in the side panel. On the Coursera home page it shows the average progress of every course in progress as one bar with its percentage, read from the page's own start-up cache, so nothing is requested, stored or sent. On a page that cannot feed it the bar stays empty and the percentage reads `N/A` under a "Not synced" pill.
- **Course Progress:** Always shown in the side panel. Inside a course the same card shows that course's name, how many of its items are complete, and one row per item type with the completed and total count under the label Coursera itself shows in the course outline, such as `Reading 10/13`, `Video 8/12` or `Lab 2/3`. The type rows sit under a "Lesson types" heading that can be collapsed from the card and starts open. The name comes from the page cache, while the item list and the progress list come from two read-only requests to Coursera. An item whose type the outline does not label falls back to the type name itself, so every item is listed and nothing is folded into a made-up bucket. Nothing is stored or written. On a page that cannot feed it the bar stays empty and the percentage reads `N/A` under a "Not synced" pill. Every dashboard card has its own eye button that folds it down to its title.
- **Graded App Check:** Counts the graded app items of the course you are on, the items Coursera labels "Graded App Item", and reports how many are complete. It only reads: nothing is submitted or marked, and no honor code or agreement box is ticked.
- **Skip Everything:** Marks every item of the course you are on that can be finished without a grade: lecture videos, readings, discussions, practice items, labs and ungraded app items. Two buttons in Quick actions start the same run, one at instant pacing and one at step-by-step pacing, so the pace is picked per run and the saved Skip mode is left alone. It starts with one scan of the course outline and of the course's progress list and reports how many items can be skipped and how many Coursera already reports as done, then runs the modules in that order and marks only the rest, one item at a time. Locked items are left alone, and graded work is never part of the run.
- **Standalone Skip Modules:** The seven individual skip buttons live under a "Standalone skip modules" heading that can be collapsed and starts open. Each module is one full-width button named after what it skips: Skip lecture videos, Skip readings, Skip discussions, Skip practice items, Skip labs, Skip ungraded labs, and the read-only Check graded app items. Every run reports its progress in the status line at the bottom of the side panel instead of changing the button label.
- **Lecture Video Completion:** Marks the lecture videos of the course you are on as completed. It scans the progress list of the course first and sends its playback events only for the lectures Coursera does not already report as done, one lecture at a time, reads Coursera's answer back before it counts a lecture as done, writes one direct completion record for a lecture whose events did not stick, and leaves a lecture the course has locked alone.
- **Reading Completion:** Marks the reading material of the course you are on as completed. It scans the progress list first and creates the same completion record the page creates when a reading is opened only for the readings not already done, one reading at a time, separates the readings it could confirm from the ones it only wrote, and leaves a locked reading alone.
- **Discussion Reply:** Posts one fixed reply sentence to the discussion prompts of the course you are on. The sentence follows the interface language and cannot be edited in the side panel. It reads the question behind each prompt, checks which prompts already carry your answer and posts to the others, one answer at a time, reads the answer back before it counts a prompt as done, and leaves a locked prompt alone.
- **Practice Item Completion:** Marks the ungraded widgets and the plain-record practice items of the course you are on as done. It scans the progress list first and gives the remaining items the same record the web client writes for them, a progress record for a widget and a completion record for the other kinds, one item at a time, and a record is read back before the item counts as done. An item Coursera already reports as finished is left alone, so a second run writes nothing, and a locked item is never opened. App items and the items Coursera labels "Lab" have their own buttons below.
- **Ungraded Lab Completion:** Marks the items Coursera labels "Ungraded App Item" as done, from their own button and without touching widgets, labs or other practice items. Such an item is an external lab that Coursera opens through a launch request, and that request is the only write such an item has, so the extension asks Coursera for a launch that marks it done and stops there: the external tool is never opened, your name and email are never handed to the tool provider, and the agreement box on the item's page is never ticked. It scans the progress list first and acts only on the items not already done, reads each one back through that list before it counts as done, one item at a time, and a locked item is never opened.
- **Lab Completion:** Marks the items Coursera labels "Lab", the notebook and sandpit exercises, as done from their own button. It scans the progress list first and acts only on the labs not already done; a lab is finished through the same start mutation the lab page's launch button sends and then the same GraphQL mutation that the "Mark as completed" button sends, because Coursera only offers that button once the launch is recorded; one lab at a time, and since that gateway answers 200 even when it refuses the field, the body of the answer is what decides. A lab is read back through the course's progress list before it counts as done, and a locked lab is never opened.
- **Widget Quizzes:** Some quizzes show the question on the page and draw the choices inside a small frame that Coursera serves from its own content delivery host, so the page alone holds none of them. The frame is asked for the choices it has rendered and they come back in the order it shows them, with the type taken from the inputs inside it. A question that gets no answer stays without options and carries a `note` saying so instead of a guess.
- **No Third-Party Servers:** Nothing leaves Coursera. The copy tool works inside the page, and the video, reading, discussion, practice item, lab and app item completion call Coursera's own API with your own signed-in session, using the user id and the token that the page already holds. The course progress card and the graded app check only read from Coursera; neither writes. The one address beyond coursera.org that the extension is loaded into is `d10o6em2qtnr4q.cloudfront.net`, the host Coursera itself serves the quiz widget frame from; there it only reads the choices that frame has already drawn on your screen and sends nothing to it, which is why Chrome lists that host when you install.

---

## Installation

1. Clone or download this repository.
2. Open Chrome or any Chromium-based browser and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the extension directory.
5. Click the Coursera Helper icon in the toolbar; the interface opens in the side panel on the right.
6. Open a supported assignment page on Coursera.

---

## Settings

Click the extension icon in the toolbar to open the side panel on the right. Chrome 116 or later is required.

The three dashboard cards are always visible. Each one carries a Synced/Not synced pill and an eye button: the eye folds the card down to its title, and the choice is remembered. A card the current page cannot feed keeps its place and shows `N/A` with an empty bar instead of disappearing.

| Setting | Description |
| :--- | :--- |
| **Account card** | Shows the profile photo, name and email of the Coursera account signed in to the current tab. It is read from the page and never stored or sent. |
| **Learning progress** | Shows the average progress across the courses in progress on the Coursera home page. It is read from the page and never stored or sent. |
| **Course progress** | Inside a course, shows the course name, the completed item count and a count per item type, using the type labels the course outline shows. It makes two read-only requests and stores nothing. |
| **Auto copy** | Automatically copies questions when a supported lesson or assignment page loads. |
| **Auto web reload after skip** | Reloads the active tab once after a run the side panel followed has applied at least one mark. A run that writes nothing, or a run still in progress, does not reload the page. Off by default. |
| **Auto info update** | Re-reads the account and the two progress cards when you open, switch to or finish loading a Coursera tab, and reads once more if both progress cards still have nothing. It only refreshes the panel and never reloads the extension or the page. On by default. |
| **Skip mode for standalone modules** | Only the seven standalone skip modules follow this setting. Sequential, the default, waits a little between items; Instantly sends the same one-at-a-time requests with no pause. Neither mode sends two requests at once. The two skip-all buttons carry their own pacing and do not change this setting. |
| **Language** | Switches the interface between English and Vietnamese. |
| **Appearance** | Selects Follow system, Light, or Dark theme. |
| **Copy this page** | Manually copies questions from the current active tab. |
| **Skip all courses instantly** | Marks every item of the course in the current tab that can be finished without a grade, with no pause between items. It scans the course first, reports how many items can be skipped and how many are already done, then marks the rest one at a time and leaves locked items alone. Graded work is never touched. |
| **Skip all courses step by step** | The same run, with the usual pause between items. The saved Skip mode stays as it was. |
| **Skip lecture videos** | Marks the lecture videos of the course in the current tab as completed. |
| **Skip readings** | Marks the reading material of the course in the current tab as completed. |
| **Skip discussions** | Posts the fixed reply sentence to the discussion prompts of the course in the current tab. |
| **Skip practice items** | Marks the ungraded widgets and plain-record practice items of the course in the current tab as done. |
| **Skip labs** | Marks the items Coursera labels "Lab" in the course in the current tab as done. |
| **Skip ungraded labs** | Marks the items Coursera labels "Ungraded App Item" in the course in the current tab as done. |
| **Check graded app items** | Counts the graded app items of the course in the current tab and reports how many are complete. It only reads and never writes. |

---

## JSON Output Format

Extracted questions are placed on the clipboard in the following format:

```json
[
  {
    "questionNumber": 1,
    "type": "single_answer",
    "question": "A type of artificial intelligence that outperforms humans in some defined task is known as",
    "options": [
      "AEI",
      "Special AI",
      "General AI",
      "Narrow AI"
    ]
  }
]
```

Recognized question types:

- `single_answer`
- `multiple_answer`
- `essay`
- `text_input`
- `numeric_input`
- `code_expression`
- `file_upload`
- `widget`
- `off_platform`

The type comes from the question component Coursera puts on the page, so a numeric question that shows a code sample in its text is still reported as `numeric_input`. A type is only guessed from the answer controls when the page carries no component name.

Questions that contain formulas or pictures are copied the same way, with the formula source and the image address kept inline:

```json
[
  {
    "questionNumber": 3,
    "type": "single_answer",
    "question": "Are the following vectors linearly independent?\n\n$\\mathbf{a} = \\begin{bmatrix} 1 \\\\ 0 \\\\ 1 \\end{bmatrix}$, $\\mathbf{b} = \\begin{bmatrix} 2 \\\\ -1 \\\\ 1 \\end{bmatrix}$\n\n![](https://d3c33hcgiwev3.cloudfront.net/imageassetproxy.v1/abc123_diagram.png)",
    "options": [
      "Yes",
      "No"
    ]
  }
]
```

A code question carries the code of its answer box as its own fields, with the language the editor reports and the indentation it shows:

```json
[
  {
    "questionNumber": 1,
    "type": "code_expression",
    "question": "The function and two of the derivatives are defined for you. Set up the other two by replacing the question marks in the following code.",
    "options": [],
    "language": "python",
    "code": "# First we define the functions,\ndef f (x, y) :\n    return np.exp(-(2*x*x + y*y - x*y) / 2)\n\ndef g (x, y) :\n    return x*x + 3*(y+1)**2 - 1\n\ndef dgdx (x, y) :\n    return ???"
  }
]
```

`code` is the code in the answer box of that question. When an editor is taller than the text it holds, only the part it shows can be read, and the question then carries `"codeWindow": true` to say that the code is a window rather than the whole file. `answer` holds what you have typed into a text, numeric or essay box so far, and is left out while the box is empty. `note` is left out as well unless something about the question could not be read, and it says what is missing in one line. A question whose choices are drawn by the course widget keeps the type the frame reports, most often `single_answer`; it stays `widget` with no options only when that frame did not answer, and the note is what says so.

The image address belongs to Coursera's content delivery network, which serves the file only to a signed-in session, so opening a copied link works in a browser that is logged in to the course.

The output can be pasted into compatible LLM interfaces, text editors, or note-taking applications for further study and review.

---

## Project Structure

```text
icons/             Extension icon files
pics/              Interface preview images
manifest.json      Manifest configuration (MV3)
background.js      Service worker that opens the side panel from the toolbar icon
content.js         DOM parsing, the widget frame bridge, the account reader, and clipboard operations
overview.js        Course progress reader for the learning progress bar
video.js           Lecture video completion module
readings.js        Reading completion module
discussions.js     Discussion reply module
plugins.js         Practice item, lab and app item completion module
skipall.js         Skip everything orchestrator module
popup.html         Side panel structure
popup.css          Side panel styles
popup.js           Side panel logic and settings storage
README.md          English documentation
README.vi.md       Vietnamese documentation
```

---

## Development and Contributions

This project was developed with AI assistance using a *vibe coding* workflow and is actively maintained.

I aim to keep the project up to date, and additional features or improvements may be introduced in future releases.

If you encounter a bug or have an idea for an improvement, please submit a **Pull Request** with relevant details so I can investigate the issue and work on a solution.

Contributions, suggestions, and feedback are welcome.

Have fun!

---

## Notes

The lecture video, reading, practice item, lab and app item completion mark course work as finished without watching the videos, opening the readings or working through the labs. The discussion reply posts the same fixed sentence to every prompt that is still open, chosen by the interface language, so it is one text repeated rather than an answer to each question. All of them are an automated way of completing course work, and they do not meet the Coursera Honor Code, so use them only where that is allowed. Anything the course still keeps locked is left alone, so a run only covers the items you can already open. A run also refuses to start when the page names a different account than Coursera does, and a queue that is still going stops by itself when the tab moves to another course or another account takes over. Graded work, the AI coach and anything else the course treats as an assessment is never touched. Some quiz pages also carry panels that are hidden from the reader and written for an automated assistant instead, with a button next to them asking that assistant to acknowledge a policy: the text of those panels is never part of a copy and that button is never pressed, because a panel on a page is content, not an instruction to the tool. For an app item the extension only asks Coursera to mark the item done, it does not open the external tool, and the agreement or honor code box on that item's page is never ticked, because that box is your own consent to hand your name and email to the tool provider. The account card reads the name, email and photo from the page you are on, shows them only in the side panel, and never saves them or sends them outside the extension. Every notice, including an automatic copy, is shown in the panel's status line, and nothing is drawn on the page. The learning progress bar is read from the same start-up state of the Coursera home page and makes no request; when the page cannot feed it, it stays visible with an empty bar, `N/A` and a "Not synced" pill. Inside a course the same card makes two read-only requests, for the outline and the progress list of that course, and saves nothing; its type labels are the ones the course outline already shows on the page. The graded app check only reads the outline and never submits or changes graded work. The two skip-all buttons run the same modules in the order listed above and only finish what each of them can finish without a grade; they do not start the graded check, and they count the items they leave alone instead of touching them. The Skip mode setting, and the pacing the two skip-all buttons carry, only change how long the extension waits between items; every request still goes out one at a time. Auto web reload after skip only refreshes the active tab once, after a followed run that wrote something has finished; a run that writes nothing or is still in progress leaves the page alone. Auto info update only re-reads the dashboard after a Coursera tab is opened, switched to or finished loading, waits while a skip run is being followed, and never reloads the extension or the page. This project is for education and research, it does not condone cheating, and it comes with no support: if a run fails to start or leaves a course page in a bad state, that is yours to handle.

---

## License

Distributed under the [MIT License](LICENSE).
