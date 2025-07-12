"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 py-24 animate-fade-in">
        <Badge className="mb-4 animate-slide-in-from-bottom">
          Welcome to JoinEvents
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 animate-fade-in animate-delay-100">
          Discover & Join Amazing Events
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground text-center mb-8 max-w-2xl animate-fade-in animate-delay-200">
          Find, create, and connect with people through events that matter to
          you. Whether it's tech meetups, hobby groups, or social gatherings,
          JoinEvents brings people together.
        </p>
        <Button
          size="lg"
          className="animate-slide-in-from-bottom animate-delay-300 shadow-lg"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          Get Started
        </Button>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in animate-delay-300">
        <Card className="hover:scale-105 transition-transform duration-300 animate-slide-in-from-bottom">
          <CardHeader>
            <CardTitle>Discover Events</CardTitle>
            <CardDescription>
              Browse curated events tailored to your interests and location.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Image
              src="/globe.svg"
              alt="Discover"
              width={48}
              height={48}
              className="mb-4"
            />
            <Badge variant="secondary">Personalized</Badge>
          </CardContent>
        </Card>
        <Card className="hover:scale-105 transition-transform duration-300 animate-slide-in-from-bottom animate-delay-100">
          <CardHeader>
            <CardTitle>Create & Host</CardTitle>
            <CardDescription>
              Organize your own events and invite others with ease.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Image
              src="/party.svg"
              alt="Host"
              width={48}
              height={48}
              className="mb-4"
            />
            <Badge variant="secondary">Easy Hosting</Badge>
          </CardContent>
        </Card>
        <Card className="hover:scale-105 transition-transform duration-300 animate-slide-in-from-bottom animate-delay-200">
          <CardHeader>
            <CardTitle>Connect & RSVP</CardTitle>
            <CardDescription>
              RSVP, connect with attendees, and grow your network.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Image
              src="/users.svg"
              alt="Connect"
              width={48}
              height={48}
              className="mb-4"
            />
            <Badge variant="secondary">Networking</Badge>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
