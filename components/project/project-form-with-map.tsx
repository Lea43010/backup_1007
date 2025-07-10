import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { GoogleMap } from "../../components/maps/google-map";
import { AddressSearch } from "../../components/maps/address-search";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import { insertProjectSchema, type Customer } from "../../shared/schema";

// Extended project schema with GPS coordinates
const projectFormSchema = insertProjectSchema.extend({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  mapZoomLevel: z.number().default(15),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectFormWithMapProps {
  customers: Customer[];
  onSuccess?: () => void;
  initialData?: Partial<ProjectFormData>;
}

export function ProjectFormWithMap({ customers, onSuccess, initialData }: ProjectFormWithMapProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Default map center (Germany)
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({
    lat: initialData?.latitude ? Number(initialData.latitude) : 51.1657,
    lng: initialData?.longitude ? Number(initialData.longitude) : 10.4515,
  });
  
  const [mapZoom, setMapZoom] = useState(initialData?.mapZoomLevel || 6);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(
    initialData?.latitude && initialData?.longitude
      ? {
          lat: Number(initialData.latitude),
          lng: Number(initialData.longitude),
          address: initialData.address || "",
        }
      : null
  );

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      status: initialData?.status || "planning",
      customerId: initialData?.customerId || undefined,
      latitude: initialData?.latitude ? Number(initialData.latitude) : undefined,
      longitude: initialData?.longitude ? Number(initialData.longitude) : undefined,
      address: initialData?.address || "",
      mapZoomLevel: initialData?.mapZoomLevel || 15,
      ...initialData,
    },
  });

  const createProject = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const response = await apiRequest("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Projekt erstellt",
        description: "Das Projekt wurde erfolgreich mit GPS-Koordinaten gespeichert.",
      });
      form.reset();
      setSelectedLocation(null);
      setMapCenter({ lat: 51.1657, lng: 10.4515 });
      setMapZoom(6);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Das Projekt konnte nicht erstellt werden.",
        variant: "destructive",
      });
      console.error("Error creating project:", error);
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    createProject.mutate(data);
  };

  // Handle location selection from address search
  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    setSelectedLocation(location);
    setMapCenter({ lat: location.lat, lng: location.lng });
    setMapZoom(15);
    
    // Update form values
    form.setValue("latitude", location.lat);
    form.setValue("longitude", location.lng);
    form.setValue("address", location.address);
  };

  // Handle map click
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      // Reverse geocoding to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat, lng } },
        (results, status) => {
          const address = status === "OK" && results?.[0] 
            ? results[0].formatted_address 
            : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          
          handleLocationSelect({ address, lat, lng });
        }
      );
    }
  };

  // Generate markers for map
  const markers = selectedLocation
    ? [
        {
          id: 1,
          position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
          title: "Projektstandort",
        },
      ]
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Project Form */}
      <Card>
        <CardHeader>
          <CardTitle>Neues Projekt</CardTitle>
          <CardDescription>
            Erstellen Sie ein neues Tiefbau-Projekt mit GPS-Koordinaten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projektname</FormLabel>
                    <FormControl>
                      <Input placeholder="Projekt eingeben..." {...field} />
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
                    <FormLabel>Beschreibung</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Projektbeschreibung eingeben..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kunde</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kunde auswählen" />
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

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Status auswählen" />
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

              {/* Address Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Projektstandort</label>
                <AddressSearch
                  onLocationSelect={handleLocationSelect}
                  placeholder="Adresse suchen oder GPS-Koordinaten eingeben..."
                  initialValue={form.getValues("address")}
                />
              </div>

              {/* GPS Coordinates Display */}
              {selectedLocation && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Breitengrad</label>
                    <Input 
                      value={selectedLocation.lat.toFixed(6)} 
                      readOnly 
                      className="bg-gray-50" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Längengrad</label>
                    <Input 
                      value={selectedLocation.lng.toFixed(6)} 
                      readOnly 
                      className="bg-gray-50" 
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={createProject.isPending}
              >
                {createProject.isPending ? "Speichern..." : "Projekt erstellen"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Google Map */}
      <Card>
        <CardHeader>
          <CardTitle>Standort auswählen</CardTitle>
          <CardDescription>
            Klicken Sie auf die Karte oder suchen Sie eine Adresse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleMap
            center={mapCenter}
            zoom={mapZoom}
            onMapClick={handleMapClick}
            markers={markers}
            className="h-96"
          />
          {selectedLocation && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">Ausgewählter Standort:</p>
              <p className="text-sm text-green-600">{selectedLocation.address}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}