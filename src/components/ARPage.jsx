import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Camera, RefreshCw, X, Crosshair, ChevronLeft } from "lucide-react";

export default function ARPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [recognizedPlace, setRecognizedPlace] = useState(null);

  // Auto-fill from SearchPage if available
  const [scanTarget, setScanTarget] = useState(
    location.state?.predefinedLocation || "",
  );
  const videoRef = useRef(null);

  // Request camera permission on load
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        setHasPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []); // Close startCamera useEffect

  // Auto-trigger scan if we arrived with a predefined location
  useEffect(() => {
    if (location.state?.locationData && hasPermission) {
      // The SearchPage already dynamically fetched the YouTube ID using the API key!
      // We can just use the full object directly.
      setRecognizedPlace(location.state.locationData);
    } else if (location.state?.predefinedLocation && hasPermission) {
      // Fallback for older links
      setRecognizedPlace({
        name: location.state.predefinedLocation,
        description: "Location recognized from your camera.",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        youtubeId: null
      });
    }
  }, [location.state, hasPermission]);

  return (
    <div
      style={{
        height: "calc(100vh - 100px)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {!hasPermission ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <Camera size={64} color="var(--text-muted)" />
          <h2 style={{ color: "var(--text-muted)" }}>Camera Access Required</h2>
          <p
            style={{
              color: "var(--text-muted)",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            To use the AR scanning features, please allow camera access in your
            browser.
          </p>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            borderRadius: "20px",
            margin: "0 20px",
            background: "#000",
          }}
        >
          {/* Real-time Camera Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: isScanning ? "blur(4px) brightness(0.7)" : "none",
              transition: "filter 0.5s",
            }}
          />

          {/* AR UI Overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "20px",
              pointerEvents: "none",
            }}
          >
            {/* Top Navigation */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', pointerEvents: 'auto' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '30px',
                  padding: '10px 20px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  transition: 'background 0.2s'
                }}
              >
                <ChevronLeft size={20} /> Back to Search
              </button>
            </div>

            {/* Only rendering the Hologram, manual scan UI is completely removed! */}

            {/* AR Holographic Overlay (Native Video) */}
            {recognizedPlace && (
              <div
                style={{
                  position: "absolute",
                  top: "45%",
                  left: "50%",
                  transform:
                    "translate(-50%, -50%) perspective(1200px) rotateX(10deg) rotateY(-15deg)",
                  transformStyle: "preserve-3d",
                  width: "95%",
                  maxWidth: "550px",
                  pointerEvents: "auto",
                  animation:
                    "hologramPop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
                  filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
                }}
              >
                <div
                  className="glass-panel"
                  style={{
                    padding: "15px",
                    background: "rgba(15, 23, 42, 0.95)",
                    border: "2px solid var(--primary)",
                    boxShadow: "0 0 50px rgba(99, 102, 241, 0.6)",
                    position: "relative",
                  }}
                >
                  <button
                    onClick={() => setRecognizedPlace(null)}
                    style={{
                      position: "absolute",
                      top: "-15px",
                      right: "-15px",
                      background: "var(--primary)",
                      border: "none",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      color: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                      boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                    }}
                  >
                    <X size={20} />
                  </button>

                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "1.1rem",
                    }}
                  >
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        background: "#22c55e",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "pulse 2s infinite",
                      }}
                    ></span>
                    {recognizedPlace.name} 3D Video Tour
                  </h3>

                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "16/9",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: "#000",
                      position: "relative",
                    }}
                  >
                    {recognizedPlace.youtubeId ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${recognizedPlace.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${recognizedPlace.youtubeId}&controls=1&modestbranding=1&rel=0`}
                        title="YouTube 360 VR player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; vr"
                        style={{
                          objectFit: "cover",
                          pointerEvents: "auto",
                        }}
                      ></iframe>
                    ) : (
                      <video
                        src={recognizedPlace.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action button removed */}
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        @keyframes hologramPop {
          0% { transform: translate(-50%, -40%) scale(0.8) perspective(1200px) rotateX(25deg) rotateY(-25deg); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1) perspective(1200px) rotateX(15deg) rotateY(-15deg); opacity: 1; }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `,
        }}
      />
    </div>
  );
}
