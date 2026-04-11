const TAG_TYPES: ElTagType[] = ['primary', 'success', 'info', 'warning', 'danger'];

export function findDictOption(options: DictDataOption[] | undefined, value?: string | number | null): DictDataOption | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const stringValue = String(value);
  return (options ?? []).find((item) => String(item.value) === stringValue);
}

export function resolveDictLabel(options: DictDataOption[] | undefined, value?: string | number | null, fallback = '-'): string {
  const option = findDictOption(options, value);
  if (option?.label) {
    return option.label;
  }
  return value === undefined || value === null || value === '' ? fallback : String(value);
}

export function resolveDictTagType(options: DictDataOption[] | undefined, value?: string | number | null, fallback: ElTagType = 'info'): ElTagType {
  const tagType = findDictOption(options, value)?.elTagType;
  return tagType && TAG_TYPES.includes(tagType) ? tagType : fallback;
}
