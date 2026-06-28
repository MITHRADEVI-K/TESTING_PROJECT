import { renderInventory, renderIssueNavigator, renderRecommendations, renderScoreCard, renderSelectedElement, renderTopIssues } from '../ui/renderer.js';

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
    renderSelectedElementView();
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
    ${renderScoreCard(data)}
    ${renderInventory(data)}
    ${renderIssueNavigator(data)}
    ${renderRecommendations(data)}
    ${renderTopIssues(data)}
  `;

  document.querySelectorAll('[data-issue-type]').forEach((button) => {
    button.addEventListener('click', () => {
      sendMessageToContentScript({ action: 'highlightIssue', issueType: button.dataset.issueType });
    });
  });
}

function renderSelectedElementView() {
  elementContainer.innerHTML = renderSelectedElement(selectedElement);
}

function sendMessageToContentScript(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
}

scanPage();
