import type { RouteLocationNormalizedLoaded } from 'vue-router';

const normalizeProjectId = (value: unknown): string | undefined => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const stringValue = String(rawValue ?? '').trim();
  return /^\d+$/.test(stringValue) && stringValue !== '0' ? stringValue : undefined;
};

export function useRouteProjectId(route: RouteLocationNormalizedLoaded) {
  const projectId = ref<string | undefined>();
  const hasProjectId = computed(() => Boolean(projectId.value));

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
