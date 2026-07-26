import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InventoryItem } from '@/types/inventory';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const inventoryFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Product name is required'),
    currentStock: z.coerce.number().int().min(0, 'Stock must be 0 or greater'),
    reorderPoint: z.coerce.number().int().min(0, 'Reorder point must be 0 or greater'),
    maxStock: z.coerce.number().int().min(1, 'Max stock must be at least 1'),
    location: z.string().trim().min(1, 'Location is required'),
    category: z.string().trim().min(1, 'Category is required'),
  })
  .refine(data => data.reorderPoint <= data.maxStock, {
    message: 'Reorder point cannot exceed max stock',
    path: ['reorderPoint'],
  })
  .refine(data => data.currentStock <= data.maxStock, {
    message: 'Current stock cannot exceed max stock',
    path: ['currentStock'],
  });

export type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

const DEFAULT_CATEGORIES = [
  'Antibiotics',
  'Pain Relief',
  'Diabetes',
  'Cardiovascular',
  'Gastric',
  'Endocrine',
  'Diuretics',
  'Corticosteroids',
  'Neurological',
  'Psychiatric',
  'Anticoagulants',
  'Respiratory',
];

interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  item?: InventoryItem | null;
  locations: string[];
  categories: string[];
  onSubmit: (values: InventoryFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const emptyValues: InventoryFormValues = {
  name: '',
  currentStock: 0,
  reorderPoint: 0,
  maxStock: 100,
  location: '',
  category: DEFAULT_CATEGORIES[0],
};

export const InventoryFormDialog: React.FC<InventoryFormDialogProps> = ({
  open,
  onOpenChange,
  mode,
  item,
  locations,
  categories,
  onSubmit,
  isSubmitting = false,
}) => {
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && item) {
      form.reset({
        name: item.name,
        currentStock: item.currentStock,
        reorderPoint: item.reorderPoint,
        maxStock: item.maxStock,
        location: item.location,
        category: item.category,
      });
      return;
    }

    form.reset({ ...emptyValues, location: locations[0] ?? '' });
  }, [open, mode, item, form, locations]);

  const locationOptions = locations;
  const categoryOptions = [...new Set([...DEFAULT_CATEGORIES, ...categories])];

  const handleSubmit = form.handleSubmit(async values => {
    await onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Inventory Item' : 'Edit Inventory Item'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'edit' && item && (
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Product ID: </span>
                <span className="font-medium">{item.id}</span>
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Amoxicillin 500mg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="currentStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Stock</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reorderPoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Point</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Stock</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locationOptions.map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : mode === 'create'
                    ? 'Add Product'
                    : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
