import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface StatsCardProps {
  title: string;
  value: number;
  color: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, color }) => {
  return (
    <Card className={`${color} text-white`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl">{value}</div>
      </CardContent>
    </Card>
  );
};
