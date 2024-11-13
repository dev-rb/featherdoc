import { A, useParams } from '@solidjs/router';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { createMemo, VoidComponent } from 'solid-js';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { UsersResponse } from '~/types/pocketbase-gen';
import { cn } from '~/lib/utils';

dayjs.extend(relativeTime);

interface ThreadCardProps {
  id: string;
  title: string;
  description?: string;
  author: UsersResponse;
  timestamp: string;
  totalReplies: number;
  resolved?: boolean;
}

export const ThreadCard: VoidComponent<ThreadCardProps> = (props) => {
  const params = useParams();

  const isActive = createMemo(() => params.id === props.id);

  return (
    <Card
      class={cn(
        'select-none bg-transparent border-y-1 border-y-secondary border-x-0 rounded-none',
        isActive() ? 'bg-primary/20 border-y-primary' : 'hover:bg-secondary'
      )}
    >
      <A href={`/threads/${props.id}`}>
        <CardHeader class="pb-2">
          <div class="w-full flex items-center justify-between">
            <span class="text-xs text-white px-2 py-1 bg-blue-600/50 rounded-full">
              {props.author.name || props.author.username}
            </span>
            <span class={cn('text-xs text-foreground/50', isActive() && 'text-primary/50')}>
              {dayjs(props.timestamp).fromNow()}
            </span>
          </div>
          <CardTitle class={cn('leading-normal line-clamp-2 text-muted-foreground', isActive() && 'text-white')}>
            {props.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span class={cn('text-sm text-foreground/50 line-clamp-1 max-h-fit', isActive() && 'text-primary/70')}>
            {props.description}
          </span>
        </CardContent>
      </A>
      <CardFooter class="gap-4">
        <div
          class={cn(
            'w-6 h-6 flex-center text-foreground/50 bg-foreground/10 rounded-md',
            isActive() && 'bg-primary/10 text-primary/90',
            props.resolved && 'bg-blue-600 text-blue-100'
          )}
        >
          <i class="i-lucide-check inline-block" />
        </div>
        <div
          class={cn(
            'w-auto h-6 text-lg flex-center gap-2 text-foreground/50 rounded-md',
            isActive() && 'text-primary/70'
          )}
        >
          <i class="i-lucide-message-square inline-block" />
          <span class="text-base font-semibold">{props.totalReplies}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
