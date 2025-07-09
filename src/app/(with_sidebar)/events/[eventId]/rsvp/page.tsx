"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Check, Download, Heart, QrCode, Share2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface RSVPPageProps {
  params: { eventId: string };
}

const RSVPPage: React.FC<RSVPPageProps> = ({ params }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [qrCodeData, setQrCodeData] = useState<any>(null);
  const [guestCount, setGuestCount] = useState(0);
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const invitationId = searchParams.get("invitation");
  const action = searchParams.get("action");

  const handleRSVP = useCallback(
    async (responseAction: "accept" | "decline") => {
      if (!invitationId) {
        setError("Invalid invitation link");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/events/rsvp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invitationId,
            action: responseAction,
            guestCount: responseAction === "accept" ? guestCount : 0,
            dietaryRestrictions:
              responseAction === "accept" ? dietaryRestrictions : undefined,
            specialRequests:
              responseAction === "accept" ? specialRequests : undefined,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to process RSVP");
        }

        setSuccess(true);
        if (result.qrCodeData) {
          setQrCodeData(result.qrCodeData);
        }

        // Redirect to event page after delay
        setTimeout(() => {
          router.push(`/events/${params.eventId}`);
        }, 5000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [
      invitationId,
      guestCount,
      dietaryRestrictions,
      specialRequests,
      router,
      params.eventId,
    ]
  );

  useEffect(() => {
    if (action && invitationId) {
      if (action === "accept") {
        // Show RSVP form for acceptance
        return;
      } else if (action === "decline") {
        handleRSVP("decline");
      }
    }
  }, [action, handleRSVP, invitationId]);

  const downloadQRCode = () => {
    if (!qrCodeData) return;

    // Generate QR code using a library like qrcode
    // This is a placeholder - you'd implement actual QR generation
    const link = document.createElement("a");
    link.download = `event-ticket-${Date.now()}.png`;
    link.href = qrCodeData.qrUrl; // This would be the actual QR image URL
    link.click();
  };

  const shareQRCode = async () => {
    if (!qrCodeData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Event Ticket",
          text: "Here's my event attendance QR code",
          url: qrCodeData.qrUrl,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(qrCodeData.qrUrl);
      alert("QR code URL copied to clipboard!");
    }
  };

  if (success && action === "decline") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-xl p-8 text-center border shadow-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">RSVP Declined</h1>
          <p className="text-muted-foreground mb-6">
            You've successfully declined the invitation. We're sorry you can't
            make it!
          </p>
          <button
            onClick={() => router.push(`/events/${params.eventId}`)}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Event Details
          </button>
        </div>
      </div>
    );
  }

  if (success && action === "accept") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-card rounded-xl p-8 text-center border shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">You're Going! 🎉</h1>
          <p className="text-muted-foreground mb-6">
            Your RSVP has been confirmed. Check your email for event details.
          </p>

          {qrCodeData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-brand-purple" />
                <span className="font-medium">Your Event Ticket</span>
              </div>

              {/* QR Code Display - You'd use a QR code library here */}
              <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Save this QR code - you'll need it for event check-in
              </p>

              <div className="flex gap-3">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 bg-brand-purple text-white py-2 px-4 rounded-lg hover:bg-brand-purple/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={shareQRCode}
                  className="flex-1 bg-brand-yellow text-brand-purple py-2 px-4 rounded-lg hover:bg-brand-yellow/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => router.push(`/events/${params.eventId}`)}
            className="w-full bg-brand-purple text-white py-2 px-4 rounded-lg hover:bg-brand-purple/90 transition-colors"
          >
            View Event Details
          </button>
        </div>
      </div>
    );
  }

  if (action === "accept" && !success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-card rounded-xl p-8 border shadow-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Confirm Your Attendance</h1>
            <p className="text-muted-foreground">
              We're excited to have you! Please provide a few details.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRSVP("accept");
            }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">
                How many guests will you bring? (including yourself)
              </label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple"
              >
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num === 0
                      ? "Just me"
                      : `+${num} guest${num > 1 ? "s" : ""}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Dietary restrictions or allergies
              </label>
              <textarea
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                placeholder="Please let us know about any dietary needs..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Special requests or notes
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Anything else we should know..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleRSVP("decline")}
                disabled={loading}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Decline
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-brand-purple text-white py-3 px-4 rounded-lg hover:bg-brand-purple/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Confirming..." : "Confirm Attendance"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-xl p-8 text-center border shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Invalid Invitation</h1>
        <p className="text-muted-foreground mb-6">
          This invitation link appears to be invalid or expired.
        </p>
        <button
          onClick={() => router.push("/")}
          className="w-full bg-brand-purple text-white py-2 px-4 rounded-lg hover:bg-brand-purple/90 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default RSVPPage;
