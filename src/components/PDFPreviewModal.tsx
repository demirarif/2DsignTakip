import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Download, X } from 'lucide-react';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfData: string;
  onDownload: () => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  pdfData,
  onDownload
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>PDF Önizleme</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {pdfData ? (
            <iframe
              src={pdfData}
              className="w-full h-full border rounded"
              title="PDF Önizleme"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              PDF yükleniyor...
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Kapat
          </Button>
          <Button onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            İndir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
