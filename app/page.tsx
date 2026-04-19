"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const DOG_BREEDS = [
  "golden retriever",
  "labrador retriever",
  "french bulldog",
  "poodle",
  "german shepherd",
  "corgi",
  "beagle",
  "dachshund",
  "siberian husky",
  "border collie",
  "australian shepherd",
  "shiba inu",
  "pug",
  "boxer",
  "rottweiler",
  "doberman pinscher",
  "great dane",
  "bernese mountain dog",
  "saint bernard",
  "newfoundland",
  "cavalier king charles spaniel",
  "boston terrier",
  "chihuahua",
  "american pit bull terrier",
  "staffordshire bull terrier",
  "english bulldog",
  "basset hound",
  "bloodhound",
  "akita",
  "samoyed",
  "alaskan malamute",
  "weimaraner",
  "vizsla",
  "dalmatian",
  "jack russell terrier",
  "west highland white terrier",
  "scottish terrier",
  "miniature schnauzer",
  "giant schnauzer",
  "bichon frise",
  "maltese",
  "papillon",
  "pomeranian",
  "cocker spaniel",
  "english springer spaniel",
  "irish setter",
  "afghan hound",
  "whippet",
  "greyhound",
  "italian greyhound",
  "basenji",
  "rhodesian ridgeback",
  "cane corso",
  "bullmastiff",
  "mastiff",
  "belgian malinois",
  "shar pei",
  "airedale terrier",
  "soft coated wheaten terrier",
  "fox terrier",
  "old english sheepdog",
  "collie",
  "sheltie",
  "keeshond",
  "cockapoo",
  "labradoodle",
  "goldendoodle",
];

const HYBRID_LEVELS = [
  { value: "barely", label: "Barely" },
  { value: "very_mild", label: "Very Mild" },
  { value: "mild", label: "Mild" },
  { value: "balanced", label: "Balanced" },
  { value: "strong", label: "Strong" },
  { value: "severe", label: "Severe" },
  { value: "extreme", label: "Extreme" },
];

