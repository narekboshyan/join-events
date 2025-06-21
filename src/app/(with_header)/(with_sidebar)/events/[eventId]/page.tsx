/* eslint-disable react/no-unescaped-entities */
import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Share2,
  Star,
  Gift,
  Music,
  Utensils,
  Camera,
  Crown,
  PartyPopper,
  Globe,
  UserPlus,
  MoreHorizontal,
} from "lucide-react";

const SingleEventPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        <div className="h-80 bg-gradient-to-r from-brand-purple to-brand-pink rounded-b-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Public Event</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-brand-yellow/20 backdrop-blur-sm rounded-full px-3 py-1">
                <PartyPopper className="w-4 h-4" />
                <span className="text-sm">Birthday Party</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Sarah's 25th Birthday Bash 🎉
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Dec 28, 2024</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>7:00 PM</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>24 going • 12 interested</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Join Event Card */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-yellow rounded-full flex items-center justify-center">
                    <Crown className="w-6 h-6 text-brand-purple" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Join the Celebration!</h3>
                    <p className="text-sm text-muted-foreground">
                      Let Sarah know you're coming
                    </p>
                  </div>
                </div>
                <button className="bg-brand-purple text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-purple/90 transition-colors">
                  I'm Going! 🎉
                </button>
              </div>
            </div>

            {/* Event Description */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">About This Event</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Join us for an unforgettable celebration as Sarah turns 25!
                We're throwing the ultimate birthday bash with great music,
                delicious food, fun activities, and amazing company. Come ready
                to dance, laugh, and make incredible memories together.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This is going to be a night to remember with surprise
                entertainment, a photo booth, karaoke, and Sarah's favorite
                playlist keeping us dancing all night long!
              </p>
            </div>

            {/* Venues */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Event Venues</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-brand-purple mt-1" />
                    <div className="flex-1">
                      <h3 className="font-medium">Main Party Hall</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Grand Ballroom - Celebration Center
                      </p>
                      <p className="text-sm text-muted-foreground">
                        123 Party Street, Downtown, City 12345
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Note: Main celebration area with dance floor and DJ
                        setup
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-brand-pink mt-1" />
                    <div className="flex-1">
                      <h3 className="font-medium">Rooftop Lounge</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Sky Terrace - Same Building
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Rooftop Level, Celebration Center
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Note: Chill zone with city views and photo opportunities
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Entertainment & Activities */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">
                Entertainment & Activities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-brand-yellow/10 rounded-lg">
                  <Music className="w-6 h-6 text-brand-purple" />
                  <div>
                    <h3 className="font-medium">Live DJ</h3>
                    <p className="text-sm text-muted-foreground">
                      Professional DJ spinning all night
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-brand-pink/10 rounded-lg">
                  <Camera className="w-6 h-6 text-brand-purple" />
                  <div>
                    <h3 className="font-medium">Photo Booth</h3>
                    <p className="text-sm text-muted-foreground">
                      Props and instant prints
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-brand-purple/10 rounded-lg">
                  <Music className="w-6 h-6 text-brand-pink" />
                  <div>
                    <h3 className="font-medium">Karaoke</h3>
                    <p className="text-sm text-muted-foreground">
                      Sing your heart out
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-brand-orange/10 rounded-lg">
                  <PartyPopper className="w-6 h-6 text-brand-purple" />
                  <div>
                    <h3 className="font-medium">Games & Prizes</h3>
                    <p className="text-sm text-muted-foreground">
                      Fun activities with rewards
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Party Details */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Party Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-brand-orange" />
                    Catering & Food
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Buffet style dinner</li>
                    <li>• Vegetarian & vegan options</li>
                    <li>• Birthday cake & desserts</li>
                    <li>• Open bar with cocktails</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-brand-pink" />
                    Gift Preferences
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Books & novels</li>
                    <li>• Art supplies</li>
                    <li>• Travel accessories</li>
                    <li>• Experience gifts welcome</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Event Feedback Section */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Event Reviews</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-5 h-5 fill-brand-yellow text-brand-yellow"
                    />
                  ))}
                </div>
                <span className="font-medium">4.8/5</span>
                <span className="text-sm text-muted-foreground">
                  (24 reviews)
                </span>
              </div>

              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-brand-purple rounded-full flex items-center justify-center text-white font-medium">
                      J
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Jessica M.</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-4 h-4 fill-brand-yellow text-brand-yellow"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Amazing party! Sarah really knows how to throw a
                        celebration. Great music, food, and vibes!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-brand-pink rounded-full flex items-center justify-center text-white font-medium">
                      M
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Mike R.</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-4 h-4 fill-brand-yellow text-brand-yellow"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        The photo booth was a hit! Everyone had such a great
                        time. Highly recommend!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Information */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold mb-4">Hosted by</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <h4 className="font-medium">Sarah Johnson</h4>
                  <p className="text-sm text-muted-foreground">
                    Event Organizer
                  </p>
                </div>
              </div>
              <button className="w-full bg-brand-yellow text-brand-purple font-medium py-2 rounded-lg hover:bg-brand-yellow/90 transition-colors">
                Message Host
              </button>
            </div>

            {/* Event Stats */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold mb-4">Event Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Expected Guests
                  </span>
                  <span className="font-medium">30-40 people</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Going</span>
                  <span className="font-medium">24 people</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Interested
                  </span>
                  <span className="font-medium">12 people</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Age Range
                  </span>
                  <span className="font-medium">21-35</span>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-brand-purple" />
                  <div>
                    <p className="text-sm font-medium">Saturday, Dec 28</p>
                    <p className="text-xs text-muted-foreground">
                      7:00 PM - 1:00 AM
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-brand-pink" />
                  <div>
                    <p className="text-sm font-medium">Celebration Center</p>
                    <p className="text-xs text-muted-foreground">
                      Downtown District
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-brand-orange" />
                  <div>
                    <p className="text-sm font-medium">Public Event</p>
                    <p className="text-xs text-muted-foreground">
                      Everyone welcome
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest List Preview */}
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Who's Going</h3>
                <button className="text-brand-purple text-sm font-medium">
                  See All
                </button>
              </div>
              <div className="flex -space-x-2 mb-3">
                {["J", "M", "A", "T", "L"].map((initial, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white ${
                      index % 2 === 0 ? "bg-brand-purple" : "bg-brand-pink"
                    }`}
                  >
                    {initial}
                  </div>
                ))}
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white">
                  +19
                </div>
              </div>
              <button className="w-full bg-brand-pink/10 text-brand-pink font-medium py-2 rounded-lg hover:bg-brand-pink/20 transition-colors flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" />
                Invite Friends
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-8"></div>
    </div>
  );
};

export default SingleEventPage;
