import { createControllableSignal } from '@kobalte/core';
import {
  createContext,
  createSignal,
  createUniqueId,
  FlowComponent,
  JSX,
  onCleanup,
  onMount,
  Show,
  useContext,
} from 'solid-js';

export interface StepItem {
  id: string;
  prev?: number;
  next?: number;
}

interface StepperContextValues {
  getIndex: (id: string) => number;
  registerItem: (item: StepItem) => number;
  unregisterItem: (id: string) => void;
  goNext: VoidFunction;
  goPrev: VoidFunction;
  isActive: (id: string) => boolean;
}

const StepperContext = createContext<StepperContextValues>();

export const useStepper = () => {
  const context = useContext(StepperContext);

  if (!context) {
    throw new Error('[useStepper] can only be used under a StepperContext');
  }

  return context;
};

interface StepperProps {
  step?: number;
  defaultStep?: number;
  onStepChange?: (next: number) => void;
}

export const Stepper: FlowComponent<StepperProps> = (props) => {
  const [steps, setSteps] = createSignal<StepItem[]>([]);

  const [currentStep, setCurrentStep] = createControllableSignal({
    value: () => props.step ?? 0,
    onChange: props.onStepChange,
    defaultValue: () => props.defaultStep ?? 0,
  });

  const getIndex = (id: string) => {
    return steps().findIndex((step) => step.id === id);
  };

  const goNext = () => {
    const currentItem = steps()[currentStep() ?? 0];
    if (currentItem.next !== undefined) {
      setCurrentStep(currentItem.next);
      return;
    }
    setCurrentStep((p) => p + 1);
  };

  const goPrev = () => {
    const currentItem = steps()[currentStep() ?? 0];
    if (currentItem.prev !== undefined) {
      setCurrentStep(currentItem.prev);
      return;
    }
    setCurrentStep((p) => p - 1);
  };

  const unregisterItem = (id: string) => {
    setSteps((p) => p.filter((step) => step.id !== id));
  };

  const isActive = (id: string) => {
    return currentStep() === getIndex(id);
  };

  return (
    <StepperContext.Provider
      value={{
        registerItem(item) {
          if (steps().find((step) => step.id === item.id) !== undefined) {
            throw new Error('Conflicting ids in stepper. Ids must be unique.');
          }

          const length = steps().length;

          setSteps((p) => [...p, item]);
          return length;
        },
        getIndex,
        unregisterItem,
        goNext,
        goPrev,
        isActive,
      }}
    >
      {props.children}
    </StepperContext.Provider>
  );
};

interface StepperItemProps {
  id?: string;
  prev?: number;
  next?: number;
  fallback?: JSX.Element;
}

export const StepperItem: FlowComponent<StepperItemProps> = (props) => {
  const { isActive, registerItem, unregisterItem } = useStepper();

  const ITEM_ID = props.id ?? `step-${createUniqueId()}`;

  onMount(() => {
    registerItem({ id: ITEM_ID, next: props.next, prev: props.prev });

    onCleanup(() => {
      unregisterItem(ITEM_ID);
    });
  });

  return (
    <Show when={isActive(ITEM_ID)} fallback={props.fallback}>
      {props.children}
    </Show>
  );
};