function formatBreedLabel(breed: string) {
  return breed
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] || "image/png";
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mime });
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [breed, setBreed] = useState("golden retriever");
  const [hybridLevel, setHybridLevel] = useState("balanced");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [breedQuery, setBreedQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredBreeds = useMemo(() => {
    const q = breedQuery.trim().toLowerCase();
    if (!q) return DOG_BREEDS;
    return DOG_BREEDS.filter((b) => b.toLowerCase().includes(q));
  }, [breedQuery]);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult("");
    setCopied(false);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("breed", breed);
    formData.append("hybridLevel", hybridLevel);

    try {
      const res = await fetch("/api/dogify", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data.image);
    } catch (err: any) {
      setError(err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const link = document.createElement("a");
    link.href = result;
    link.download = `mad-beach-dogify-${breed.replace(/\s+/g, "-")}-${hybridLevel}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!result) return;

    try {
      const blob = dataUrlToBlob(result);
      const sharedFile = new File(
        [blob],
        `mad-beach-dogify-${breed.replace(/\s+/g, "-")}-${hybridLevel}.png`,
        { type: blob.type }
      );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [sharedFile] })
      ) {
        await navigator.share({
          title: "Mad Beach Dogify Me",
          text: `Check out my ${formatBreedLabel(breed)} dogified portrait from Mad Beach Pet Waste Co.`,
          files: [sharedFile],
        });
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      setError("Sharing failed. Try downloading the image instead.");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        color: "#000",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <Image
            src="/logo.png"
            alt="Mad Beach Pet Waste Co"
            width={300}
            height={100}
            priority
            style={{ height: "auto", width: "100%", maxWidth: 300 }}
          />

          <h1
            style={{
              fontSize: 42,
              margin: 10,
              letterSpacing: 1,
              textTransform: "uppercase",
              fontWeight: 900,
            }}
          >
            Dogify Me
          </h1>
        </div>

        <section
          style={{
            border: "4px solid #000",
            borderRadius: 20,
            padding: 20,
            background: "#fff",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.3fr",
              gap: 20,
              alignItems: "start",
            }}
          >
            <div
              style={{
                border: "4px solid #000",
                borderRadius: 16,
                padding: 16,
                background: "#fff",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                Build Your Pup
              </h2>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFile(f);
                    setPreview(URL.createObjectURL(f));
                    setError("");
                    setResult("");
                    setCopied(false);
                  }
                }}
              />

              <input
                placeholder="Search breed..."
                value={breedQuery}
                onChange={(e) => setBreedQuery(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 10,
                  padding: 8,
                  border: "2px solid #000",
                  borderRadius: 8,
                  outline: "none",
                }}
              />

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  maxHeight: 220,
                  overflowY: "auto",
                  paddingRight: 6,
                  marginTop: 10,
                  border: "2px solid #000",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                {filteredBreeds.length > 0 ? (
                  filteredBreeds.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBreed(b)}
                      style={{
                        border: "3px solid #000",
                        background: breed === b ? "#000" : "#fff",
                        color: breed === b ? "#fff" : "#000",
                        borderRadius: 999,
                        padding: "6px 10px",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      {formatBreedLabel(b)}
                    </button>
                  ))
                ) : (
                  <p style={{ fontSize: 12, margin: 0 }}>No breeds found</p>
                )}
              </div>

              <div style={{ marginTop: 16 }}>
                {HYBRID_LEVELS.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setHybridLevel(l.value)}
                    style={{
                      margin: 4,
                      border: "3px solid #000",
                      background: hybridLevel === l.value ? "#000" : "#fff",
                      color: hybridLevel === l.value ? "#fff" : "#000",
                      borderRadius: 999,
                      padding: "6px 12px",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!file || loading}
                  style={{
                    background: "#000",
                    color: "#fff",
                    padding: "12px 20px",
                    borderRadius: 10,
                    border: "3px solid #000",
                    cursor: !file || loading ? "not-allowed" : "pointer",
                    fontWeight: 800,
                  }}
                >
                  {loading ? "🐾 Generating..." : "🐶 Dogify Me"}
                </button>

                {result && (
                  <>
                    <button
                      type="button"
                      onClick={handleDownload}
                      style={{
                        background: "#fff",
                        color: "#000",
                        padding: "12px 20px",
                        borderRadius: 10,
                        border: "3px solid #000",
                        cursor: "pointer",
                        fontWeight: 800,
                      }}
                    >
                      Download
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      style={{
                        background: "#fff",
                        color: "#000",
                        padding: "12px 20px",
                        borderRadius: 10,
                        border: "3px solid #000",
                        cursor: "pointer",
                        fontWeight: 800,
                      }}
                    >
                      Share
                    </button>
                  </>
                )}
              </div>

              {loading && (
                <p style={{ marginTop: 10, fontWeight: 700 }}>
                  Creating your pup... 🐾
                </p>
              )}

              {copied && (
                <p style={{ marginTop: 10, fontWeight: 700 }}>
                  Link copied.
                </p>
              )}

              {error && (
                <p style={{ color: "red", marginTop: 10, fontWeight: 700 }}>
                  {error}
                </p>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div
                style={{
                  border: "4px solid #000",
                  borderRadius: 16,
                  padding: 10,
                  background: "#fff",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Original</h3>
                {preview ? (
                  <img
                    src={preview}
                    alt="Original upload"
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      objectFit: "cover",
                      borderRadius: 10,
                      border: "2px solid #000",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: 10,
                      border: "2px solid #000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 20,
                      textAlign: "center",
                    }}
                  >
                    Your uploaded image will appear here.
                  </div>
                )}
              </div>

              <div
                style={{
                  border: "4px solid #000",
                  borderRadius: 16,
                  padding: 10,
                  background: "#fff",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Dogified</h3>
                {result ? (
                  <img
                    src={result}
                    alt="Dogified result"
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      objectFit: "cover",
                      borderRadius: 10,
                      border: "2px solid #000",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: 10,
                      border: "2px solid #000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 20,
                      textAlign: "center",
                    }}
                  >
                    Your generated portrait will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}