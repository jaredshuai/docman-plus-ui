import type { RouteLocationNormalizedLoaded } from 'vue-router';

const normalizeProjectId = (value: unknown): number | undefined => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const numericValue = Number(rawValue);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : undefined;
};

export function useRouteProjectId(route: RouteLocationNormalizedLoaded) {
  const projectId = ref<number | undefined>();
  const hasProjectId = computed(() => typeof projectId.value === 'number' && projectId.value > 0);

  watch(
    () => route.query.projectId,
    (value) => {
      projectId.value = normalizeProjectId(value);
    },
    { immediate: true }
  );

  return {
    projectId,
    hasProjectId
  };
}
