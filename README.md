<div align="center">
  <img src="icons/icon128.png" width="80" height="80" alt="Coursera Questions Copy Icon" />
  <h1>Coursera Questions Copy</h1>
  <p>A browser extension that extracts questions from Coursera quizzes and assignments and copies them to the clipboard as structured JSON for study notes, revision, and review. It can also mark the videos, readings, discussions and practice items of a course as completed through Coursera's own API.</p>

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
- **Manual Copy:** Copies questions on demand through a button in the extension popup.
- **Structured JSON:** Organizes questions, answer choices, and question types into clean, readable JSON.
- **Math and Diagrams:** Formulas are copied as their LaTeX source between `$` signs, and pictures are copied as markdown image links that point to the original file, so questions containing equations or figures are not lost. Links keep their address, and a table is copied as one line per row.
- **Code and Answers:** The code a question gives you is copied as a fenced block with its own language and its indentation kept, so a starter file survives the paste as runnable text. Code shown inside the question text is copied with it, and anything you have already typed into an answer box comes along too.
- **LLM-Friendly Workflow:** Makes extracted text easy to paste into different LLMs or personal note-taking tools, without requiring screenshots.
- **Bilingual Interface:** Supports English and Vietnamese across the popup and in-page notifications.
- **Theme Support:** Follows the system theme or allows manual Light/Dark selection.
- **Lecture Video Completion:** Marks the lecture videos of the course you are on as completed. It sends the playback events the web player itself would send, one lecture at a time, reads Coursera's answer back before it counts a lecture as done, writes one direct completion record for a lecture whose events did not stick, and leaves a lecture the course has locked alone.
- **Reading Completion:** Marks the reading material of the course you are on as completed. It creates the same completion record the page creates when a reading is opened, one reading at a time, separates the readings it could confirm from the ones it only wrote, and leaves a locked reading alone.
- **Discussion Reply:** Posts one reply text to the discussion prompts of the course you are on. It reads the question behind each prompt, posts one answer at a time, reads the answer back before it counts a prompt as done, leaves a prompt you have already answered alone so a second run cannot post twice, and leaves a locked prompt alone. The text itself is yours and can be edited in the popup.
- **Practice Item Completion:** Marks the ungraded labs, widgets, notebooks and app items of the course you are on as done. Each kind of item gets the record the web client writes for it, one item at a time, and a record is read back before the item counts as done. An app item is an external lab that Coursera opens through a launch request, and that request is the only write such an item has, so the extension asks Coursera for it and stops there: the external tool is never opened, and nothing is handed to the tool provider. An item Coursera already reports as finished is left alone, so a second run writes nothing, and a locked item is never opened.
- **Widget Quizzes:** Some quizzes show the question on the page and draw the choices inside a small frame that Coursera serves from its own content delivery host, so the page alone holds none of them. The frame is asked for the choices it has rendered and they come back in the order it shows them, with the type taken from the inputs inside it. A question that gets no answer stays without options and carries a `note` saying so instead of a guess.
- **No Third-Party Servers:** Nothing leaves Coursera. The copy tool works inside the page, and the video, reading, discussion and practice item completion call Coursera's own API with your own signed-in session, using the user id and the token that the page already holds. The one address beyond coursera.org that the extension is loaded into is `d10o6em2qtnr4q.cloudfront.net`, the host Coursera itself serves the quiz widget frame from; there it only reads the choices that frame has already drawn on your screen and sends nothing to it, which is why Chrome lists that host when you install.

---

## Installation

1. Clone or download this repository.
2. Open Chrome or any Chromium-based browser and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the extension directory.
5. Open a supported assignment page on Coursera.

---

## Settings

Click the extension icon in the toolbar to access the configuration options.

| Setting | Description |
| :--- | :--- |
| **Auto copy** | Automatically copies questions when a supported lesson or assignment page loads. |
| **Language** | Switches the interface and in-page notifications between English and Vietnamese. |
| **Theme** | Selects Follow system, Light, or Dark theme. |
| **Copy this page** | Manually copies questions from the current active tab. |
| **Complete lecture videos** | Marks the lecture videos of the course in the current tab as completed. |
| **Complete readings** | Marks the reading material of the course in the current tab as completed. |
| **Complete discussions** | Posts your reply text to the discussion prompts of the course in the current tab. |
| **Complete practice items** | Marks the ungraded labs, widgets, notebooks and app items of the course in the current tab as done. |
| **Discussion reply** | The exact text that gets posted. Write your own, or clear the box and nothing is posted. |

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
content.js         DOM parsing, the widget frame bridge, clipboard operations, and notifications
video.js           Lecture video completion module
readings.js        Reading completion module
discussions.js     Discussion reply module
plugins.js         Practice item completion module
popup.html         Popup structure
popup.css          Popup styles
popup.js           Popup logic and settings storage
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

The lecture video, reading and practice item completion mark course work as finished without watching the videos, opening the readings or working through the labs. The discussion reply posts the same sentence to every prompt that is still open, so it is one text repeated rather than an answer to each question. All of them are an automated way of completing course work, and they do not meet the Coursera Honor Code, so use them only where that is allowed. Anything the course still keeps locked is left alone, so a run only covers the items you can already open. A run also refuses to start when the page names a different account than Coursera does, and a queue that is still going stops by itself when the tab moves to another course or another account takes over. Graded work, the AI coach and anything else the course treats as an assessment is never touched. Some quiz pages also carry panels that are hidden from the reader and written for an automated assistant instead, with a button next to them asking that assistant to acknowledge a policy: the text of those panels is never part of a copy and that button is never pressed, because a panel on a page is content, not an instruction to the tool. For an app item the extension only asks Coursera to mark the item done, it does not open the external tool, and the agreement or honor code box on that item's page is never ticked, because that box is your own consent to hand your name and email to the tool provider. This project is for education and research, it does not condone cheating, and it comes with no support: if a run fails to start or leaves a course page in a bad state, that is yours to handle.

---

## License

Distributed under the [MIT License](LICENSE).
