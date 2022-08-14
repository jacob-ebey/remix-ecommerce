import * as React from "react";

export function useNoFlash<Value>(
  value: Value,
  { delay, showFor }: { delay: number; showFor: number }
) {
  let [state, setState] = React.useState<{ setAt: number; value: Value }>({
    setAt: Date.now(),
    value,
  });
  let valueToUse = "value" in state ? state.value : value;

  React.useEffect(() => {
    if (value === state.value) {
      return;
    }

    let stillNeedToShowFor = showFor - (Date.now() - state.setAt);
    let totalDelay = delay + stillNeedToShowFor;

    let timeout = setTimeout(() => {
      setState({
        setAt: Date.now(),
        value,
      });
    }, totalDelay);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, state]);

  return valueToUse;
}
