<div align="center">
  <img src="icons/icon128.png" width="80" height="80" alt="Coursera Questions Copy Icon" />
  <h1>Coursera Questions Copy</h1>
  <p>A browser extension to extract questions from Coursera quiz and assignment pages and copy them to the clipboard as structured JSON for study notes and review.</p>

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

- **Auto copy:** Automatically copies questions to the clipboard when an assignment page loads.
- **Manual copy:** Copies questions on demand by clicking a button in the popup.
- **JSON format:** Formats questions, choices, and question types into clean JSON.
- **Bilingual interface:** Supports English and Vietnamese across the popup and in-page notices.
- **Theme support:** Follows system theme or allows manual Light/Dark selection.
- **Local execution:** All operations run locally inside the browser without external network requests.

---

## Installation

1. Clone or download this repository.
2. Open Chrome or any Chromium-based browser and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the extension directory.
5. Open an assignment page on Coursera (`https://www.coursera.org/learn/...`).

---

## Settings

Click the extension icon in the toolbar to access configuration options:

| Setting | Description |
| :--- | :--- |
| **Auto copy** | Automatically copies questions when a lesson page opens. |
| **Language** | Switches the interface and in-page notices between English and Vietnamese. |
| **Theme** | Selects Follow system, Light, or Dark theme. |
| **Copy this page** | Manually copies questions from the current active tab. |

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
- `code_expression`

---

## Project Structure

```text
icons/             Extension icon files
pics/              Interface preview images
manifest.json      Manifest configuration (MV3)
content.js         DOM parsing, clipboard operations, and notifications
popup.html         Popup structure
popup.css          Popup styles
popup.js           Popup logic and settings storage
README.md          English documentation
README.vi.md       Vietnamese documentation
```

---

## License

Distributed under the [MIT](LICENSE) License.
