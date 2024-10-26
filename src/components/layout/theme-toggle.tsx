import { getAppTheme, setAppTheme } from '~/lib/theme';
import { Button } from '../ui/Button';

export const ThemeToggle = () => {
  return (
    <Button
      variant="ghost"
      size="icon"
      class="text-2xl"
      onClick={() => {
        const current = getAppTheme();

        setAppTheme(current === 'dark' ? 'light' : 'dark');
      }}
    >
      <i class="i-lucide-sun dark:(i-lucide-moon text-white)" />
    </Button>
  );
};
