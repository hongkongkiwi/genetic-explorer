import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/Card';

interface SNPData {
  rsid: string;
  gene: string;
  chromosome: string;
  position: number;
  genotype: string;
  impact: 'High' | 'Moderate' | 'Low' | 'Protective';
  category: string;
}

const sampleData: SNPData[] = [
  { rsid: 'rs1801133', gene: 'MTHFR', chromosome: '1', position: 11856378, genotype: 'CT', impact: 'High', category: 'Methylation' },
  { rsid: 'rs662', gene: 'PON1', chromosome: '7', position: 94952378, genotype: 'AG', impact: 'Moderate', category: 'Cardiovascular' },
  { rsid: 'rs429358', gene: 'APOE', chromosome: '19', position: 45411941, genotype: 'TC', impact: 'High', category: 'Cardiovascular' },
  { rsid: 'rs7412', gene: 'APOE', chromosome: '19', position: 45412079, genotype: 'CC', impact: 'Moderate', category: 'Cardiovascular' },
  { rsid: 'rs1815739', gene: 'ACTN3', chromosome: '11', position: 66560624, genotype: 'TT', impact: 'Low', category: 'Fitness' },
  { rsid: 'rs4680', gene: 'COMT', chromosome: '22', position: 19951271, genotype: 'AA', impact: 'Moderate', category: 'Cognitive' },
  { rsid: 'rs9939609', gene: 'FTO', chromosome: '16', position: 53800965, genotype: 'AT', impact: 'Moderate', category: 'Weight' },
  { rsid: 'rs762551', gene: 'CYP1A2', chromosome: '15', position: 75041917, genotype: 'AA', impact: 'Moderate', category: 'Drug Metabolism' },
  { rsid: 'rs1544410', gene: 'VDR', chromosome: '12', position: 48241299, genotype: 'BB', impact: 'Low', category: 'Nutrition' },
  { rsid: 'rs12722', gene: 'COL5A1', chromosome: '9', position: 137660239, genotype: 'CC', impact: 'Protective', category: 'Fitness' },
];

const columns: ColumnDef<SNPData>[] = [
  {
    accessorKey: 'rsid',
    header: 'RSID',
    cell: (info) => <span className="font-mono text-sm">{info.getValue() as string}</span>,
  },
  {
    accessorKey: 'gene',
    header: 'Gene',
    cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
  },
  {
    accessorKey: 'chromosome',
    header: 'Chr',
    cell: (info) => <span className="text-center">{info.getValue() as string}</span>,
  },
  {
    accessorKey: 'position',
    header: 'Position',
    cell: (info) => (info.getValue() as number).toLocaleString(),
  },
  {
    accessorKey: 'genotype',
    header: 'Genotype',
    cell: (info) => <span className="font-mono">{info.getValue() as string}</span>,
  },
  {
    accessorKey: 'impact',
    header: 'Impact',
    cell: (info) => {
      const impact = info.getValue() as string;
      const colors: Record<string, string> = {
        'High': 'bg-red-100 text-red-700',
        'Moderate': 'bg-yellow-100 text-yellow-700',
        'Low': 'bg-blue-100 text-blue-700',
        'Protective': 'bg-green-100 text-green-700',
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[impact] || 'bg-gray-100'}`}>
          {impact}
        </span>
      );
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
];

export function TanStackTableExample() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data: sampleData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>TanStack Table Example</CardTitle>
        <CardDescription>
          Sortable, filterable, and paginated table using @tanstack/react-table
        </CardDescription>
        <div className="flex items-center gap-2 pt-4">
          <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/80"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' ↑',
                          desc: ' ↓',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length} of {sampleData.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
