// Delta Helper: rates fares on delta.com as cheap, average, or expensive using Gemini.
// The API key comes from config.js (see config.example.js).

const analyzePrice = async (priceEl) => {
  if (priceEl.dataset.analyzed) return;
  priceEl.dataset.analyzed = "true";

  const num = parseInt(priceEl.innerText.trim());
  if (!num) return;

  const priceText = '$' + num;
  const originEl = document.querySelector('[class*="origin"]');
  const destEl = document.querySelector('[class*="destination"]');
  const origin = originEl?.innerText?.trim() || 'unknown origin';
  const destination = destEl?.innerText?.trim() || 'unknown destination';

  // Show loading badge on hover
  const badge = document.createElement('span');
  badge.innerText = '...';
  badge.style.cssText = `margin-left:8px;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:bold;color:white;background:#999;vertical-align:middle;`;
  priceEl.appendChild(badge);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `A flight from ${origin} to ${destination} costs ${priceText}. Is this cheap, average, or expensive for this specific route? Reply ONLY with this JSON: {"rating":"CHEAP","reason":"one sentence for this specific route"} Rating must be CHEAP, AVERAGE, or EXPENSIVE.`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    if (!data.candidates || !data.candidates[0]) throw new Error('no candidates');
    const raw = data.candidates[0].content.parts[0].text.trim();
    const result = JSON.parse(raw.replace(/```json|```/g, '').trim());
    badge.innerText = result.rating;
    badge.title = result.reason;
    badge.style.background = result.rating==='CHEAP'?'#2e7d32':result.rating==='AVERAGE'?'#e65100':'#c62828';

  } catch(err) {
    badge.innerText = '?';
    badge.title = 'Could not analyze -- try hovering again';
    badge.style.background = '#999';
    console.log('Delta Helper error:', err);
  }
};

// Attach hover listeners whenever new price elements appear
const observer = new MutationObserver(() => {
  const prices = document.querySelectorAll('.mach-revenue-price__whole');
  prices.forEach((priceEl) => {
    if (priceEl.dataset.listenerAdded) return;
    priceEl.dataset.listenerAdded = "true";

    priceEl.style.cursor = 'pointer';

    priceEl.addEventListener('mouseenter', () => {
      analyzePrice(priceEl);
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });