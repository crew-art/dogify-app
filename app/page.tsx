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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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
    const query = breedQuery.trim().toLowerCase();
    if (!query) return DOG_BREEDS;

    return DOG_BREEDS.filter((dogBreed) =>
      dogBreed.toLowerCase().includes(query)
    );
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
        background: "linear-gradient(180deg, #f7fbfa 0%, #ffffff 100%)",
        padding: "32px 20px 56px",
        fontFamily: "Arial, sans-serif",
        color: "#102321",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          <Image
            src="/logo.png"
            alt="Mad Beach Pet Waste Co"
            width={340}
            height={108}
            priority
            style={{
              width: "100%",
              maxWidth: 340,
              height: "auto",
              marginBottom: 14,
            }}
          />

          <h1
            style={{
              margin: 0,
              fontSize: 42,
              lineHeight: 1.1,
            }}
          >
            Dogify Me
          </h1>

          <p
            style={{
              margin: "10px auto 0",
              maxWidth: 700,
              fontSize: 18,
              lineHeight: 1.5,
              color: "#36514d",
            }}
          >
            Upload a photo, pick a breed, choose the transformation strength,
            and turn yourself into your ideal dog-inspired portrait.
          </p>
        </div>

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #d8e7e3",
            borderRadius: 24,
            boxShadow: "0 14px 40px rgba(19, 55, 48, 0.08)",
            padding: 24,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 1.35fr",
              gap: 24,
              alignItems: "start",
            }}
          >
            <div
              style={{
                background: "#f8fbfb",
                border: "1px solid #e4efec",
                borderRadius: 20,
                padding: 20,
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                  fontSize: 24,
                }}
              >
                Create your portrait
              </h2>

              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 10,
                    color: "#214741",
                  }}
                >
                  1. Upload your image
                </div>

                <label
                  htmlFor="upload"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#ffffff",
                    border: "1px solid #cfe2dd",
                    borderRadius: 14,
                    padding: "12px 16px",
                    cursor: "pointer",
                    fontWeight: 700,
                    color: "#133730",
                  }}
                >
                  <span>📸 Choose Image</span>
                  <span
                    style={{
                      fontWeight: 400,
                      color: "#56706b",
                      maxWidth: 180,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {file ? file.name : "No file selected"}
                  </span>
                </label>

                <input
                  id="upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const selected = e.target.files?.[0] || null;
                    setFile(selected);
                    setResult("");
                    setError("");
                    setCopied(false);

                    if (selected) {
                      setPreview(URL.createObjectURL(selected));
                    } else {
                      setPreview("");
                    }
                  }}
                />
              </div>

              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 10,
                    color: "#214741",
                  }}
                >
                  2. Pick a dog breed
                </div>

                <input
                  type="text"
                  placeholder="Search breeds..."
                  value={breedQuery}
                  onChange={(e) => setBreedQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #cfe2dd",
                    marginBottom: 12,
                    fontSize: 14,
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
                    paddingRight: 4,
                  }}
                >
                  {filteredBreeds.map((dogBreed) => {
                    const active = breed === dogBreed;

                    return (
                      <button
                        key={dogBreed}
                        type="button"
                        onClick={() => setBreed(dogBreed)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 999,
                          border: active ? "2px solid #0f6b5d" : "1px solid #cfe2dd",
                          background: active ? "#dff5ef" : "#ffffff",
                          color: "#123a34",
                          fontWeight: active ? 700 : 500,
                          cursor: "pointer",
                        }}
                      >
                        {formatBreedLabel(dogBreed)}
                      </button>
                    );
                  })}

                  {filteredBreeds.length === 0 && (
                    <div style={{ color: "#6d8681", fontSize: 14 }}>
                      No breeds matched that search.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 10,
                    color: "#214741",
                  }}
                >
                  3. Choose transformation strength
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  {HYBRID_LEVELS.map((level) => {
                    const active = hybridLevel === level.value;

                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setHybridLevel(level.value)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 999,
                          border: active ? "2px solid #102321" : "1px solid #cfe2dd",
                          background: active ? "#102321" : "#ffffff",
                          color: active ? "#ffffff" : "#123a34",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {level.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!file || loading}
                  style={{
                    padding: "14px 22px",
                    borderRadius: 14,
                    border: "none",
                    background: !file || loading ? "#b5c8c3" : "#0f6b5d",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: 16,
                    cursor: !file || loading ? "not-allowed" : "pointer",
                    minWidth: 190,
                  }}
                >
                  {loading ? "Generating..." : "🐶 Dogify Me"}
                </button>

                {result && (
                  <>
                    <button
                      type="button"
                      onClick={handleDownload}
                      style={{
                        padding: "14px 18px",
                        borderRadius: 14,
                        border: "1px solid #cfe2dd",
                        background: "#ffffff",
                        color: "#123a34",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Download
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      style={{
                        padding: "14px 18px",
                        borderRadius: 14,
                        border: "1px solid #cfe2dd",
                        background: "#ffffff",
                        color: "#123a34",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Share
                    </button>
                  </>
                )}
              </div>

              {copied && (
                <p style={{ color: "#0f6b5d", marginTop: 14, marginBottom: 0 }}>
                  Share not supported on this device. Link copied instead.
                </p>
              )}

              {error && (
                <p style={{ color: "crimson", marginTop: 14, marginBottom: 0 }}>
                  {error}
                </p>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
              }}
            >
              <div
                style={{
                  background: "#f8fbfb",
                  border: "1px solid #e4efec",
                  borderRadius: 20,
                  padding: 18,
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 22 }}>
                  Original
                </h3>

                {preview ? (
                  <img
                    src={preview}
                    alt="Original upload"
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      objectFit: "cover",
                      borderRadius: 16,
                      display: "block",
                      background: "#edf4f2",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: 16,
                      background: "#edf4f2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      padding: 20,
                      color: "#5f7671",
                      lineHeight: 1.5,
                    }}
                  >
                    Your uploaded image will appear here.
                  </div>
                )}
              </div>

              <div
                style={{
                  background: "#f8fbfb",
                  border: "1px solid #e4efec",
                  borderRadius: 20,
                  padding: 18,
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 22 }}>
                  Dogified
                </h3>

                {result ? (
                  <img
                    src={result}
                    alt="Dogified result"
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      objectFit: "cover",
                      borderRadius: 16,
                      display: "block",
                      background: "#edf4f2",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: 16,
                      background: "#edf4f2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      padding: 20,
                      color: "#5f7671",
                      lineHeight: 1.5,
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