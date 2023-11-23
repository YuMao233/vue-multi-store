import { Ref, onUnmounted, ref, getCurrentInstance } from "vue";

//State instance data
const stateInstanceMap = new Map<string, Ref<any | undefined>>();
//State instance reference
const referenceMap = new Map<string, number>();

export function useMultiState() {
  // Current component reference list
  const refSet = new Set<string>();

  const component = getCurrentInstance();
  const name = component?.type.__name;
  let isUnmounted = false;

  // Use reference counting and automatically release if there is no reference
  onUnmounted(() => {
    isUnmounted = true;

    refSet.forEach((key) => {
      const refMapValue = referenceMap.get(key) ?? 0;
      if (refMapValue - 1 <= 0) {
        referenceMap.delete(key);
        stateInstanceMap.delete(key);
      } else {
        referenceMap.set(key, refMapValue - 1);
      }
    });
  });

  const refAdd = (id: string) => {
    if (refSet.has(id)) return;
    refSet.add(id);
    const refMapValue = referenceMap.get(id) ?? 0;
    referenceMap.set(id, refMapValue + 1);
  };

  const getState = <T>(category: string, key?: string | number) => {
    const id = `${category}-${key}`;
    if (isUnmounted)
      throw new Error(
        `Component ${name} has been UnMounted and can no longer execute the getState("${id}") function to getState.`
      );
    refAdd(id);
    if (!stateInstanceMap.has(id)) {
      stateInstanceMap.set(id, ref(undefined));
    }
    return stateInstanceMap.get(id) as Ref<T | undefined>;
  };

  const setState = <T>(category: string, key: string | number, value: T) => {
    const id = `${category}-${key}`;
    if (isUnmounted)
      throw new Error(
        `Component ${name} has been UnMounted and can no longer execute the setState("${id}") function to set state management data.`
      );
    refAdd(id);
    if (stateInstanceMap.has(id)) {
      stateInstanceMap.get(id)!.value = value;
    } else {
      stateInstanceMap.set(id, ref(value));
    }
  };

  return {
    getState,
    setState,
  };
}
