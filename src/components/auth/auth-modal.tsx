import { createSignal } from 'solid-js';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Stepper, StepperItem } from '../ui/Stepper';
import { LoginForm } from './login';
import { SignupForm } from './signup';
import { usePocketbase } from '../pocketbase-context';
import { isTokenExpired } from 'pocketbase';

export const AuthModal = () => {
  const pb = usePocketbase()
  const [step, setStep] = createSignal(0);

  return (
    <Dialog defaultOpen={!pb.authStore.isValid || !pb.authStore.token || isTokenExpired(pb.authStore.token)}>
      <DialogContent>
        <Stepper step={step()} onStepChange={setStep}>
          <StepperItem>
            <DialogHeader>
              <DialogTitle class="text-center">Login</DialogTitle>
            </DialogHeader>
            <LoginForm>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep(1);
                  }}
                >
                  Sign up
                </Button>
                <Button type="submit">Login</Button>
              </DialogFooter>
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
              }}
            >
              <i class="i-lucide-arrow-left inline-block text-xl text-white" />
            </Button>
            <DialogHeader>
              <DialogTitle class="text-center self-center">Sign up</DialogTitle>
            </DialogHeader>
            <SignupForm>
              <DialogFooter>
                <Button type="submit">Sign up</Button>
              </DialogFooter>
            </SignupForm>
          </StepperItem>
        </Stepper>
      </DialogContent>
    </Dialog>
  );
};
