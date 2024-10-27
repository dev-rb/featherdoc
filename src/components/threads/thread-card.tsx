import { A } from '@solidjs/router';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { VoidComponent } from 'solid-js';

interface ThreadCardProps {
  title: string;
  description: string;
  author: string;
  timestamp?: number;
  totalReplies: number;
  resolved?: boolean;
}

export const ThreadCard: VoidComponent<ThreadCardProps> = (props) => {
  return (
    <Card as={A} class="select-none bg-muted-foreground/20 border-0" href={`/threads/${1}`}>
      <CardHeader>
        <div class="w-full flex items-center justify-between">
          <span class="text-xs text-white px-2 py-1 bg-blue-600/50 rounded-full">{props.author}</span>
          <span class="text-xs text-foreground/50">8h ago</span>
        </div>
        <CardTitle class="leading-normal line-clamp-2 text-muted-foreground">{props.title}</CardTitle>
      </CardHeader>
      <CardContent class="text-sm text-foreground/50">{props.description}</CardContent>
      <CardFooter class="gap-4">
        <div class="w-6 h-6 flex-center text-foreground/50 bg-foreground/10 rounded-md">
          <i class="i-lucide-check inline-block" />
        </div>
        <div class="w-auto h-6 text-lg flex-center gap-2 text-foreground/50 rounded-md">
          <i class="i-lucide-message-square inline-block" />
          <span class="text-base font-semibold">{props.totalReplies}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
