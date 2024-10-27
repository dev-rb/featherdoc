import { A } from '@solidjs/router';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';

export const ThreadCard = () => {
  return (
    <Card as={A} class="select-none bg-primary/8 border-0" href={`/threads/${1}`}>
      <CardHeader>
        <CardTitle class="leading-normal line-clamp-2 text-white/70">
          function Component vs arrow function name preference with a really long title just for testing purposes
        </CardTitle>
        <div class="w-full flex items-center justify-between">
          <span class="text-xs text-white/70 px-2 py-1 bg-blue-600/50 rounded-full">dev-rb</span>
          <span class="text-xs text-white/50">8h ago</span>
        </div>
      </CardHeader>
      <CardContent class="text-sm text-white/50">
        What function form should you use for components? I know it's all preference but I'd like to know what the
        standard is or what other people prefer and why.
      </CardContent>
      <CardFooter class="gap-4">
        <div class="w-6 h-6 flex-center text-white/50 bg-white/10 rounded-md">
          <i class="i-lucide-check inline-block" />
        </div>
        <div class="w-auto h-6 text-lg flex-center gap-2 text-white/50 rounded-md">
          <i class="i-lucide-message-square inline-block" />
          <span class="text-base font-semibold">5</span>
        </div>
      </CardFooter>
    </Card>
  );
};
