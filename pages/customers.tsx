import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  Plus,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Users,
  Building2
} from "lucide-react";
import type { Customer } from "../../shared/schema";

export default function Customers() {
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    houseNumber: "",
    postalCode: "",
    city: ""
  });
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/customers", selectedCustomer?.id, "contacts"],
    enabled: !!selectedCustomer?.id,
  });

  const createCustomerMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/customers`, "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsCustomerDialogOpen(false);
      resetCustomerForm();
      toast({ description: "Kunde erfolgreich erstellt" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Fehler beim Erstellen des Kunden" });
    }
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/customers/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsCustomerDialogOpen(false);
      setEditingCustomer(null);
      resetCustomerForm();
      toast({ description: "Kunde erfolgreich aktualisiert" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Fehler beim Aktualisieren des Kunden" });
    }
  });

  const createContactMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest(`/api/customers/${selectedCustomer?.id}/contacts`, "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", selectedCustomer?.id, "contacts"] });
      setIsContactDialogOpen(false);
      resetContactForm();
      toast({ description: "Ansprechpartner erfolgreich erstellt" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Fehler beim Erstellen des Ansprechpartners" });
    }
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/customers/${selectedCustomer?.id}/contacts/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", selectedCustomer?.id, "contacts"] });
      setIsContactDialogOpen(false);
      setEditingContact(null);
      resetContactForm();
      toast({ description: "Ansprechpartner erfolgreich aktualisiert" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Fehler beim Aktualisieren des Ansprechpartners" });
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/customers/${selectedCustomer?.id}/contacts/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", selectedCustomer?.id, "contacts"] });
      toast({ description: "Ansprechpartner erfolgreich gelöscht" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Fehler beim Löschen des Ansprechpartners" });
    }
  });

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomerMutation.mutate({ id: editingCustomer.id, data: customerForm });
    } else {
      createCustomerMutation.mutate(customerForm);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    
    const contactData = {
      ...contactForm,
      customerId: selectedCustomer.id
    };

    if (editingContact) {
      updateContactMutation.mutate({ id: editingContact.id, data: contactData });
    } else {
      createContactMutation.mutate(contactData);
    }
  };

  const resetCustomerForm = () => {
    setCustomerForm({
      name: "",
      email: "",
      phone: "",
      street: "",
      houseNumber: "",
      postalCode: "",
      city: ""
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

  const editCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      street: customer.street || "",
      houseNumber: customer.houseNumber || "",
      postalCode: customer.postalCode || "",
      city: customer.city || ""
    });
    setIsCustomerDialogOpen(true);
  };

  const editContact = (contact: any) => {
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

  const openNewCustomerDialog = () => {
    setEditingCustomer(null);
    resetCustomerForm();
    setIsCustomerDialogOpen(true);
  };

  const openNewContactDialog = () => {
    setEditingContact(null);
    resetContactForm();
    setIsContactDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          <h1 className="text-xl sm:text-3xl font-bold">Kunden-Verwaltung</h1>
        </div>
        <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewCustomerDialog} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Neuer Kunde</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? "Kunde bearbeiten" : "Neuen Kunden erstellen"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Kundenname *</Label>
                  <Input
                    id="name"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="street">Straße</Label>
                  <Input
                    id="street"
                    value={customerForm.street}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, street: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="houseNumber">Hausnummer</Label>
                  <Input
                    id="houseNumber"
                    value={customerForm.houseNumber}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, houseNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">PLZ</Label>
                  <Input
                    id="postalCode"
                    value={customerForm.postalCode}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, postalCode: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="city">Stadt</Label>
                <Input
                  id="city"
                  value={customerForm.city}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCustomerDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button 
                  type="submit"
                  disabled={!customerForm.name.trim()}
                >
                  {editingCustomer ? "Aktualisieren" : "Erstellen"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kunden Liste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Kunden ({customers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Lade Kunden...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Noch keine Kunden erstellt</p>
                  <Button 
                    onClick={openNewCustomerDialog}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ersten Kunden erstellen
                  </Button>
                </div>
              ) : (
                customers.map((customer) => (
                  <Card 
                    key={customer.id} 
                    className={`cursor-pointer transition-all ${
                      selectedCustomer?.id === customer.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{customer.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              ID: {customer.id}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            {customer.email && (
                              <div className="flex items-center space-x-2">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{customer.email}</span>
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-3 w-3" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                            {(customer.street || customer.city) && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">
                                  {[customer.street, customer.houseNumber, customer.postalCode, customer.city]
                                    .filter(Boolean)
                                    .join(" ")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            editCustomer(customer);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ansprechpartner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ansprechpartner</span>
              {selectedCustomer && (
                <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      onClick={openNewContactDialog}
                      className="flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Hinzufügen</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingContact ? "Ansprechpartner bearbeiten" : "Neuer Ansprechpartner"}
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
                          disabled={!contactForm.name.trim()}
                        >
                          {editingContact ? "Aktualisieren" : "Erstellen"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCustomer ? (
              <div className="text-center py-8 text-gray-500">
                Wählen Sie einen Kunden aus, um Ansprechpartner zu verwalten.
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Keine Ansprechpartner für {selectedCustomer.name}</p>
                <Button onClick={openNewContactDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ersten Ansprechpartner hinzufügen
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact: any) => (
                  <Card key={contact.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{contact.name}</h4>
                            {contact.position && (
                              <Badge variant="outline" className="text-xs">
                                {contact.position}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            {contact.department && (
                              <div className="flex items-center space-x-2">
                                <Building2 className="h-3 w-3" />
                                <span>{contact.department}</span>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center space-x-2">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{contact.email}</span>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-3 w-3" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editContact(contact)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteContactMutation.mutate(contact.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}