import { escapeHtml, getStarRating } from '../utils/html.js';

export function renderScoreCard(data) {
  return `
    <div class="card">
      <div class="status">
        <div>
          <div class="section-title">Automation Score</div>
          <div class="score">${data.automationScore}</div>
        </div>
        <div class="tag">Grade ${data.grade}</div>
      </div>
      <div class="list">
        <div>Locator Health: ${data.locatorHealth}</div>
        <div>Accessibility: ${data.accessibility}</div>
        <div>Maintainability: ${data.maintainability}</div>
      </div>
      <p>${escapeHtml(data.summary)}</p>
    </div>
  `;
}

export function renderInventory(data) {
  return `
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
  `;
}

export function renderIssueNavigator(data) {
  const issues = [];

  if (data.missingIds) {
    issues.push({ type: 'missing-ids', label: `Missing IDs (${data.missingIds})` });
  }
  if (data.dynamicClasses) {
    issues.push({ type: 'dynamic-classes', label: `Dynamic Classes (${data.dynamicClasses})` });
  }
  if (data.ariaMissing) {
    issues.push({ type: 'missing-labels', label: `Missing Labels (${data.ariaMissing})` });
  }

  if (!issues.length) {
    return '';
  }

  return `
    <div class="card">
      <div class="section-title">Issue Navigator</div>
      <div class="list">
        ${issues.map((issue) => `<button type="button" class="secondary" data-issue-type="${issue.type}">${issue.label}</button>`).join('')}
      </div>
    </div>
  `;
}

export function renderRecommendations(data) {
  return `
    <div class="card">
      <div class="section-title">Recommendations</div>
      <ul class="list">
        ${data.suggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </div>
  `;
}

export function renderTopIssues(data) {
  return `
    <div class="card">
      <div class="section-title">Top Issues</div>
      <ul class="list">
        ${data.topIssues.map((issue) => `<li><strong>${escapeHtml(issue.label)}</strong>: ${escapeHtml(issue.qualityText)} — ${escapeHtml(issue.recommendation)}</li>`).join('')}
      </ul>
    </div>
  `;
}

export function renderSelectedElement(selectedElement) {
  if (!selectedElement) {
    return '';
  }

  return `
    <div class="card">
      <div class="section-title">Selected Element</div>
      <p><strong>${escapeHtml(selectedElement.tag)}</strong> ${escapeHtml(selectedElement.label || '')}</p>
      <div class="section-title">Best Locator</div>
      <div class="locator-preview">${escapeHtml(selectedElement.bestLocator?.locator || '')}</div>
      <div class="section-title">Locator Quality</div>
      <p>${escapeHtml(selectedElement.qualityText)}</p>
      <div class="section-title">Recommendation</div>
      <p>${escapeHtml(selectedElement.recommendation)}</p>
      ${renderLocatorRanking(selectedElement)}
    </div>
  `;
}

export function renderLocatorRanking(element) {
  if (!element.locatorRanking || !element.locatorRanking.length) {
    return '<p>No ranked locators available.</p>';
  }

  return `
    <div class="section-title">Locator Ranking</div>
    <ul class="list">
      ${element.locatorRanking.map((item) => `<li>${getStarRating(item.score)} ${escapeHtml(item.type)}=${escapeHtml(item.locator)}</li>`).join('')}
    </ul>
  `;
}
