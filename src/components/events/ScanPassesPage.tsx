import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface ScanPassesPageProps {
  eventId: string;
  onBack: () => void;
}

type ScanState = "idle" | "scanning" | "success" | "error";

export default function ScanPassesPage({
  eventId,
  onBack,
}: ScanPassesPageProps) {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [attendee, setAttendee] = useState<any>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 260,
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        setScanState("scanning"); // ✅ SHOW LOADER IMMEDIATELY

        try {
          console.log("Scanned QR:", decodedText);

          // 🔥 CLEAN TOKEN (important for real systems)
          const token = decodedText.trim();

          // ❗ REPLACE THIS WITH SUPABASE CALL
          // const { data, error } = await supabase
          //   .from("passes")
          //   .select("*")
          //   .eq("qr_token", token)
          //   .single();

          // TEMP MOCK (REMOVE LATER)
          const mockDB = {
            "TCS-8F3K29A": {
              name: "John Doe",
              ticketType: "VIP",
            },
            "TCS-DEMO": {
              name: "Jane Smith",
              ticketType: "General",
            },
          };

          const data = mockDB[token as keyof typeof mockDB];

          if (!data) {
            setScanState("error");

            setTimeout(() => setScanState("idle"), 2000);
            return;
          }

          setAttendee(data);
          setScanState("success");

          setTimeout(() => {
            setScanState("idle");
            setAttendee(null);
          }, 3000);
        } catch (err) {
          console.error(err);
          setScanState("error");

          setTimeout(() => setScanState("idle"), 2000);
        }
      },
      (err) => {
        // ignore scan noise
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-2xl font-semibold">QR Check-In</h1>
          <p className="text-sm text-white/50">
            Scan attendee passes
          </p>
        </div>
      </div>

      {/* Scanner Box */}
      <div className="max-w-xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-[#111] p-6">

          {/* CAMERA AREA */}
          <div className="relative aspect-square rounded-2xl border border-dashed border-white/20 bg-black overflow-hidden flex items-center justify-center">

            {/* Scanner */}
            <div id="qr-reader" className="w-full" />

            {/* LOADER OVERLAY */}
            {scanState === "scanning" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                <Loader2 className="animate-spin text-purple-400 mb-2" />
                <p className="text-sm text-white/70">
                  Checking pass...
                </p>
              </div>
            )}

            {/* Idle overlay */}
            {scanState === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-purple-500 rounded-2xl opacity-40" />
              </div>
            )}
          </div>

          {/* RESULT */}
          <div className="mt-6">
            {scanState === "idle" && (
              <p className="text-sm text-white/50">
                Waiting for scan...
              </p>
            )}

            {scanState === "success" && attendee && (
              <div className="p-5 rounded-2xl border border-green-500/20 bg-green-500/10">
                <div className="flex gap-3">
                  <CheckCircle2 className="text-green-400" />
                  <div>
                    <p className="text-green-300 font-medium">
                      Check-in successful
                    </p>
                    <p className="text-white/80">
                      {attendee.name}
                    </p>
                    <p className="text-white/50 text-sm">
                      {attendee.ticketType}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {scanState === "error" && (
              <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/10">
                <div className="flex gap-3">
                  <XCircle className="text-red-400" />
                  <div>
                    <p className="text-red-300 font-medium">
                      Invalid Pass
                    </p>
                    <p className="text-white/50 text-sm">
                      QR not recognized
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-5 text-center text-xs text-white/30">
            Event ID: {eventId}
          </div>
        </div>
      </div>
    </div>
  );
}