const getBestLocator = (element) => {
  const ranking = getLocatorRanking(element);
  return ranking.length ? ranking[0] : { type: 'xpath', locator: '' };
};

const getLocatorRanking = (element) => {
  if (!element) return [];

  const ranking = [];
  if (element.id) {
    ranking.push({ type: 'css', locator: `#${element.id}`, score: 100 });
  }
  if (element.dataset && element.dataset.testid) {
    ranking.push({ type: 'css', locator: `[data-testid="${element.dataset.testid}"]`, score: 90 });
  }
  if (element.name) {
    ranking.push({ type: 'css', locator: `[name="${element.name}"]`, score: 75 });
  }
  if (element.getAttribute('aria-label')) {
    ranking.push({ type: 'css', locator: `[aria-label="${element.getAttribute('aria-label')}"]`, score: 70 });
  }

  const stableClasses = Array.from(element.classList).filter((name) => name && !isDynamicClass(name));
  if (stableClasses.length > 0) {
    ranking.push({ type: 'css', locator: `${element.tagName.toLowerCase()}.${stableClasses.join('.')}`, score: 55 });
  }

  const allClasses = Array.from(element.classList).filter(Boolean);
  if (allClasses.length > 0 && stableClasses.length !== allClasses.length) {
    ranking.push({ type: 'css', locator: `${element.tagName.toLowerCase()}.${allClasses.join('.')}`, score: 40 });
  }

  ranking.push({ type: 'xpath', locator: getPathTo(element), score: 25 });
  return ranking;
};

const getPathTo = (element) => {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }
  if (element === document.body) {
    return '/html/body';
  }
  let ix = 0;
  const siblings = element.parentNode ? element.parentNode.childNodes : [];
  for (let i = 0; i < siblings.length; i += 1) {
    const sibling = siblings[i];
    if (sibling === element) {
      return `${getPathTo(element.parentNode)}/${element.tagName.toLowerCase()}[${ix + 1}]`;
    }
    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
      ix += 1;
    }
  }
  return '';
};

const isDynamicClass = (className) => /\d/.test(className) && /(-|_)/.test(className);

const getElementQuality = (element) => {
  const locator = getBestLocator(element);
  const classes = Array.from(element.classList).filter(Boolean);
  const dynamicClasses = classes.filter(isDynamicClass).length;
  let score = 100;
  let qualityText = 'Stable';
  let recommendation = 'Good locator quality.';

  if (locator.type === 'xpath') {
    score -= 40;
  }
  if (!element.id && !element.name && !element.dataset.testid) {
    score -= 20;
  }
  if (dynamicClasses > 0) {
    score -= 20;
  }
  if (element.getAttribute('aria-label')) {
    score += 5;
  }

  score = Math.max(0, Math.min(100, score));
  if (score < 80) qualityText = 'Moderate';
  if (score < 60) qualityText = 'Fragile';
  if (score < 60) recommendation = 'Add a stable ID or data-testid attribute for this element.';

  return { score, qualityText, recommendation, bestLocator: locator };
};

const makeSummary = ({ title, missingIds, ariaMissing, dynamicClasses }) => {
  const suggestions = [];
  if (!title) suggestions.push('Add a meaningful page title.');
  if (missingIds > 0) suggestions.push(`Add stable IDs to ${missingIds} interactive elements.`);
  if (ariaMissing > 0) suggestions.push(`Improve labeling for ${ariaMissing} form controls.`);
  if (dynamicClasses > 0) suggestions.push('Avoid dynamic CSS classes for selectors.');
  return suggestions.length ? suggestions : ['The page is in good shape for automation.'];
};

const analyzePage = () => {
  const title = document.title || '';
  const buttons = Array.from(document.querySelectorAll('button, input[type=submit], input[type=button]'));
  const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
  const links = Array.from(document.querySelectorAll('a[href]'));
  const tables = Array.from(document.querySelectorAll('table'));
  const iframes = Array.from(document.querySelectorAll('iframe'));
  const forms = Array.from(document.querySelectorAll('form'));

  const interactive = [...buttons, ...inputs, ...links];
  const missingIds = interactive.filter((el) => !el.id).length;
  const ariaMissing = inputs.filter((el) => {
    const hasLabel = el.id && document.querySelector(`label[for="${el.id}"]`);
    return !hasLabel && !el.getAttribute('aria-label') && !el.placeholder;
  }).length;
  const dynamicClasses = interactive.reduce((count, el) => count + Array.from(el.classList).filter(isDynamicClass).length, 0);
  const stableSelectors = interactive.filter((el) => el.id || el.dataset.testid || el.name || el.getAttribute('aria-label')).length;

  const locatorHealth = Math.max(0, 100 - missingIds * 3 - dynamicClasses * 2 - Math.max(0, (interactive.length - stableSelectors) * 1));
  const accessibility = Math.max(0, 100 - ariaMissing * 4 - (!title ? 10 : 0));
  const maintainability = Math.max(0, 100 - dynamicClasses * 2 - missingIds * 2);
  const automationScore = Math.round((locatorHealth + accessibility + maintainability) / 3);

  const grade = automationScore >= 80 ? 'A' : automationScore >= 60 ? 'B' : automationScore >= 40 ? 'C' : 'D';
  const suggestions = makeSummary({ title, missingIds, ariaMissing, dynamicClasses });

  return {
    title,
    counts: {
      buttons: buttons.length,
      inputs: inputs.length,
      links: links.length,
      tables: tables.length,
      iframes: iframes.length,
      forms: forms.length
    },
    missingIds,
    ariaMissing,
    dynamicClasses,
    locatorHealth,
    accessibility,
    maintainability,
    automationScore,
    score: automationScore,
    grade,
    summary: suggestions.join(' '),
    suggestions,
    topIssues: interactive.slice(0, 5).map((element) => {
      const label = element.getAttribute('aria-label') || element.innerText.trim().slice(0, 40) || element.name || element.id || element.tagName.toLowerCase();
      const quality = getElementQuality(element);
      return { label, qualityText: quality.qualityText, recommendation: quality.recommendation, bestLocator: quality.bestLocator };
    })
  };
};

