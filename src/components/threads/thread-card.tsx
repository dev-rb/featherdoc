import { A } from '@solidjs/router';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Show, VoidComponent } from 'solid-js';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { createMutation, invalidateQuery } from '~/lib/pocketbase';
import { useApp } from '../app-context';
import { UsersResponse } from '~/types/pocketbase-gen';
import { Button } from '../ui/Button';

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
  const app = useApp();

  const deleteThread = createMutation('threads', 'delete', {
    async onSuccess() {
      await invalidateQuery('threads/getList');
    },
  });

  const handleDelete = () => {
    if (app.session().userId === props.author.id) {
      deleteThread.mutate(props.id);
    }
  };

  return (
    <Card class="select-none bg-muted-foreground/20 border-0">
      <A href={`/threads/${props.id}`}>
        <CardHeader>
          <div class="w-full flex items-center justify-between">
            <span class="text-xs text-white px-2 py-1 bg-blue-600/50 rounded-full">
              {props.author.name || props.author.username}
            </span>
            <span class="text-xs text-foreground/50">{dayjs(props.timestamp).fromNow()}</span>
          </div>
          <CardTitle class="leading-normal line-clamp-2 text-muted-foreground">{props.title}</CardTitle>
        </CardHeader>
        <CardContent class="text-sm text-foreground/50">{props.description}</CardContent>
      </A>
      <CardFooter class="gap-4">
        <div class="w-6 h-6 flex-center text-foreground/50 bg-foreground/10 rounded-md">
          <i class="i-lucide-check inline-block" />
        </div>
        <div class="w-auto h-6 text-lg flex-center gap-2 text-foreground/50 rounded-md">
          <i class="i-lucide-message-square inline-block" />
          <span class="text-base font-semibold">{props.totalReplies}</span>
        </div>

        <Show when={app.session().userId === props.author.id}>
          <Button
            class="ml-auto size-8"
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            loading={deleteThread.isPending}
          >
            <i class="i-lucide-trash inline-block" />
          </Button>
        </Show>
      </CardFooter>
    </Card>
  );
};
