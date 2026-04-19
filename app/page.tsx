"use client";

import { useState } from "react";

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

function formatBreedLabel(breed: string) {
  return breed
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [breed, setBreed] = useState("golden retriever");
  const [hybridLevel, setHybridLevel] = useState("balanced");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult("");

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
    link.download = `dogify-${breed.replace(/\s+/g, "-")}-${hybridLevel}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 1100 }}>
      <h1>🐶 Dogify Me</h1>

      <div style={{ marginBottom: 16 }}>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const selected = e.target.files?.[0] || null;
            setFile(selected);
            setResult("");
            setError("");

            if (selected) {
              setPreview(URL.createObjectURL(selected));
            } else {
              setPreview("");
            }
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>
          Dog breed:&nbsp;
          <select value={breed} onChange={(e) => setBreed(e.target.value)}>
            {DOG_BREEDS.map((dogBreed, index) => (
              <option key={dogBreed + index} value={dogBreed}>
                {formatBreedLabel(dogBreed)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>
          Hybrid level:&nbsp;
          <select
  value={hybridLevel}
  onChange={(e) => setHybridLevel(e.target.value)}
>
  <option value="barely">Barely noticeable</option>
  <option value="very_mild">Very mild</option>
  <option value="mild">Mild</option>
  <option value="balanced">Balanced</option>
  <option value="strong">Strong</option>
  <option value="severe">Severe</option>
  <option value="extreme">Extreme</option>
</select>
        </label>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button onClick={handleUpload} disabled={!file || loading}>
          {loading ? "Generating..." : "Turn me into a dog"}
        </button>

        {result && (
          <button onClick={handleDownload}>
            Download Image
          </button>
        )}
      </div>

      {error && <p style={{ color: "crimson", marginTop: 16 }}>{error}</p>}

      <div
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div>
          <h3>Original</h3>
          {preview ? (
            <img
              src={preview}
              alt="Original upload"
              style={{ width: 400, borderRadius: 10 }}
            />
          ) : (
            <p>No image selected yet.</p>
          )}
        </div>

        <div>
          <h3>Dogified</h3>
          {result ? (
            <img
              src={result}
              alt="Dogified result"
              style={{ width: 400, borderRadius: 10 }}
            />
          ) : (
            <p>Your result will appear here.</p>
          )}
        </div>
      </div>
    </main>
  );
}