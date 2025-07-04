'use client';

import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Plus } from 'lucide-react';

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onAdd?: () => void;
  onRowClick?: (item: T) => void;
  addButtonLabel?: string;
  isLoading?: boolean;
}

export default function DataTable<T extends { id?: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  onAdd,
  onRowClick,
  addButtonLabel = 'Añadir',
  isLoading = false
}: DataTableProps<T>) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const handleEdit = (item: T) => {
    setSelectedItem(item);
    onEdit?.(item);
  };

  const handleDelete = (item: T) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      onDelete?.(item);
    }
  };

  return (
    <div className="space-y-4">
      {onAdd && (
        <div className="flex justify-end">
          <Button 
            onClick={onAdd}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>{addButtonLabel}</span>
          </Button>
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.header}>
                  {column.header}
                </TableHead>
              ))}
              {(onEdit || onDelete) && (
                <TableHead className="w-[80px]">
                  Acciones
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="h-24 text-center"
                >
                  Cargando...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="h-24 text-center"
                >
                  No hay datos disponibles
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow 
                  key={item.id}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey as string}>
                      {column.cell 
                        ? column.cell(item)
                        : item[column.accessorKey] as React.ReactNode}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            aria-label="Abrir menú"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem 
                              onClick={() => handleDelete(item)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
