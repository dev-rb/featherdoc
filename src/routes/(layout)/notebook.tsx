import { RichEditor } from '~/components/ui/rich-editor';

export default function Notebook() {
  return (
    <div class="w-full h-full grid grid-cols-[1fr_2fr_1fr] p-4">
      <div />
      <div class="w-full h-full bg-neutral-600 rounded-lg p-4">
        <RichEditor class="w-full h-full focus:outline-none text-white" />
      </div>
      <div />
    </div>
  );
}
