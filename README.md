# Delta Helper

A Chrome extension that tells you whether a fare on delta.com is actually a good price.

Delta's site lists prices but never says if one is cheap for that route. I wanted that answer right next to the fare, so I built it. Hover over a price and a badge shows up: **CHEAP**, **AVERAGE**, or **EXPENSIVE**, with a one-line reason from Google's Gemini.

Try a simulated version in your browser on my portfolio: https://allie-rose.github.io/project.html?p=delta-helper

*Personal project. Not affiliated with or endorsed by Delta Air Lines.*

## How it works

- `content.js` runs on delta.com. Fares load after the page opens, so a `MutationObserver` watches for new price elements and adds a hover listener to each one.
- The first time you hover a price, it reads the price, origin, and destination off the page and sends this prompt to Gemini 2.0 Flash:

  ```
  A flight from ${origin} to ${destination} costs ${priceText}.
  Is this cheap, average, or expensive for this specific route?
  Reply ONLY with this JSON:
  {"rating":"CHEAP","reason":"one sentence for this specific route"}
  Rating must be CHEAP, AVERAGE, or EXPENSIVE.
  ```

- It strips any markdown fences from the reply, parses the JSON, and colors the badge green, orange, or red. The reason goes in the tooltip.
- Each price is checked once. If the call fails, the badge shows a gray `?` instead of breaking the page.

## Run it yourself

1. Get a free Gemini API key at https://aistudio.google.com/apikey.
2. Copy `config.example.js` to `config.js` and paste your key in. (`config.js` is in `.gitignore`, so your key stays on your computer.)
3. In Chrome, go to `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and pick this folder.
4. Search for a flight on delta.com and hover over a price.

## Not done yet

- The **Analyze This Flight** button in the popup still says "Coming soon."
- The API key sits in the extension on your own computer, which is fine for personal use. To share the extension, the Gemini call should move to a small server so the key never ships with it.
- Ratings come from Gemini's general sense of prices, not real fare history. Plugging in historical fares would make them more trustworthy.
- It depends on Delta's page structure (the `.mach-revenue-price__whole` class), so a redesign of delta.com could break it.
