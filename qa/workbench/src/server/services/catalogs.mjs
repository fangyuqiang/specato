import { buildCatalog } from '../../../../core/catalog.mjs';
import { buildTestcaseCatalog } from '../../../../core/testcase-catalog.mjs';

function createCachedLoader(loader) {
  let cachedPromise;
  let refreshPromise;

  function load() {
    const pending = loader().catch((error) => {
      if (cachedPromise === pending) cachedPromise = undefined;
      throw error;
    });
    cachedPromise = pending;
    return pending;
  }

  return function getCatalog({ refresh = false } = {}) {
    if (!refresh) return refreshPromise || cachedPromise || load();
    if (refreshPromise) return refreshPromise;
    refreshPromise = loader()
      .then((catalog) => {
        cachedPromise = Promise.resolve(catalog);
        return catalog;
      })
      .finally(() => {
        refreshPromise = undefined;
      });
    return refreshPromise;
  };
}

export const getApiCatalog = createCachedLoader(() => buildCatalog());
export const getTestcaseCatalog = createCachedLoader(() => buildTestcaseCatalog());
