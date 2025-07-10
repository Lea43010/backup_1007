import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import type { User } from "../../shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { ArrowLeft, Plus, Mail, Clock, CheckCircle, AlertCircle, Edit, Settings } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdBy: string;
  assignedTo: string | null;
  emailHistory: any[];
  createdAt: string;
  updatedAt: string;
}

export default function Support() {
  const { user } = useAuth() as { user: User | null };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(null);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    priority: "medium"
  });
  const [editForm, setEditForm] = useState({
    subject: "",
    description: "",
    priority: "medium",
    status: "",
    updateMessage: ""
  });

  // Fetch support tickets
  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support-tickets"],
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: typeof newTicket) => {
      const response = await apiRequest("/api/support-tickets", "POST", ticketData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      setNewTicket({ subject: "", description: "", priority: "medium" });
      setShowCreateForm(false);
      toast({
        title: "Ticket erstellt",
        description: "Ihr Support-Ticket wurde erfolgreich erstellt. Sie erhalten eine E-Mail-Bestätigung.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Erstellen des Support-Tickets",
        variant: "destructive",
      });
    },
  });

  // Update ticket mutation (for admins/managers)
  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, status, updateMessage, subject, description, priority }: { 
      id: number; 
      status?: string; 
      updateMessage?: string;
      subject?: string;
      description?: string;
      priority?: string;
    }) => {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (updateMessage) updateData.updateMessage = updateMessage;
      if (subject) updateData.subject = subject;
      if (description) updateData.description = description;
      if (priority) updateData.priority = priority;
      
      const response = await apiRequest(`/api/support-tickets/${id}`, "PATCH", updateData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      setEditingTicket(null);
      toast({
        title: "Ticket aktualisiert",
        description: "Das Support-Ticket wurde erfolgreich aktualisiert.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Aktualisieren des Support-Tickets",
        variant: "destructive",
      });
    },
  });

  const handleCreateTicket = () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie Betreff und Beschreibung aus.",
        variant: "destructive",
      });
      return;
    }
    createTicketMutation.mutate(newTicket);
  };

  const handleUpdateTicket = (id: number, status: string) => {
    const updateMessage = `Status geändert zu: ${getStatusLabel(status)}`;
    updateTicketMutation.mutate({ id, status, updateMessage });
  };

  const handleEditTicket = (ticket: SupportTicket) => {
    setEditingTicket(ticket);
    setEditForm({
      subject: ticket.subject,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      updateMessage: ""
    });
  };

  const handleSaveEdit = () => {
    if (!editingTicket || !editForm.subject.trim() || !editForm.description.trim()) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    updateTicketMutation.mutate({
      id: editingTicket.id,
      subject: editForm.subject,
      description: editForm.description,
      priority: editForm.priority,
      status: editForm.status,
      updateMessage: editForm.updateMessage || `Ticket bearbeitet: ${editForm.subject}`
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive">📋 Offen</Badge>;
      case "in-progress":
        return <Badge variant="default">⚙️ In Bearbeitung</Badge>;
      case "resolved":
        return <Badge variant="secondary">✅ Gelöst</Badge>;
      case "closed":
        return <Badge variant="outline">🔒 Geschlossen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">🔴 Hoch</Badge>;
      case "medium":
        return <Badge variant="default">🟡 Mittel</Badge>;
      case "low":
        return <Badge variant="secondary">🟢 Niedrig</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return "Offen";
      case "in-progress": return "In Bearbeitung";
      case "resolved": return "Gelöst";
      case "closed": return "Geschlossen";
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Support-Tickets werden geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
              <p className="text-gray-600">Erstellen und verwalten Sie Support-Tickets</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neues Ticket
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Ticket Form */}
          {showCreateForm && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Neues Support-Ticket
                  </CardTitle>
                  <CardDescription>
                    Beschreiben Sie Ihr Anliegen ausführlich
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Betreff *</Label>
                    <Input
                      id="subject"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                      placeholder="Kurze Beschreibung des Problems"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priorität</Label>
                    <Select 
                      value={newTicket.priority} 
                      onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Niedrig</SelectItem>
                        <SelectItem value="medium">🟡 Mittel</SelectItem>
                        <SelectItem value="high">🔴 Hoch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Beschreibung *</Label>
                    <Textarea
                      id="description"
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      placeholder="Detaillierte Beschreibung Ihres Anliegens..."
                      rows={6}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCreateTicket}
                      disabled={createTicketMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      {createTicketMutation.isPending ? "Wird erstellt..." : "Ticket erstellen"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateForm(false)}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tickets List */}
          <div className={`${showCreateForm ? "lg:col-span-2" : "lg:col-span-3"}`}>
            {tickets.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Support-Tickets</h3>
                  <p className="text-gray-600 mb-4">
                    Sie haben noch keine Support-Tickets erstellt.
                  </p>
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Erstes Ticket erstellen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket: SupportTicket) => (
                  <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">#{ticket.id}: {ticket.subject}</CardTitle>
                            {getStatusBadge(ticket.status)}
                            {getPriorityBadge(ticket.priority)}
                          </div>
                          <CardDescription className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Erstellt: {format(new Date(ticket.createdAt), "dd.MM.yyyy HH:mm", { locale: de })}
                            </span>
                            {ticket.updatedAt !== ticket.createdAt && (
                              <span className="flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                Aktualisiert: {format(new Date(ticket.updatedAt), "dd.MM.yyyy HH:mm", { locale: de })}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                          {/* Edit Button for all users (own tickets) and admins/managers (all tickets) */}
                          {user && (ticket.createdBy === user.id || user.role === "admin" || user.role === "manager") && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditTicket(ticket)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Bearbeiten
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Ticket bearbeiten</DialogTitle>
                                  <DialogDescription>
                                    Bearbeiten Sie die Details des Support-Tickets #{ticket.id}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="edit-subject">Betreff *</Label>
                                    <Input
                                      id="edit-subject"
                                      value={editForm.subject}
                                      onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                                      placeholder="Betreff des Tickets"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="edit-description">Beschreibung *</Label>
                                    <Textarea
                                      id="edit-description"
                                      value={editForm.description}
                                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                      placeholder="Detaillierte Beschreibung..."
                                      rows={6}
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="edit-priority">Priorität</Label>
                                      <Select 
                                        value={editForm.priority} 
                                        onValueChange={(value) => setEditForm({ ...editForm, priority: value })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="low">🟢 Niedrig</SelectItem>
                                          <SelectItem value="medium">🟡 Mittel</SelectItem>
                                          <SelectItem value="high">🔴 Hoch</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Status only for admins/managers */}
                                    {user && (user.role === "admin" || user.role === "manager") && (
                                      <div>
                                        <Label htmlFor="edit-status">Status</Label>
                                        <Select 
                                          value={editForm.status} 
                                          onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="open">📋 Offen</SelectItem>
                                            <SelectItem value="in-progress">⚙️ In Bearbeitung</SelectItem>
                                            <SelectItem value="resolved">✅ Gelöst</SelectItem>
                                            <SelectItem value="closed">🔒 Geschlossen</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <Label htmlFor="edit-update-message">Update-Nachricht (Optional)</Label>
                                    <Textarea
                                      id="edit-update-message"
                                      value={editForm.updateMessage}
                                      onChange={(e) => setEditForm({ ...editForm, updateMessage: e.target.value })}
                                      placeholder="Zusätzliche Informationen zur Änderung..."
                                      rows={3}
                                    />
                                  </div>

                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      variant="outline"
                                      onClick={() => setEditingTicket(null)}
                                    >
                                      Abbrechen
                                    </Button>
                                    <Button
                                      onClick={handleSaveEdit}
                                      disabled={updateTicketMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      {updateTicketMutation.isPending ? "Wird gespeichert..." : "Änderungen speichern"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {/* Quick Status Actions for Admins/Managers */}
                          {user && (user.role === "admin" || user.role === "manager") && ticket.status !== "closed" && (
                            <>
                              {ticket.status === "open" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateTicket(ticket.id, "in-progress")}
                                  disabled={updateTicketMutation.isPending}
                                >
                                  ⚙️ In Bearbeitung
                                </Button>
                              )}
                              {ticket.status === "in-progress" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateTicket(ticket.id, "resolved")}
                                  disabled={updateTicketMutation.isPending}
                                >
                                  ✅ Gelöst
                                </Button>
                              )}
                              {ticket.status === "resolved" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateTicket(ticket.id, "closed")}
                                  disabled={updateTicketMutation.isPending}
                                >
                                  🔒 Schließen
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                      {ticket.assignedTo && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Bearbeiter:</strong> {ticket.assignedTo}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}