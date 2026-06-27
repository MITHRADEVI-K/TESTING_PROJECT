const scanButton = document.getElementById('scanButton');
const activateButton = document.getElementById('activateButton');
const analysisContainer = document.getElementById('analysisContainer');
const elementContainer = document.getElementById('elementContainer');

let selectedElement = null;

scanButton.addEventListener('click', scanPage);
activateButton.addEventListener('click', () => {
  sendMessageToContentScript({ action: 'activateLocatorMode' });
  elementContainer.innerHTML = '<div class="card"><p>Select an element on the page to inspect locator quality.</p></div>';
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'elementSelected') {
    selectedElement = message.element;
    renderSelectedElement();
  }
});

function scanPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, { action: 'scanPage' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        analysisContainer.innerHTML = '<div class="card"><p>Page scan failed. Make sure the page is open and try again.</p></div>';
        return;
      }
      renderAnalysis(response);
    });
  });
}

function renderAnalysis(data) {
  analysisContainer.innerHTML = `
    <div class="card">
      <div class="status">
        <div>
          <div class="section-title">Automation Readiness</div>
          <div class="score">${data.score}</div>
        </div>
        <div class="tag">Grade ${data.grade}</div>
      </div>
      <p>${data.summary}</p>
    </div>
    <div class="card">
      <div class="section-title">Page Inventory</div>
      <ul class="list">
        <li>Forms: ${data.counts.forms}</li>
        <li>Inputs: ${data.counts.inputs}</li>
        <li>Buttons: ${data.counts.buttons}</li>
        <li>Links: ${data.counts.links}</li>
        <li>Tables: ${data.counts.tables}</li>
        <li>Iframes: ${data.counts.iframes}</li>
      </ul>
    </div>
    <div class="card">
      <div class="section-title">Recommendations</div>
      <ul class="list">
        ${data.suggestions.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderSelectedElement() {
  if (!selectedElement) return;

  elementContainer.innerHTML = `
    <div class="card">
      <div class="section-title">Selected Element</div>
      <p><strong>${selectedElement.tag}</strong> ${selectedElement.label || ''}</p>
      <div class="section-title">Best Locator</div>
      <div class="locator-preview">${selectedElement.bestLocator.locator}</div>
      <div class="section-title">Locator Quality</div>
      <p>${selectedElement.qualityText}</p>
      <div class="section-title">Recommendation</div>
      <p>${selectedElement.recommendation}</p>
    </div>
  `;
}

function sendMessageToContentScript(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
}

scanPage();
