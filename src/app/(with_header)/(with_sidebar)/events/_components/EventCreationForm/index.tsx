"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  CalendarIcon,
  Sparkles,
  Cake,
  Heart,
  PlusCircle,
  MinusCircle,
  Loader2,
  PartyPopper,
  Briefcase,
  Users,
  Globe,
  Monitor,
  MapIcon,
  DollarSign,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { EventService } from "@/api/services/event.service";
import { useMutation } from "@tanstack/react-query";
import {
  EventCategory,
  EventCreationInput,
  eventCreationSchema,
  EventType,
} from "@/lib/validations/event";
import { eventTemplates } from "@/utils/event";

export function EventCreationForm() {
  const form = useForm<EventCreationInput>({
    resolver: zodResolver(eventCreationSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      type: EventType.Offline,
      start_date: "",
      start_time: "",
      end_date: "",
      end_time: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      is_public: true,
      is_paid: false,
      price: undefined,
      currency: "USD",
      max_participants: undefined,
      min_participants: undefined,
      auto_approve: true,
      allow_guests: false,
      require_approval: false,
      age_restriction: "",
      dress_code: "",
      tags: [],
      selectedTemplateId: undefined,
      locations: [
        {
          name: "",
          address: "",
          city: "",
          state: "",
          country: "",
          venue_type: "primary",
          online_url: "",
          online_platform: "",
        },
      ],
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = form;

  console.log({ errors });

  const category = watch("category");
  const eventType = watch("type");
  const isPaid = watch("is_paid");

  const {
    fields: locationFields,
    append: appendLocation,
    remove: removeLocation,
  } = useFieldArray({
    control,
    name: "locations",
  });

  const { mutate } = useMutation({
    mutationFn: EventService.createEvent,
  });
  // Apply template settings when template is selected
  const applyTemplate = (templateId: string) => {
    if (!category) return;

    const templates = eventTemplates[category];
    const template = templates.find((t) => t.id === templateId);

    if (template?.defaultSettings) {
      Object.entries(template.defaultSettings).forEach(([key, value]) => {
        if (value !== undefined) {
          setValue(key as keyof EventCreationInput, value);
        }
      });
    }
  };

  const onSubmit = async (data: EventCreationInput) => {
    mutate(data);
  };

  const getCategoryIcon = (cat: EventCategory) => {
    switch (cat) {
      case EventCategory.Birthday:
        return <Cake className="h-5 w-5" />;
      case EventCategory.Wedding:
        return <Heart className="h-5 w-5" />;
      case EventCategory.Party:
        return <PartyPopper className="h-5 w-5" />;
      case EventCategory.Business:
        return <Briefcase className="h-5 w-5" />;
      case EventCategory.Social:
        return <Users className="h-5 w-5" />;
      case EventCategory.Proposal:
        return <Heart className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getTypeIcon = (type: EventType) => {
    switch (type) {
      case EventType.Online:
        return <Monitor className="h-4 w-4" />;
      case EventType.Offline:
        return <MapIcon className="h-4 w-4" />;
      case EventType.Hybrid:
        return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full mx-auto p-8 bg-card text-card-foreground shadow-xl border border-border">
      <CardHeader className="text-center mb-6">
        <CardTitle className="text-3xl font-bold text-foreground">
          Create New Event
        </CardTitle>
        <p className="text-muted-foreground">
          Plan your perfect event with ease.
        </p>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Event Title */}
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Sarah's 30th Birthday Bash"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Category */}
            <FormField
              control={control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Category</FormLabel>
                  <Select
                    onValueChange={(value: EventCategory) => {
                      field.onChange(value);
                      setValue("selectedTemplateId", undefined);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(EventCategory).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(cat)}
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Template Selection */}
            {category &&
              eventTemplates[category] &&
              eventTemplates[category].length > 0 && (
                <FormField
                  control={control}
                  name="selectedTemplateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choose a Template (Optional)</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            applyTemplate(value);
                          }}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                          {eventTemplates[category].map((template) => (
                            <Label
                              key={template.id}
                              htmlFor={template.id}
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                              <RadioGroupItem
                                id={template.id}
                                value={template.id}
                                className="sr-only"
                              />
                              <Image
                                src={template.imageUrl || "/placeholder.svg"}
                                alt={template.name}
                                width={200}
                                height={150}
                                className="rounded-md mb-2 object-cover w-full h-24"
                              />
                              <span className="block w-full text-center font-semibold text-foreground">
                                {template.name}
                              </span>
                              <span className="block w-full text-center text-sm text-muted-foreground">
                                {template.description}
                              </span>
                            </Label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

            {/* Event Type */}
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(EventType).map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(type)}
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="date" {...field} className="pr-10" />
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="date" {...field} className="pr-10" />
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us more about your event..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Event Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="is_public"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Public Event
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Anyone can discover and join this event
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="allow_guests"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Allow Guests
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Participants can bring guests
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="is_paid"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Paid Event</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Charge admission for this event
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="require_approval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Require Approval
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Manually approve each participant
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Price fields */}
              {isPaid && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  parseFloat(e.target.value) || undefined
                                )
                              }
                              className="pl-8"
                            />
                            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="CAD">CAD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Participant limits */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="min_participants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Participants (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="No minimum"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="max_participants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Participants (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="No limit"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-4">
              <FormLabel>Event Locations</FormLabel>
              {locationFields.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name={`locations.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Main Venue" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`locations.${index}.venue_type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venue Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="primary">Primary</SelectItem>
                              <SelectItem value="secondary">
                                Secondary
                              </SelectItem>
                              <SelectItem value="meeting_point">
                                Meeting Point
                              </SelectItem>
                              <SelectItem value="backup">Backup</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {eventType === EventType.Online && (
                      <>
                        <FormField
                          control={control}
                          name={`locations.${index}.online_url`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meeting URL</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://zoom.us/j/..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name={`locations.${index}.online_platform`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Platform</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select platform" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="zoom">Zoom</SelectItem>
                                  <SelectItem value="meet">
                                    Google Meet
                                  </SelectItem>
                                  <SelectItem value="teams">
                                    Microsoft Teams
                                  </SelectItem>
                                  <SelectItem value="discord">
                                    Discord
                                  </SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {eventType !== EventType.Online && (
                      <>
                        <FormField
                          control={control}
                          name={`locations.${index}.address`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name={`locations.${index}.city`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name={`locations.${index}.state`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name={`locations.${index}.country`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="United States" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>

                  {locationFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLocation(index)}
                      className="mt-4"
                    >
                      <MinusCircle className="h-4 w-4 mr-2" />
                      Remove Location
                    </Button>
                  )}
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendLocation({
                    name: "",
                    address: "",
                    city: "",
                    state: "",
                    country: "",
                    venue_type: "secondary",
                    online_url: "",
                    online_platform: "",
                  })
                }
                className="w-full"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Another Location
              </Button>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="age_restriction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Restriction (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No restriction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all_ages">All Ages</SelectItem>
                        <SelectItem value="13+">13+</SelectItem>
                        <SelectItem value="16+">16+</SelectItem>
                        <SelectItem value="18+">18+</SelectItem>
                        <SelectItem value="21+">21+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="dress_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dress Code (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No dress code" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="business_casual">
                          Business Casual
                        </SelectItem>
                        <SelectItem value="cocktail">Cocktail</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="black_tie">Black Tie</SelectItem>
                        <SelectItem value="costume">Costume/Theme</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <FormField
              control={control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter tags separated by commas (e.g., birthday, party, celebration)"
                      value={field.value?.join(", ") || ""}
                      onChange={(e) => {
                        const tags = e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter((tag) => tag.length > 0);
                        field.onChange(tags);
                      }}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Add tags to help people discover your event
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-primary-foreground transition-all duration-200
                  bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transform hover:scale-[1.02] active:scale-[0.98]
                  ${
                    !isValid || isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Creating Event...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
