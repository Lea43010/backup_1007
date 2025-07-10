import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ProjectCard } from "../components/project/project-card";
import { PageHeader } from "../components/layout/page-header";
import { MobileNav } from "../components/layout/mobile-nav";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Search, Filter, FolderOpen, Building, Users, Upload } from "lucide-react";
import { Link } from "wouter";
import type { Project, Customer, Company } from "../../shared/schema";

const projectFormSchema = z.object({
  name: z.string().min(1, "Projektname ist erforderlich"),
  description: z.string().min(1, "Beschreibung ist erforderlich"),
  location: z.string().min(1, "Standort ist erforderlich"),
  startDate: z.string().min(1, "Startdatum ist erforderlich"),
  endDate: z.string().min(1, "Enddatum ist erforderlich"),
  budget: z.number().min(0.01, "Budget ist erforderlich"),
  status: z.enum(["planning", "active", "completed", "cancelled"]).default("planning"),
  customerId: z.number().min(1, "Kunde ist erforderlich"),
});

const customerFormSchema = z.object({
  name: z.string().min(1, "Kundenname ist erforderlich"),
  email: z.string().min(1, "E-Mail ist erforderlich").email("Gültige E-Mail-Adresse eingeben"),
  phone: z.string().min(1, "Telefon ist erforderlich"),
  street: z.string().min(1, "Straße ist erforderlich"),
  houseNumber: z.string().min(1, "Hausnummer ist erforderlich"),
  postalCode: z.string().min(1, "PLZ ist erforderlich"),
  city: z.string().min(1, "Ort ist erforderlich"),
});

