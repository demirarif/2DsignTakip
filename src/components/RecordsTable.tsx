import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Record } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Trash2, Edit } from 'lucide-react';

interface RecordsTableProps {
  records: Record[];
  onDelete: (id: number) => void;
  onEdit: (record: Record) => void;
  onPhotoClick?: (url: string) => void; // ✅ yeni eklendi
}

export const RecordsTable: React.FC<RecordsTableProps> = ({
  records,
  onDelete,
  onEdit,
  onPhotoClick,
}) => {
  const getStatusColor = (durum: string) => {
    switch (durum) {
      case 'Açık':
        return 'bg-blue-500 text-white';
      case 'Hatalı':
        return 'bg-red-500 text-white';
      case 'Kapalı':
        return 'bg-gray-500 text-white';
      case 'Tamamlandı':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kayıtlar ({records.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Lokasyon</TableHead>
                <TableHead>Atanan</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Yorum</TableHead>
                <TableHead>QR Kod</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Fotoğraf</TableHead>
                <TableHead className="text-center">İşlem</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-gray-500 py-6">
                    Henüz kayıt eklenmemiş
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.id}</TableCell>
                    <TableCell>{record.lokasyon}</TableCell>
                    <TableCell>{record.atanan}</TableCell>

                    <TableCell>
                      <Badge className={getStatusColor(record.durum)}>
                        {record.durum}
                      </Badge>
                    </TableCell>

                    <TableCell className="max-w-xs truncate">{record.aciklama || '—'}</TableCell>
                    <TableCell className="max-w-xs truncate">{record.yorum || '—'}</TableCell>
                    <TableCell>{record.qrKod || '—'}</TableCell>
                    <TableCell>{formatDate(record.tarih)}</TableCell>

                    <TableCell>
                      {record.photo ? (
                        <img
                          src={record.photo}
                          alt="Kayıt"
                          className="w-16 h-16 object-cover rounded shadow-sm border cursor-pointer hover:scale-105 transition-transform"
                          title="Büyütmek için tıkla"
                          onClick={() => onPhotoClick && onPhotoClick(record.photo)} // ✅ tıklanabilir hale getirildi
                        />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>

                    <TableCell className="flex gap-2 justify-center">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => onEdit(record)}
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDelete(record.id)}
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
