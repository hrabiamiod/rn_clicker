import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { insertListingSchema, Category } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

const formSchema = insertListingSchema.extend({
  price: z.string().optional().refine((val) => {
    if (!val) return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, 'Cena musi być liczbą większą lub równą 0'),
});

type FormData = z.infer<typeof formSchema>;

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddListingModal({ isOpen, onClose }: AddListingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    enabled: isOpen,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      price: '',
      contactEmail: '',
      contactPhone: '',
      categoryId: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        price: data.price ? parseFloat(data.price).toString() : undefined,
      };
      return apiRequest('/api/listings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Sukces!',
        description: 'Ogłoszenie zostało dodane i oczekuje na moderację.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Błąd',
        description: error.message || 'Nie udało się dodać ogłoszenia. Spróbuj ponownie.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj nowe ogłoszenie</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategoria *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    disabled={categoriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Wybierz kategorię" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.icon} {category.name}
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tytuł *</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-title"
                      placeholder="Wpisz tytuł ogłoszenia..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis *</FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="textarea-description"
                      placeholder="Opisz szczegóły swojego ogłoszenia..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cena (zł)</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokalizacja *</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-location"
                        placeholder="Miasto, województwo..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email kontaktowy</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-contact-email"
                        type="email"
                        placeholder="twoj@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon kontaktowy</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-contact-phone"
                        type="tel"
                        placeholder="+48 123 456 789"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>💡 Informacja:</strong> Twoje ogłoszenie zostanie automatycznie przeanalizowane przez nasze systemy bezpieczeństwa i zostanie opublikowane po pozytywnej weryfikacji (zazwyczaj w ciągu kilku minut).
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createMutation.isPending}
              >
                Anuluj
              </Button>
              <Button
                data-testid="button-submit"
                type="submit"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Dodaj ogłoszenie
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}