import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  MailOpen, 
  RefreshCw, 
  Search, 
  Filter,
  Reply,
  Check,
  Clock,
  Paperclip,
  User,
  Send,
  MessageSquare,
  Settings,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface EmailMessage {
  id: string;
  subject: string;
  from: {
    name: string;
    email: string;
  };
  receivedDateTime: string;
  bodyPreview: string;
  isRead: boolean;
  hasAttachments: boolean;
  conversationId: string;
  body?: {
    content: string;
    contentType: string;
  };
}

export default function EmailInbox() {
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch inbox messages
  const { data: messages = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/email/inbox', { unreadOnly: showUnreadOnly }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (showUnreadOnly) params.append('unreadOnly', 'true');
      
      const response = await fetch(`/api/email/inbox?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return response.json();
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Test connection
  const { data: connectionStatus } = useQuery({
    queryKey: ['/api/email/test'],
    queryFn: async () => {
      const response = await fetch('/api/email/test');
      if (!response.ok) {
        throw new Error('Failed to test connection');
      }
      return response.json();
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/email/message/${messageId}/read`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email/inbox'] });
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const response = await fetch(`/api/email/message/${messageId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        throw new Error('Failed to send reply');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Antwort gesendet",
        description: "Ihre Antwort wurde erfolgreich versendet.",
      });
      setReplyContent('');
      setSelectedMessage(null);
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Antwort konnte nicht gesendet werden.",
        variant: "destructive",
      });
    },
  });

  // Filter messages based on search
  const filteredMessages = messages.filter((message: EmailMessage) =>
    message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.from.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.bodyPreview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter((m: EmailMessage) => !m.isRead).length;

  const handleMessageClick = async (message: EmailMessage) => {
    setSelectedMessage(message);
    
    // Mark as read if unread
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleReply = () => {
    if (selectedMessage && replyContent.trim()) {
      replyMutation.mutate({
        messageId: selectedMessage.id,
        content: replyContent,
      });
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Fehler beim Laden der E-Mails</span>
            </div>
            <p className="text-sm text-red-500 mt-2">
              Überprüfen Sie die Microsoft 365 Konfiguration oder kontaktieren Sie den Administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support E-Mail Inbox</h1>
          <p className="text-gray-600">
            support@bau-structura.de • {unreadCount} ungelesene Nachrichten
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Demo-Modus aktiv - Realistische Beispiel-E-Mails werden angezeigt
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
        Demo-Modus
      </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="E-Mails durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant={showUnreadOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
        >
          <Filter className="h-4 w-4 mr-2" />
          {showUnreadOnly ? "Alle anzeigen" : "Nur ungelesene"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                E-Mails ({filteredMessages.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  Lade E-Mails...
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  {searchQuery ? 'Keine E-Mails gefunden' : 'Keine E-Mails vorhanden'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMessages.map((message: EmailMessage) => (
                    <div
                      key={message.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !message.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      } ${selectedMessage?.id === message.id ? 'bg-green-50' : ''}`}
                      onClick={() => handleMessageClick(message)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {message.isRead ? (
                              <MailOpen className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Mail className="h-4 w-4 text-blue-500" />
                            )}
                            <span className="font-medium text-gray-900 truncate">
                              {message.from.name}
                            </span>
                            <span className="text-sm text-gray-500 truncate">
                              {message.from.email}
                            </span>
                            {message.hasAttachments && (
                              <Paperclip className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          
                          <h3 className={`text-sm mb-1 truncate ${
                            !message.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'
                          }`}>
                            {message.subject}
                          </h3>
                          
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {message.bodyPreview}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-1 ml-4">
                          <span className="text-xs text-gray-500">
                            {format(new Date(message.receivedDateTime), 'dd.MM.yy HH:mm', { locale: de })}
                          </span>
                          {!message.isRead && (
                            <Badge variant="default" className="text-xs">
                              Neu
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-1">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Nachricht Details</CardTitle>
                  <div className="flex items-center space-x-2">
                    {!selectedMessage.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsReadMutation.mutate(selectedMessage.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Als gelesen markieren
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {selectedMessage.subject}
                  </h3>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                    <User className="h-4 w-4" />
                    <span>{selectedMessage.from.name}</span>
                    <span>({selectedMessage.from.email})</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(selectedMessage.receivedDateTime), 'dd.MM.yyyy, HH:mm', { locale: de })} Uhr
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Nachricht:</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                    {selectedMessage.body?.content || selectedMessage.bodyPreview}
                  </div>
                </div>

                {/* Reply Section */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Antworten:</h4>
                  <Textarea
                    placeholder="Ihre Antwort..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="mb-3"
                    rows={4}
                  />
                  <Button
                    onClick={handleReply}
                    disabled={!replyContent.trim() || replyMutation.isPending}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {replyMutation.isPending ? 'Wird gesendet...' : 'Antwort senden'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Wählen Sie eine E-Mail aus, um Details anzuzeigen</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}