import { AuthModal } from '~/components/auth/auth-modal';

export default function Home() {
  return (
    <main class="w-full h-full grid grid-cols-12 grid-rows-12 bg-background">
      <AuthModal />
      <div class="place-self-center w-full h-full text-center bg-muted col-start-2 col-end-12 row-start-2 row-end-12 rounded-2xl text-center text-xl flex-center flex-col gap-4 text-primary">
        ✍(◔◡◔)
        <span>Dashboad coming soon</span>
      </div>
    </main>
  );
}
