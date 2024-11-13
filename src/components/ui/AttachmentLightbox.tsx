import { Dialog } from '@kobalte/core/dialog';
import { DialogOverlay } from './Dialog';
import { FlowComponent } from 'solid-js';

interface AttachmentLightboxProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AttachmentLightbox: FlowComponent<AttachmentLightboxProps> = (props) => {
  return (
    <Dialog open={props.open} defaultOpen={props.defaultOpen} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <div class="fixed inset-0 z-50 flex items-start justify-center sm:items-center p-4 lg:p-20">
          <DialogOverlay />

          <Dialog.Content class="z-50 flex-center m-auto">
            <Dialog.CloseButton class="flex-center fixed right-4 top-4 rounded-full p-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-99 cursor-pointer hover:bg-secondary">
              <i class="i-lucide-x text-white inline-block text-xl leading-none" />
              <span class="sr-only">Close</span>
            </Dialog.CloseButton>
            {props.children}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog>
  );
};
