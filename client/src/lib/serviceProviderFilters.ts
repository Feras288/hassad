export function getProvidersForServiceCategory<T extends { serviceCategories: readonly string[] }>(providers: T[], category: string) {
  return providers.filter((provider) => provider.serviceCategories.includes(category));
}

export function getServiceProviderProfileHref(profileId: string) {
  return `/provider/${encodeURIComponent(profileId)}`;
}
