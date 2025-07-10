import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, Edit, Trash2, User, Mail, Phone, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import type { Company, CompanyContact } from "@shared/schema";

export default function CompaniesPage() {
  const queryClient = useQueryClient();
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingContact, setEditingContact] = useState<CompanyContact | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  // Company form state
  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    houseNumber: "",
    postalCode: "",
    city: "",
    website: ""
  });

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: ""
  });

  // Fetch companies
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"]
  });

  // Fetch contacts for selected company
  const { data: contacts = [] } = useQuery<CompanyContact[]>({
    queryKey: [`/api/companies/${selectedCompanyId}/contacts`],
    enabled: !!selectedCompanyId
  });

  // Company mutations
  const createCompanyMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/companies", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setIsCompanyDialogOpen(false);
      resetCompanyForm();
      toast({ title: "Firma erfolgreich erstellt" });
    }
  });

  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => apiRequest(`/api/companies/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setIsCompanyDialogOpen(false);
      setEditingCompany(null);
      resetCompanyForm();
      toast({ title: "Firma erfolgreich aktualisiert" });
    }
  });

  // Contact mutations
  const createContactMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/company-contacts", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${selectedCompanyId}/contacts`] });
      setIsContactDialogOpen(false);
      resetContactForm();
      toast({ title: "Ansprechpartner erfolgreich erstellt" });
    }
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => apiRequest(`/api/company-contacts/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${selectedCompanyId}/contacts`] });
      setIsContactDialogOpen(false);
      setEditingContact(null);
      resetContactForm();
      toast({ title: "Ansprechpartner erfolgreich aktualisiert" });
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/company-contacts/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${selectedCompanyId}/contacts`] });
      toast({ title: "Ansprechpartner erfolgreich gelöscht" });
    }
  });

  const resetCompanyForm = () => {
    setCompanyForm({
      name: "",
      email: "",
      phone: "",
      street: "",
      houseNumber: "",
      postalCode: "",
      city: "",
      website: ""
    });
  };

  const resetContactForm = () => {
    setContactForm({
      name: "",
      email: "",
      phone: "",
      department: "",
      position: ""
    });
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCompany) {
      updateCompanyMutation.mutate({ id: editingCompany.id, data: companyForm });
    } else {
      createCompanyMutation.mutate(companyForm);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contactData = {
      ...contactForm,
      companyId: selectedCompanyId
    };
    
    if (editingContact) {
      updateContactMutation.mutate({ id: editingContact.id, data: contactData });
    } else {
      createContactMutation.mutate(contactData);
    }
  };

  const editCompany = (company: Company) => {
    setEditingCompany(company);
    setCompanyForm({
      name: company.name,
      email: company.email || "",
      phone: company.phone || "",
      street: company.street || "",
      houseNumber: company.houseNumber || "",
      postalCode: company.postalCode || "",
      city: company.city || "",
      website: company.website || ""
    });
    setIsCompanyDialogOpen(true);
  };

  const editContact = (contact: CompanyContact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name,
      email: contact.email || "",
      phone: contact.phone || "",
      department: contact.department || "",
      position: contact.position || ""
    });
    setIsContactDialogOpen(true);
  };

  const openNewCompanyDialog = () => {
    setEditingCompany(null);
    resetCompanyForm();
    setIsCompanyDialogOpen(true);
  };

  const openNewContactDialog = () => {
    setEditingContact(null);
    resetContactForm();
    setIsContactDialogOpen(true);
  };

  return (
    <div className="container mx-auto mobile-spacing max-w-7xl">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          <h1 className="text-xl sm:text-3xl font-bold">Firmen-Verwaltung</h1>
        </div>
        <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewCompanyDialog} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Neue Firma</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? "Firma bearbeiten" : "Neue Firma erstellen"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Firmenname *</Label>
                  <Input
                    id="name"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="street">Straße</Label>
                  <Input
                    id="street"
                    value={companyForm.street}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, street: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="houseNumber">Hausnummer</Label>
                  <Input
                    id="houseNumber"
                    value={companyForm.houseNumber}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, houseNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">PLZ</Label>
                  <Input
                    id="postalCode"
                    value={companyForm.postalCode}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, postalCode: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="city">Stadt</Label>
                <Input
                  id="city"
                  value={companyForm.city}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCompanyDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCompanyMutation.isPending || updateCompanyMutation.isPending}
                >
                  {editingCompany ? "Aktualisieren" : "Erstellen"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Companies List */}
        <Card>
          <CardHeader>
            <CardTitle>Firmen ({companies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCompanyId === company.id 
                      ? "bg-blue-50 border-blue-200" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedCompanyId(company.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{company.name}</h3>
                        <Badge variant="outline">ID: {company.id}</Badge>
                      </div>
                      {company.email && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                          <Mail className="h-3 w-3" />
                          <span>{company.email}</span>
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                          <Phone className="h-3 w-3" />
                          <span>{company.phone}</span>
                        </div>
                      )}
                      {(company.street || company.city) && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">
                            {[company.street, company.houseNumber, company.postalCode, company.city]
                              .filter(Boolean)
                              .join(" ")}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        editCompany(company);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {companies.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  Noch keine Firmen vorhanden. Erstellen Sie Ihre erste Firma.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contacts Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedCompanyId 
                  ? `Ansprechpartner - ${companies.find(c => c.id === selectedCompanyId)?.name}`
                  : "Ansprechpartner"
                }
              </CardTitle>
              {selectedCompanyId && (
                <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openNewContactDialog} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Hinzufügen
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingContact ? "Ansprechpartner bearbeiten" : "Neuen Ansprechpartner hinzufügen"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="contactName">Name *</Label>
                        <Input
                          id="contactName"
                          value={contactForm.name}
                          onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contactEmail">E-Mail</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactPhone">Telefon</Label>
                          <Input
                            id="contactPhone"
                            value={contactForm.phone}
                            onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="department">Abteilung</Label>
                          <Input
                            id="department"
                            value={contactForm.department}
                            onChange={(e) => setContactForm(prev => ({ ...prev, department: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="position">Position</Label>
                          <Input
                            id="position"
                            value={contactForm.position}
                            onChange={(e) => setContactForm(prev => ({ ...prev, position: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsContactDialogOpen(false)}
                        >
                          Abbrechen
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createContactMutation.isPending || updateContactMutation.isPending}
                        >
                          {editingContact ? "Aktualisieren" : "Hinzufügen"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedCompanyId ? (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{contact.name}</span>
                        </div>
                        {contact.position && (
                          <p className="text-sm text-gray-600 mb-1">{contact.position}</p>
                        )}
                        {contact.department && (
                          <p className="text-sm text-gray-500 mb-1">Abteilung: {contact.department}</p>
                        )}
                        {contact.email && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                            <Mail className="h-3 w-3" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editContact(contact)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteContactMutation.mutate(contact.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <p className="text-gray-500 text-center py-6">
                    Keine Ansprechpartner für diese Firma vorhanden.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Wählen Sie eine Firma aus, um Ansprechpartner zu verwalten.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}