export async function request(path, options) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await response.json();
  if (!response.ok || json.ok === false) {
    const detail = json.error || json.message || response.statusText;
    throw new Error(detail);
  }
  return json;
}

export async function requestText(path, options) {
  const response = await fetch(path, options);
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const error = await response.json();
      detail = error.error || error.message || detail;
    } catch {
      // The endpoint may return plain text.
    }
    throw new Error(detail);
  }
  return response.text();
}
