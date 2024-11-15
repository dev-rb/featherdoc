import { createSignal } from 'solid-js';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Stepper, StepperItem } from '../ui/Stepper';
import { LoginForm } from './login';
import { SignupForm } from './signup';
import { useApp } from '../app-context';
import { createOnlineStatus } from '~/lib/primitives';

export const AuthModal = () => {
  const app = useApp();
  const [step, setStep] = createSignal(0);

  const isOnline = createOnlineStatus();

  return (
    <Dialog open={!app.authed() && isOnline()} modal={true}>
      <DialogContent>
        <Stepper step={step()} onStepChange={setStep}>
          <StepperItem>
            <DialogHeader>
              <DialogTitle class="text-center">Login</DialogTitle>
            </DialogHeader>
            <LoginForm>
              {(state) => (
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep(1);
                      document.getElementById('email-input')?.focus();
                    }}
                  >
                    Sign up
                  </Button>
                  <Button type="submit" loading={state.pending()} disabled={state.pending()}>
                    Login
                  </Button>
                </DialogFooter>
              )}
            </LoginForm>
          </StepperItem>
          <StepperItem>
            <Button
              class="absolute top-2 left-2"
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setStep(0);
                document.getElementById('email-input')?.focus();
              }}
            >
              <i class="i-lucide-arrow-left inline-block text-xl text-white" />
            </Button>
            <DialogHeader>
              <DialogTitle class="text-center self-center">Sign up</DialogTitle>
            </DialogHeader>
            <SignupForm>
              {(state) => (
                <DialogFooter>
                  <Button type="submit" loading={state.pending()} disabled={state.pending()}>
                    Sign up
                  </Button>
                </DialogFooter>
              )}
            </SignupForm>
          </StepperItem>
        </Stepper>
      </DialogContent>
    </Dialog>
  );
};
