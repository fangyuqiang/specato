const PRIORITY_VALUES = Object.freeze(['P0', 'P1', 'P2', 'P3', 'P4']);
const CASE_FIELD_ORDER = Object.freeze(['Priority', 'Preconditions', 'Steps']);
const STEP_FIELD_ORDER = Object.freeze(['Action', 'Expected']);

function validatePriorityField(lines) {
  if (!lines) {
    return { value: null, error: 'missing Priority' };
  }

  const content = lines
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('<!--'));
  if (content.length === 0) return { value: null, error: 'has empty Priority' };
  if (content.length !== 1) {
    return { value: null, error: 'Priority must contain exactly one value' };
  }

  const match = content[0].match(/^[-*]\s+(P[0-4])$/);
  if (!match || !PRIORITY_VALUES.includes(match[1])) {
    return { value: null, error: 'Priority must be a single list item with value P0, P1, P2, P3, or P4' };
  }
  return { value: match[1], error: null };
}

function hasFieldContent(lines = []) {
  return lines.some((line) => line.trim().replace(/^[-*]\s*/, '').trim().length > 0);
}

function fieldItems(lines = []) {
  const items = [];
  let current = '';
  let inFence = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) inFence = !inFence;
    const bullet = !inFence ? trimmed.match(/^[-*]\s+(.+)$/) : null;
    if (bullet) {
      if (current.trim()) items.push(current.trim());
      current = bullet[1];
      continue;
    }
    if (!trimmed && !inFence) {
      if (current.trim()) items.push(current.trim());
      current = '';
      continue;
    }
    current = current ? `${current}\n${line}` : line;
  }
  if (current.trim()) items.push(current.trim());
  return items;
}

