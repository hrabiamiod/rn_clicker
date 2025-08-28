import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'wouter';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { insertListingSchema, Category } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, ArrowLeft, Shield } from 'lucide-react';

const formSchema = insertListingSchema.extend({
  price: z.string().optional().refine((val) => {
    if (!val) return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, 'Cena musi być liczbą większą lub równą 0'),
});

type FormData = z.infer<typeof formSchema>;

export default function AddListing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      price: '',
      contactEmail: user?.email || '',
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
    onSuccess: (data) => {
      toast({
        title: 'Sukces!',
        description: 'Ogłoszenie zostało dodane i oczekuje na moderację.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      navigate(`/listing/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Błąd',
        description: error.message || 'Nie udało się dodać ogłoszenia. Spróbuj ponownie.',
        variant: 'destructive',
      });
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Zaloguj się</h1>
          <p className="text-muted-foreground mb-4">
            Musisz być zalogowany, aby dodać ogłoszenie.
          </p>
          <Link href="/">
            <Button>Powrót na stronę główną</Button>
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót na stronę główną
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">Dodaj nowe ogłoszenie</h1>
        <p className="text-muted-foreground">
          Wypełnij formularz poniżej, aby dodać swoje ogłoszenie. 
          Zostanie ono zweryfikowane przed publikacją.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Szczegóły ogłoszenia</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div className="flex justify-end space-x-3 pt-6">
                    <Link href="/">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={createMutation.isPending}
                      >
                        Anuluj
                      </Button>
                    </Link>
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💡 Wskazówki</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">Dobry tytuł</h4>
                <p className="text-muted-foreground">
                  Używaj konkretnych słów opisujących przedmiot, markę i stan.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Szczegółowy opis</h4>
                <p className="text-muted-foreground">
                  Im więcej szczegółów, tym więcej zainteresowanych kupujących.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Uczciwa cena</h4>
                <p className="text-muted-foreground">
                  Sprawdź ceny podobnych przedmiotów na rynku.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Safety Card */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium text-green-700 mb-2">
                    Bezpieczeństwo i moderacja
                  </h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Automatyczna weryfikacja treści</li>
                    <li>• Ochrona przed spamem</li>
                    <li>• Szybka publikacja po akceptacji</li>
                    <li>• Bezpieczna komunikacja z kupującymi</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Process Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📋 Proces publikacji</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</div>
                <span>Wypełnij formularz</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center">2</div>
                <span>Automatyczna moderacja (2-5 min)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center">3</div>
                <span>Publikacja ogłoszenia</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center">4</div>
                <span>Kontakt od zainteresowanych</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}