const getBestLocator = (element) => {
  if (!element) return { type: 'xpath', locator: '' };

  if (element.id) {
    return { type: 'css', locator: `#${element.id}` };
  }
  if (element.dataset && element.dataset.testid) {
    return { type: 'css', locator: `[data-testid="${element.dataset.testid}"]` };
  }
  if (element.name) {
    return { type: 'css', locator: `[name="${element.name}"]` };
  }
  if (element.getAttribute('aria-label')) {
    return { type: 'css', locator: `[aria-label="${element.getAttribute('aria-label')}"]` };
  }

  const classes = Array.from(element.classList).filter(Boolean);
  if (classes.length > 0) {
    return { type: 'css', locator: `${element.tagName.toLowerCase()}.${classes.join('.')}` };
  }

  return { type: 'xpath', locator: getPathTo(element) };
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

  let score = 100;
  if (!title) score -= 10;
  score -= Math.min(30, missingIds * 4);
  score -= Math.min(20, ariaMissing * 3);
  score -= Math.min(20, dynamicClasses * 2);
  score = Math.max(0, Math.min(100, score));

  const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D';
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
    score,
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
      qualityText: quality.qualityText,
      recommendation: quality.recommendation
    }
  });
  removeListeners();
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
    sendResponse(analyzePage());
  }
  if (message.action === 'activateLocatorMode') {
    addListeners();
    sendResponse({ status: 'locator-mode-enabled' });
  }
});
