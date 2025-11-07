import React from "react";
import { Dialog, DialogContent } from "./ui/dialog";

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl?: string;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({ isOpen, onClose, photoUrl }) => {
  if (!photoUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-transparent border-none shadow-none p-0">
        <div
          className="relative flex justify-center items-center bg-black/70 rounded-lg overflow-hidden"
          onClick={onClose}
        >
          <img
            src={photoUrl}
            alt="Büyük Önizleme"
            className="max-h-[80vh] max-w-full object-contain cursor-zoom-out"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