const highlight = (event) => {
  const element = event.target;
  element.dataset.qaforgeOutline = element.style.outline || '';
  element.style.outline = '3px solid #ff8c00';
};

const unhighlight = (event) => {
  const element = event.target;
  if (element.dataset.qaforgeOutline !== undefined) {
    element.style.outline = element.dataset.qaforgeOutline;
    delete element.dataset.qaforgeOutline;
  }
};

const onClick = (event) => {
  event.preventDefault();
  event.stopPropagation();
  const element = event.target;
  const quality = getElementQuality(element);
  const label = element.getAttribute('aria-label') || element.innerText.trim().slice(0, 40) || element.name || element.id || element.tagName.toLowerCase();

  chrome.runtime.sendMessage({
    action: 'elementSelected',
    element: {
      tag: element.tagName.toLowerCase(),
      label,
      bestLocator: quality.bestLocator,
      locatorRanking: getLocatorRanking(element),
      qualityText: quality.qualityText,
      recommendation: quality.recommendation
    }
  });
  removeListeners();
};

const highlightIssueElements = (issueType) => {
  const elements = getIssueElements(issueType);
  const style = getIssueStyle(issueType);

  elements.forEach((el) => {
    el.dataset.qaforgeIssueHighlight = issueType;
    el.dataset.qaforgeIssueOutline = el.style.outline || '';
    el.dataset.qaforgeIssueBg = el.style.backgroundColor || '';
    el.style.outline = style.outline;
    el.style.backgroundColor = style.backgroundColor;
  });

  return elements.length;
};

const getIssueElements = (issueType) => {
  if (issueType === 'dynamic-classes') {
    return Array.from(document.querySelectorAll('*')).filter((el) => Array.from(el.classList || []).some(isDynamicClass));
  }

  if (issueType === 'missing-labels') {
    return Array.from(document.querySelectorAll('input, select, textarea')).filter((el) => {
      const hasLabel = el.id && document.querySelector(`label[for="${el.id}"]`);
      return !hasLabel && !el.getAttribute('aria-label') && !el.placeholder && !el.getAttribute('type')?.includes('hidden');
    });
  }

  return Array.from(document.querySelectorAll('button:not([id]), input:not([id]), select:not([id]), textarea:not([id]), a[href]:not([id])'));
};

const getIssueStyle = (issueType) => {
  if (issueType === 'dynamic-classes') {
    return { outline: '3px dashed #0b4a95', backgroundColor: 'rgba(11, 74, 149, 0.16)' };
  }
  if (issueType === 'missing-labels') {
    return { outline: '3px dashed #d64545', backgroundColor: 'rgba(214, 69, 69, 0.16)' };
  }
  return { outline: '3px dashed #ff8c00', backgroundColor: 'rgba(255, 227, 116, 0.25)' };
};

const clearIssueHighlights = () => {
  document.querySelectorAll('[data-qaforge-issue-highlight]').forEach((el) => {
    el.style.outline = el.dataset.qaforgeIssueOutline || '';
    el.style.backgroundColor = el.dataset.qaforgeIssueBg || '';
    delete el.dataset.qaforgeIssueHighlight;
    delete el.dataset.qaforgeIssueOutline;
    delete el.dataset.qaforgeIssueBg;
  });
};

const addListeners = () => {
  document.body.addEventListener('mouseover', highlight, true);
  document.body.addEventListener('mouseout', unhighlight, true);
  document.body.addEventListener('click', onClick, true);
};

const removeListeners = () => {
  document.body.removeEventListener('mouseover', highlight, true);
  document.body.removeEventListener('mouseout', unhighlight, true);
  document.body.removeEventListener('click', onClick, true);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'scanPage') {
    clearIssueHighlights();
    sendResponse(analyzePage());
  }
  if (message.action === 'activateLocatorMode') {
    addListeners();
    sendResponse({ status: 'locator-mode-enabled' });
  }
  if (message.action === 'highlightIssue') {
    clearIssueHighlights();
    const count = highlightIssueElements(message.issueType || 'missing-ids');
    sendResponse({ status: 'highlighted', count, issueType: message.issueType || 'missing-ids' });
  }
});
