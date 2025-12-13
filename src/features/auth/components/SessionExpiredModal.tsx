// features/auth/components/SessionExpiredModal.tsx
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SessionExpiredModal({
  isOpen,
  onClose,
  onConfirm,
}: SessionExpiredModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Expired</DialogTitle>
          <DialogDescription>
            Your session has expired due to inactivity. Please log in again to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            onClick={onConfirm}
            className="w-full"
          >
            Log In Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}