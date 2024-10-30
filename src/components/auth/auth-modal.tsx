import { createSignal } from 'solid-js';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Stepper, StepperItem } from '../ui/Stepper';
import { LoginForm } from './login';
import { SignupForm } from './signup';

export const AuthModal = () => {
  const [step, setStep] = createSignal(0);

  return (
    <Dialog open={true}>
      <DialogContent>
        <Stepper step={step()} onStepChange={setStep}>
          <StepperItem>
            <DialogHeader>
              <DialogTitle class="text-center">Login</DialogTitle>
            </DialogHeader>
            <LoginForm />

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
