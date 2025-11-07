import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Record } from '../types';
import { Upload } from 'lucide-react';
import { saveRecord } from '../utils/saveRecord'; // 🔵 Supabase entegrasyonu

interface RecordFormProps {
  onSubmit: (record: Omit<Record, 'id' | 'tarih'>) => void;
}

export const RecordForm: React.FC<RecordFormProps> = ({ onSubmit }) => {
  const [lokasyon, setLokasyon] = useState('');
  const [atanan, setAtanan] = useState('');
  const [durum, setDurum] = useState<'Açık' | 'Hatalı' | 'Kapalı' | 'Tamamlandı'>('Açık');
  const [aciklama, setAciklama] = useState('');
  const [yorum, setYorum] = useState('');
  const [qrKod, setQrKod] = useState('');
  const [photo, setPhoto] = useState('');
  const [dosya, setDosya] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔵 Supabase'e gönderilecek gerçek dosyayı da tutacağız
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file); // 🔵 Dosyayı upload için kaydet
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            const maxWidth = 400;
            const maxHeight = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);
            
            const base64 = canvas.toDataURL('image/jpeg', 0.8);
            setPhoto(base64);
            setPhotoPreview(base64);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lokasyon || !atanan) {
      alert('Lütfen zorunlu alanları doldurun!');
      return;
    }

    // 🔵 Supabase'e kaydet
    try {
      await saveRecord(
        lokasyon,
        `${atanan} - ${durum}`,
        photoFile || undefined,
        undefined // PDF ileride eklenecek
      );
      console.log('Kayıt başarılı!');
    } catch (error) {
      console.error('Kayıt başarısız:', error);
    }

    // 🔵 Mevcut sistemdeki parent callback çalışsın
    onSubmit({
      lokasyon,
      atanan,
      durum,
      aciklama,
      yorum,
      qrKod,
      photo,
      dosya
    });

    // Form temizle
    setLokasyon('');
    setAtanan('');
    setDurum('Açık');
    setAciklama('');
    setYorum('');
    setQrKod('');
    setPhoto('');
    setDosya('');
    setPhotoPreview('');
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni Kayıt Ekle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lokasyon">Lokasyon *</Label>
              <Input
                id="lokasyon"
                value={lokasyon}
                onChange={(e) => setLokasyon(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="atanan">Atanan Kişi *</Label>
              <Input
                id="atanan"
                value={atanan}
                onChange={(e) => setAtanan(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="durum">Durum</Label>
              <Select value={durum} onValueChange={(value: any) => setDurum(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Açık">Açık</SelectItem>
                  <SelectItem value="Hatalı">Hatalı</SelectItem>
                  <SelectItem value="Kapalı">Kapalı</SelectItem>
                  <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="qrKod">QR Kod</Label>
              <Input
                id="qrKod"
                value={qrKod}
                onChange={(e) => setQrKod(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="aciklama">Açıklama</Label>
            <Textarea
              id="aciklama"
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="yorum">Yorum</Label>
            <Textarea
              id="yorum"
              value={yorum}
              onChange={(e) => setYorum(e.target.value)}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="photo">Fotoğraf Yükle</Label>
            <div className="flex items-center gap-4">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                ref={fileInputRef}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {photoPreview && (
              <div className="mt-4">
                <p className="text-sm mb-2">Önizleme:</p>
                <img src={photoPreview} alt="Önizleme" className="max-w-xs border rounded" />
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="dosya">Dosya</Label>
            <Input
              id="dosya"
              value={dosya}
              onChange={(e) => setDosya(e.target.value)}
              placeholder="Dosya yolu veya adı"
            />
          </div>
          
          <Button type="submit" className="w-full">Kayıt Ekle</Button>
        </form>
      </CardContent>
    </Card>
  );
};
