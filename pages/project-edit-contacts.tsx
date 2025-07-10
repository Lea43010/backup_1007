import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { ArrowLeft, Save, Plus, User, Building2 } from "lucide-react";
import { Link } from "wouter";
import type { Project, Customer } from "../../shared/schema";

export default function ProjectEditContacts() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning" as "planning" | "active" | "completed" | "cancelled",
    budget: "",
    startDate: "",
    endDate: "",
    latitude: "",
    longitude: "",
    completionPercentage: 0,
    customerId: "",
    customerContactId: "",
    companyId: "",
    companyContactId: "",
  });

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
  });

  const { data: customerContacts = [] } = useQuery({
    queryKey: [`/api/customers/${formData.customerId}/contacts`],
    enabled: !!formData.customerId && formData.customerId !== "",
  });

  const { data: companyContacts = [] } = useQuery({
    queryKey: [`/api/companies/${formData.companyId}/contacts`],
    enabled: !!formData.companyId && formData.companyId !== "0",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        status: project.status,
        budget: project.budget?.toString() || "",
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : "",
        latitude: project.latitude?.toString() || "",
        longitude: project.longitude?.toString() || "",
        completionPercentage: project.completionPercentage || 0,
        customerId: (project as any).customerId?.toString() || "",
        customerContactId: (project as any).customerContactId?.toString() || "",
        companyId: (project as any).companyId?.toString() || "",
        companyContactId: (project as any).companyContactId?.toString() || "",
      });
    }
  }, [project]);

  const updateProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          customerId: data.customerId ? parseInt(data.customerId) : null,
          customerContactId: data.customerContactId ? parseInt(data.customerContactId) : null,
          companyContactId: data.companyContactId ? parseInt(data.companyContactId) : null,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update project');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Projekt aktualisiert",
        description: "Die Projektdaten wurden erfolgreich gespeichert.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setLocation(`/projects/${id}`);
    },
    onError: () => {
      toast({
        title: "Fehler beim Speichern",
        description: "Das Projekt konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomerChange = (customerId: string) => {
    setFormData(prev => ({
      ...prev,
      customerId,
      customerContactId: "0", // Reset contact when customer changes
    }));
  };

  const handleCompanyChange = (companyId: string) => {
    setFormData(prev => ({
      ...prev,
      companyId,
      companyContactId: "0", // Reset contact when company changes
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Projektdaten...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Projekt nicht gefunden</h2>
          <p className="text-gray-600 mb-4">Das angeforderte Projekt existiert nicht.</p>
          <Link href="/projects">
            <Button>Zurück zu Projekten</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-500 text-white sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href={`/projects/${id}`}>
                <Button variant="ghost" size="sm" className="text-white hover:bg-green-600">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold truncate">Projekt bearbeiten</h1>
                <p className="text-xs opacity-80">{project.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Projektdaten mit Ansprechpartnern</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Grunddaten */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Projektname *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Projektname eingeben"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Projektbeschreibung eingeben"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planung</SelectItem>
                      <SelectItem value="active">Aktiv</SelectItem>
                      <SelectItem value="completed">Abgeschlossen</SelectItem>
                      <SelectItem value="cancelled">Abgebrochen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ansprechpartner-Sektion */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Ansprechpartner-Verwaltung
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Kunde und Kunden-Ansprechpartner */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <Label className="text-sm font-medium">Kunde</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="customerId">Kunde auswählen</Label>
                      <Select 
                        value={formData.customerId} 
                        onValueChange={handleCustomerChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kunde auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Kein Kunde</SelectItem>
                          {customers.map((customer: any) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.customerId && (
                      <div>
                        <Label htmlFor="customerContactId">Ansprechpartner Kunde</Label>
                        <Select 
                          value={formData.customerContactId} 
                          onValueChange={(value) => handleInputChange('customerContactId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Ansprechpartner auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Kein Ansprechpartner</SelectItem>
                            {(customerContacts as any[]).map((contact: any) => (
                              <SelectItem key={contact.id} value={contact.id.toString()}>
                                {contact.name} {contact.position && `(${contact.position})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {(customerContacts as any[]).length === 0 && formData.customerId && (
                          <p className="text-sm text-gray-500 mt-1">
                            Keine Ansprechpartner für diesen Kunden vorhanden. 
                            <Link href="/customers" className="text-blue-500 hover:underline ml-1">
                              Ansprechpartner hinzufügen
                            </Link>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Firma und Firmen-Ansprechpartner */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-orange-500" />
                      <Label className="text-sm font-medium">Firma</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="companyId">Firma auswählen</Label>
                      <Select 
                        value={formData.companyId} 
                        onValueChange={handleCompanyChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Firma auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Keine Firma</SelectItem>
                          {(companies as any[]).map((company: any) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.companyId && (
                      <div>
                      <Label htmlFor="companyContactId">Ansprechpartner Firma</Label>
                      <Select 
                        value={formData.companyContactId} 
                        onValueChange={(value) => handleInputChange('companyContactId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Firmen-Ansprechpartner auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Kein Ansprechpartner</SelectItem>
                          {(companyContacts as any[]).map((contact: any) => (
                            <SelectItem key={contact.id} value={contact.id.toString()}>
                              {contact.name} 
                              {contact.department && ` (${contact.department})`}
                              {contact.position && ` - ${contact.position}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {(companyContacts as any[]).length === 0 && formData.companyId && (
                        <p className="text-sm text-gray-500 mt-1">
                          Keine Ansprechpartner für diese Firma vorhanden. 
                          <Link href="/companies" className="text-blue-500 hover:underline ml-1">
                            Ansprechpartner hinzufügen
                          </Link>
                        </p>
                      )}
                    </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Budget und Termine */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Budget und Termine</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget (€)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate">Startdatum</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">Enddatum</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Standort */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Standort</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Breitengrad</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      placeholder="z.B. 48.1351"
                    />
                  </div>

                  <div>
                    <Label htmlFor="longitude">Längengrad</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      placeholder="z.B. 11.5820"
                    />
                  </div>
                </div>
              </div>

              {/* Fortschritt */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Projektfortschritt</h3>
                <div>
                  <Label htmlFor="completionPercentage">Fortschritt (%)</Label>
                  <Input
                    id="completionPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.completionPercentage}
                    onChange={(e) => handleInputChange('completionPercentage', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={updateProjectMutation.isPending}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProjectMutation.isPending ? "Speichere..." : "Projekt speichern"}
                </Button>
                <Link href={`/projects/${id}`}>
                  <Button variant="outline" className="flex-1">
                    Abbrechen
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}