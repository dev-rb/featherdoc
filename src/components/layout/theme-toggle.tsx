import { getAppTheme, setAppTheme } from '~/lib/theme';
import { ToggleButton } from '../ui/ToggleButton';
import { cn } from '~/lib/utils';

export const ThemeToggle = () => {
  return (
    <ToggleButton
      size="icon"
      class="text-2xl hover:bg-secondary"
      onChange={() => {
        const current = getAppTheme();

        setAppTheme(current === 'dark' ? 'light' : 'dark');
      }}
    >
      {(state) => <i class={cn('dark:(text-white)', state.pressed() ? 'i-lucide-sun' : 'i-lucide-moon')} />}
    </ToggleButton>
  );
};
