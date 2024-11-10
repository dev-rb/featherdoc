import { getAppTheme, setAppTheme } from '~/lib/theme';
import { ToggleButton } from '../ui/ToggleButton';
import { cn } from '~/lib/utils';

export const ThemeToggle = () => {
  return (
    <ToggleButton
      size="icon"
      class="w-full py-8 rounded-none text-2xl hover:bg-secondary"
      pressed={getAppTheme() === 'light'}
      onChange={() => {
        const current = getAppTheme();

        setAppTheme(current === 'dark' ? 'light' : 'dark');
      }}
    >
      {(state) => <i class={cn('dark:(text-white)', state.pressed() ? 'i-lucide-sun' : 'i-lucide-moon')} />}
    </ToggleButton>
  );
};