const companyFormSchema = z.object({
  name: z.string().min(1, "Firmenname ist erforderlich"),
  street: z.string().min(1, "Straße ist erforderlich"),
  houseNumber: z.string().min(1, "Hausnummer ist erforderlich"),
  postalCode: z.string().min(1, "PLZ ist erforderlich"),
  city: z.string().min(1, "Ort ist erforderlich"),
  phone: z.string().min(1, "Telefon ist erforderlich"),
  email: z.string().min(1, "E-Mail ist erforderlich").email("Gültige E-Mail-Adresse eingeben"),
  website: z.string().min(1, "Website ist erforderlich"),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;
type CustomerFormData = z.infer<typeof customerFormSchema>;
type CompanyFormData = z.infer<typeof companyFormSchema>;

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      status: "planning",
    },
  });

  const customerForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      street: "",
      houseNumber: "",
      postalCode: "",
      city: "",
    },
  });

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      street: "",
      houseNumber: "",
      postalCode: "",
      city: "",
      phone: "",
      email: "",
      website: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      return await apiRequest("/api/projects", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Projekt erstellt",
        description: "Das neue Projekt wurde erfolgreich erstellt.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateDialogOpen(false);
      form.reset();
      setUploadedFiles([]);
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Das Projekt konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      return await apiRequest("/api/customers", "POST", data);
    },
    onSuccess: (newCustomer: any) => {
      toast({
        title: "Kunde erstellt",
        description: "Der neue Kunde wurde erfolgreich erstellt.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      customerForm.reset();
      // Automatically select the new customer in the project form
      if (newCustomer && newCustomer.id) {
        form.setValue("customerId", newCustomer.id);
      }
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Der Kunde konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      return await apiRequest("/api/companies", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Firma erstellt",
        description: "Die neue Firma wurde erfolgreich erstellt.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      companyForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Die Firma konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  const onCustomerSubmit = (data: CustomerFormData) => {
    createCustomerMutation.mutate(data);
  };

  const onCompanySubmit = (data: CompanyFormData) => {
    createCompanyMutation.mutate(data);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const filteredProjects = projects.filter(project => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      project.name.toLowerCase().includes(searchLower) ||
      project.id.toString().includes(searchTerm) ||
      (project.description && project.description.toLowerCase().includes(searchLower))
    );
    const matchesFilter = filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusFilters = [
    { value: "all", label: "Alle", count: projects.length },
    { value: "active", label: "Aktiv", count: projects.filter(p => p.status === "active").length },
    { value: "planning", label: "Planung", count: projects.filter(p => p.status === "planning").length },
    { value: "completed", label: "Abgeschlossen", count: projects.filter(p => p.status === "completed").length },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Projekte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-gray-900">Projekte</h1>
              <p className="text-xs text-gray-600">Alle Projekte verwalten</p>
            </div>
          </div>

        </div>
      </PageHeader>

      {/* Search and Filter - Mobile optimiert */}
      <div className="p-3 sm:p-4 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 flex-shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Filter Tags - Mobile scrollbar */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {statusFilters.map((filter) => (
            <Badge
              key={filter.value}
              variant={filterStatus === filter.value ? "default" : "secondary"}
              className={`cursor-pointer whitespace-nowrap flex-shrink-0 px-3 py-2 ${
                filterStatus === filter.value 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setFilterStatus(filter.value)}
            >
              {filter.label} ({filter.count})
            </Badge>
          ))}
        </div>
      </div>

      {/* Projects List - Mobile optimiert */}
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 pb-20">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <Card className="p-8 text-center">
            <CardContent className="p-0">
              <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filterStatus !== "all" 
                  ? "Keine Projekte gefunden" 
                  : "Noch keine Projekte vorhanden"
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "Versuchen Sie andere Suchbegriffe oder Filter"
                  : "Erstellen Sie Ihr erstes Projekt, um loszulegen"
                }
              </p>
              {(!searchTerm && filterStatus === "all") && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-500 hover:bg-green-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Neues Projekt erstellen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Neues Projekt erstellen</DialogTitle>
                      <DialogDescription>
                        Erstellen Sie ein neues Tiefbau-Projekt und verwalten Sie Kunden und Firmen.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs defaultValue="project" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="project">Projekt</TabsTrigger>
                        <TabsTrigger value="customer">Kunde</TabsTrigger>
                        <TabsTrigger value="company">Firma</TabsTrigger>
                        <TabsTrigger value="documents">Dokumente</TabsTrigger>
                        <TabsTrigger value="flood">Hochwasserschutz</TabsTrigger>
                      </TabsList>

                      <TabsContent value="project" className="space-y-4">
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Projektname *</FormLabel>
                              <FormControl>
                                <Input placeholder="z.B. Straßenerneuerung Hauptstraße" {...field} />
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
                              <FormLabel>Beschreibung *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Projektbeschreibung..."
                                  className="resize-none"
                                  rows={3}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="planning">Planung</SelectItem>
                                    <SelectItem value="active">Aktiv</SelectItem>
                                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                                    <SelectItem value="cancelled">Abgebrochen</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="customerId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Kunde *</FormLabel>
                                <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Kunde wählen" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {customers.map((customer) => (
                                      <SelectItem key={customer.id} value={customer.id.toString()}>
                                        {customer.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Standort *</FormLabel>
                              <FormControl>
                                <Input placeholder="z.B. Hauptstraße 123, 12345 Musterstadt" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Startdatum *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Enddatum *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget (€) *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="50000"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                            <DialogFooter>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsCreateDialogOpen(false)}
                              >
                                Abbrechen
                              </Button>
                              <Button 
                                type="submit" 
                                disabled={createProjectMutation.isPending}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {createProjectMutation.isPending ? "Erstelle..." : "Projekt erstellen"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </TabsContent>

                      <TabsContent value="customer" className="space-y-4">
                        <Form {...customerForm}>
                          <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className="space-y-4">
                            <FormField
                              control={customerForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Kundenname *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="z.B. Mustermann GmbH" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={customerForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>E-Mail *</FormLabel>
                                    <FormControl>
                                      <Input type="email" placeholder="kunde@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={customerForm.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Telefon *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="+49 123 456789" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={customerForm.control}
                                name="street"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Straße *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="z.B. Hauptstraße" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={customerForm.control}
                                name="houseNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Hausnummer *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="z.B. 123a" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={customerForm.control}
                                name="postalCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>PLZ *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="z.B. 12345" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={customerForm.control}
                                name="city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Ort *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="z.B. Musterstadt" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <DialogFooter>
                              <Button 
                                type="submit" 
                                disabled={createCustomerMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Users className="h-4 w-4 mr-2" />
                                {createCustomerMutation.isPending ? "Erstelle..." : "Kunde erstellen"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </TabsContent>

                      <TabsContent value="company" className="space-y-4">
                        <Form {...companyForm}>
                          <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                            <FormField
                              control={companyForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Firmenname *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="z.B. Baufirma Schmidt GmbH" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={companyForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>E-Mail *</FormLabel>
                                    <FormControl>
                                      <Input type="email" placeholder="info@firma.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={companyForm.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Telefon *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="+49 123 456789" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={companyForm.control}
                                name="street"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Straße *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="z.B. Industriestraße" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={companyForm.control}
                                name="houseNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Hausnummer *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="z.B. 45b" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={companyForm.control}
                                name="postalCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>PLZ *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="z.B. 54321" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={companyForm.control}
                                name="city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Ort *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="z.B. Gewerbstadt" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={companyForm.control}
                              name="website"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Website *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://www.firma.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <DialogFooter>
                              <Button 
                                type="submit" 
                                disabled={createCompanyMutation.isPending}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <Building className="h-4 w-4 mr-2" />
                                {createCompanyMutation.isPending ? "Erstelle..." : "Firma erstellen"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </TabsContent>

                      <TabsContent value="documents" className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Dokumente hochladen</h3>
                          <p className="text-gray-600 mb-4">
                            Laden Sie Projektdokumente, Pläne, Verträge oder andere Dateien hoch.
                          </p>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.dwg"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="document-upload"
                          />
                          <label
                            htmlFor="document-upload"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 cursor-pointer"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Dateien auswählen
                          </label>
                        </div>

                        {uploadedFiles.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">Hochgeladene Dateien:</h4>
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                                    <span className="text-xs font-medium text-blue-600">
                                      {file.name.split('.').pop()?.toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Entfernen
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="flood" className="space-y-4">
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Hochwasserschutz-Modul</h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Verwalten Sie Checklisten, Absperrschieber, Schadensmeldungen und Deichwachen für Hochwasserschutz-Projekte.
                          </p>
                          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <h4 className="font-medium text-blue-900 mb-1">Checklisten</h4>
                              <p className="text-xs text-blue-700">Hochwasser & Übungen</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <h4 className="font-medium text-green-900 mb-1">Absperrschieber</h4>
                              <p className="text-xs text-green-700">Prüfung & Wartung</p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                              <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.18 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                              </div>
                              <h4 className="font-medium text-orange-900 mb-1">Schadensmeldungen</h4>
                              <p className="text-xs text-orange-700">Erfassung & Bearbeitung</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                              </div>
                              <h4 className="font-medium text-purple-900 mb-1">Deichwachen</h4>
                              <p className="text-xs text-purple-700">Einteilung & Überwachung</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-6">
                            Das Hochwasserschutz-Modul wird nach Projekt-Erstellung verfügbar sein
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