function parseTestCaseContent(content, options = {}) {
  const file = options.file || '<unknown>';
  const lines = content.split(/\r?\n/);
  const errors = [];
  const cases = [];
  let requirement = null;
  let foundTestCasesSection = false;
  let currentScenario = null;
  let currentCase = null;
  let currentField = null;
  let currentStep = null;
  let currentStepField = null;

  function errorAt(line, message) {
    errors.push(`${file}:${line}: ${message}`);
  }

  function finishStep() {
    if (!currentStep || !currentCase) return;
    const expectedNumber = currentCase.steps.length + 1;
    if (currentStep.number !== expectedNumber) {
      errorAt(
        currentStep.line,
        `${currentCase.id} Step numbering must be continuous from 1; expected Step ${expectedNumber} but found Step ${currentStep.number}`,
      );
    }

    for (const field of STEP_FIELD_ORDER) {
      if (!currentStep.fields.has(field)) {
        errorAt(currentStep.line, `${currentCase.id} Step ${currentStep.number} missing ${field}`);
      } else if (!hasFieldContent(currentStep.fields.get(field))) {
        errorAt(currentStep.line, `${currentCase.id} Step ${currentStep.number} has empty ${field}`);
      }
    }

    const actionItems = fieldItems(currentStep.fields.get('Action'));
    const expectedItems = fieldItems(currentStep.fields.get('Expected'));
    if (actionItems.length > 1) {
      errorAt(
        currentStep.line,
        `${currentCase.id} Step ${currentStep.number} Action must contain exactly one value`,
      );
    }

    currentCase.steps.push({
      number: currentStep.number,
      action: actionItems[0] || '',
      expected: expectedItems,
      fields: currentStep.fields,
      line: currentStep.line,
    });
    currentStep = null;
    currentStepField = null;
  }

  function finishCase() {
    if (!currentCase) return;
    finishStep();
    const priority = validatePriorityField(currentCase.fields.get('Priority'));
    currentCase.priority = priority.value;
    if (priority.error) errorAt(currentCase.line, `${currentCase.id} ${priority.error}`);

    if (!currentCase.fields.has('Preconditions')) {
      errorAt(currentCase.line, `${currentCase.id} missing Preconditions`);
    } else if (!hasFieldContent(currentCase.fields.get('Preconditions'))) {
      errorAt(currentCase.line, `${currentCase.id} has empty Preconditions`);
    }

    if (!currentCase.fields.has('Steps')) {
      errorAt(currentCase.line, `${currentCase.id} missing Steps`);
    } else if (currentCase.steps.length === 0) {
      errorAt(currentCase.line, `${currentCase.id} Steps must contain at least one Step`);
    }

    cases.push(currentCase);
    currentCase = null;
    currentField = null;
    currentStep = null;
    currentStepField = null;
  }

  function beginCaseField(title, line) {
    if (!currentCase) {
      errorAt(line, `field "${title}" has no parent TestCase`);
      return;
    }

    if (!CASE_FIELD_ORDER.includes(title)) {
      errorAt(line, `unsupported TestCase field "${title}"`);
      currentField = null;
      return;
    }
    const expectedField = CASE_FIELD_ORDER[currentCase.fields.size];
    if (!currentCase.fields.has(title) && title !== expectedField) {
      errorAt(
        line,
        `TestCase fields must use order ${CASE_FIELD_ORDER.join(', ')}; expected "${expectedField || '<none>'}" before "${title}"`,
      );
    }
    if (currentCase.fields.has(title)) {
      errorAt(line, `duplicate TestCase field "${title}"`);
    } else {
      currentCase.fields.set(title, []);
    }
    currentField = title;
    currentStepField = null;
  }

  function beginStepField(title, inlineContent, line) {
    if (!currentCase || !currentStep) {
      errorAt(line, `Step field "${title}" has no parent Step`);
      return;
    }
    const expectedField = STEP_FIELD_ORDER[currentStep.fields.size];
    if (!currentStep.fields.has(title) && title !== expectedField) {
      errorAt(
        line,
        `${currentCase.id} Step ${currentStep.number} fields must use order Action, Expected; expected "${expectedField || '<none>'}" before "${title}"`,
      );
    }
    if (currentStep.fields.has(title)) {
      errorAt(line, `${currentCase.id} Step ${currentStep.number} duplicate ${title}`);
    } else {
      currentStep.fields.set(title, inlineContent ? [inlineContent] : []);
    }
    currentStepField = title;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineNumber = index + 1;
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*$/);

    if (!heading) {
      if (currentStep) {
        const marker = line.trim().match(/^[-*]\s+\*\*(Action|Expected)\*\*:\s*(.*)$/);
        if (marker) {
          beginStepField(marker[1], marker[2], lineNumber);
        } else if (currentStepField) {
          currentStep.fields.get(currentStepField).push(line);
        } else if (line.trim() && !line.trim().startsWith('<!--')) {
          errorAt(
            lineNumber,
            `${currentCase.id} Step ${currentStep.number} content must be inside Action or Expected`,
          );
        }
      } else if (currentCase && currentField && currentField !== 'Steps') {
        currentCase.fields.get(currentField).push(line);
      } else if (line.trim() && !line.trim().startsWith('<!--')) {
        errorAt(lineNumber, 'content must be inside a TestCase field');
      }
      continue;
    }

    const level = heading[1].length;
    const title = heading[2];
    if (level === 1) {
      finishCase();
      const match = title.match(/^Requirement:\s*(.+?)\s*$/);
      if (!match) {
        errorAt(lineNumber, 'H1 must be "Requirement: <name>"');
      } else if (requirement) {
        errorAt(lineNumber, 'only one Requirement is allowed per file');
      } else {
        requirement = match[1];
      }
      currentScenario = null;
      continue;
    }

    if (level === 2) {
      finishCase();
      if (title !== 'Test Cases') {
        errorAt(lineNumber, 'H2 must be "Test Cases"');
      } else if (foundTestCasesSection) {
        errorAt(lineNumber, 'duplicate "Test Cases" section');
      } else {
        foundTestCasesSection = true;
      }
      currentScenario = null;
      continue;
    }

    if (level === 3) {
      finishCase();
      const match = title.match(/^Scenario:\s*(.+?)\s*$/);
      if (!match) {
        errorAt(lineNumber, 'H3 must be "Scenario: <name>"');
        currentScenario = null;
      } else {
        currentScenario = match[1];
      }
      continue;
    }

    if (level === 4) {
      finishCase();
      const match = title.match(/^TestCase:\s*([A-Za-z0-9][A-Za-z0-9._:/-]*)\s+(.+?)\s*$/);
      if (!match) {
        errorAt(lineNumber, 'H4 must be "TestCase: <ID> <title>"');
        continue;
      }
      if (!currentScenario) errorAt(lineNumber, `${match[1]} has no parent Scenario`);
      currentCase = {
        id: match[1],
        title: match[2],
        scenario: currentScenario,
        requirement,
        fields: new Map(),
        steps: [],
        line: lineNumber,
        file,
      };
      continue;
    }

    if (level === 5) {
      finishStep();
      beginCaseField(title, lineNumber);
      continue;
    }

    if (!currentCase || currentField !== 'Steps') {
      errorAt(lineNumber, `Step heading "${title}" must be inside a Steps field`);
      continue;
    }
    const stepMatch = title.match(/^Step\s+(\d+)$/);
    if (!stepMatch) {
      errorAt(lineNumber, `H6 must be "Step <number>"`);
      continue;
    }
    finishStep();
    currentStep = {
      number: Number(stepMatch[1]),
      fields: new Map(),
      line: lineNumber,
    };
    currentStepField = null;
  }

  finishCase();
  if (!requirement) errors.push(`${file}: missing Requirement heading`);
  if (!foundTestCasesSection) errors.push(`${file}: missing "## Test Cases" section`);
  if (cases.length === 0) errors.push(`${file}: must contain at least one TestCase`);
  return { requirement, cases, errors };
}

module.exports = {
  fieldItems,
  parseTestCaseContent,
};
