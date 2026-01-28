import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SortType } from '@/types';

interface SortTabsProps {
  value: SortType;
  onChange: (value: SortType) => void;
}

export function SortTabs({ value, onChange }: SortTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as SortType)}>
      <TabsList>
        <TabsTrigger value="hot">🔥 Hot</TabsTrigger>
        <TabsTrigger value="new">🆕 New</TabsTrigger>
        <TabsTrigger value="top">⭐ Top</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
