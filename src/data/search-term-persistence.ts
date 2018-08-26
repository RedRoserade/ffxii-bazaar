const recipePersistenceKey = "ffxii-bazaar-recipe-search-term";

export function persistRecipeSearchTerm(searchTerm: string) {
  sessionStorage.setItem(recipePersistenceKey, searchTerm);
}

export function clearRecipeSearchTerm() {
  sessionStorage.removeItem(recipePersistenceKey);
}

export function getRecipeSearchTerm(): string | null {
  const persistedSearchTerm = sessionStorage.getItem(recipePersistenceKey);

  return persistedSearchTerm;
}

const itemPersistenceKey = "ffxii-bazaar-item-search-term";

export function persistItemSearchTerm(searchTerm: string) {
  sessionStorage.setItem(itemPersistenceKey, searchTerm);
}

export function clearItemSearchTerm() {
  sessionStorage.removeItem(itemPersistenceKey);
}

export function getItemSearchTerm(): string | null {
  const persistedSearchTerm = sessionStorage.getItem(itemPersistenceKey);

  return persistedSearchTerm;
}
