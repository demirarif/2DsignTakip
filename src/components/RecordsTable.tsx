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
  onEdit: (record: Record) => void; // ✅ eklendi
}

export const RecordsTable: React.FC<RecordsTableProps> = ({ records, onDelete, onEdit }) => {
  const getStatusColor = (durum: string) => {
    switch (durum) {
      case 'Açık':
        return 'bg-blue-500';
      case 'Hatalı':
        return 'bg-red-500';
      case 'Kapalı':
        return 'bg-gray-500';
      case 'Tamamlandı':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
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
                <TableHead>İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-gray-500">
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
                    <TableCell className="max-w-xs truncate">{record.aciklama}</TableCell>
                    <TableCell className="max-w-xs truncate">{record.yorum}</TableCell>
                    <TableCell>{record.qrKod}</TableCell>
                    <TableCell>{record.tarih}</TableCell>
                    <TableCell>
                      {record.photo && (
                        <img src={record.photo} alt="Kayıt" className="w-16 h-16 object-cover rounded" />
                      )}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      {/* ✅ yeni: Düzenle */}
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => onEdit(record)}
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {/* mevcut: Sil */}
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
