"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface RegisterSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

const RegisterSuccessModal: React.FC<RegisterSuccessModalProps> = ({ open, onClose }) => {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-600">
            🎉 Registration Successful!
          </DialogTitle>
        </DialogHeader>
        <p className="text-gray-600 mt-2">
          Your account has been registered.<br />
          You will be notified after approval.
        </p>

        <DialogFooter className="mt-6">
          <Button
            onClick={() => {
              onClose();
              router.push("/login");
            }}
            className="w-full"
          >
            Go to Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterSuccessModal;
