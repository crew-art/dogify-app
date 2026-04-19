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
    <main className="page">
      <div className="shell">
        <div className="header">
          <Image
            src="/logo.png"
            alt="Mad Beach Pet Waste Co"
            width={300}
            height={100}
            priority
            className="logo"
          />

          <h1 className="title">Dogify Me</h1>
        </div>

        <section className="frame">
          <div className="layout">
            <div className="panel controls">
              <h2 className="panelTitle">Build Your Pup</h2>

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
                className="search"
              />

              <div className="breedBox">
                {filteredBreeds.length > 0 ? (
                  filteredBreeds.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBreed(b)}
                      className={`pill ${breed === b ? "pillActive" : ""}`}
                    >
                      {formatBreedLabel(b)}
                    </button>
                  ))
                ) : (
                  <p className="smallText">No breeds found</p>
                )}
              </div>

              <div className="levels">
                {HYBRID_LEVELS.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setHybridLevel(l.value)}
                    className={`pill ${hybridLevel === l.value ? "pillActive" : ""}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              <div className="actions">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="primaryBtn"
                >
                  {loading ? "🐾 Generating..." : "🐶 Dogify Me"}
                </button>

                {result && (
                  <>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="secondaryBtn"
                    >
                      Download
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      className="secondaryBtn"
                    >
                      Share
                    </button>
                  </>
                )}
              </div>

              {loading && <p className="status">Creating your pup... 🐾</p>}
              {copied && <p className="status">Link copied.</p>}
              {error && <p className="error">{error}</p>}
            </div>

            <div className="previewGrid">
              <div className="panel previewPanel">
                <h3 className="previewTitle">Original</h3>
                {preview ? (
                  <img src={preview} alt="Original upload" className="previewImg" />
                ) : (
                  <div className="placeholder">Your uploaded image will appear here.</div>
                )}
              </div>

              <div className="panel previewPanel">
                <h3 className="previewTitle">Dogified</h3>
                {result ? (
                  <img src={result} alt="Dogified result" className="previewImg" />
                ) : (
                  <div className="placeholder">
                    Your generated portrait will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .page {
          min-height: auto;
          background: transparent;
          padding: 12px;
          font-family: Arial, sans-serif;
          color: #000;
        }

        .shell {
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 20px;
        }

        .logo {
          width: 100%;
          max-width: 300px;
          height: auto;
        }

        .title {
          font-size: 42px;
          margin: 10px 0 0;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-weight: 900;
        }

        .frame {
          border: 4px solid #000;
          border-radius: 20px;
          padding: 20px;
          background: #fff;
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }

        .panel {
          border: 4px solid #000;
          border-radius: 16px;
          padding: 14px;
          background: #fff;
        }

        .controls {
          overflow: hidden;
        }

        .panelTitle {
          margin: 0 0 14px;
          font-size: 24px;
          font-weight: 900;
        }

        .search {
          width: 100%;
          margin-top: 10px;
          padding: 8px;
          border: 2px solid #000;
          border-radius: 8px;
          outline: none;
        }

        .breedBox {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          max-height: 220px;
          overflow-y: auto;
          padding: 10px;
          padding-right: 6px;
          margin-top: 10px;
          border: 2px solid #000;
          border-radius: 10px;
        }

        .levels {
          margin-top: 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .pill {
          border: 3px solid #000;
          background: #fff;
          color: #000;
          border-radius: 999px;
          padding: 6px 12px;
          cursor: pointer;
          font-weight: 700;
        }

        .pillActive {
          background: #000;
          color: #fff;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }

        .primaryBtn,
        .secondaryBtn {
          padding: 12px 20px;
          border-radius: 10px;
          border: 3px solid #000;
          cursor: pointer;
          font-weight: 800;
        }

        .primaryBtn {
          background: #000;
          color: #fff;
        }

        .primaryBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secondaryBtn {
          background: #fff;
          color: #000;
        }

        .status {
          margin-top: 10px;
          font-weight: 700;
        }

        .error {
          color: red;
          margin-top: 10px;
          font-weight: 700;
        }

        .smallText {
          font-size: 12px;
          margin: 0;
        }

        .previewGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .previewPanel {
          padding: 6px;
        }

        .previewTitle {
          margin: 0 0 10px;
          font-size: 18px;
          font-weight: 900;
        }

        .previewImg,
        .placeholder {
          width: 100%;
          max-height: 320px;
          border-radius: 10px;
          border: 2px solid #000;
        }

        .previewImg {
          object-fit: cover;
          display: block;
        }

        .placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
        }

        @media (max-width: 900px) {
          .title {
            font-size: 34px;
          }

          .frame {
            padding: 14px;
          }

          .layout {
            grid-template-columns: 1fr;
          }

          .previewGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .page {
            padding: 8px;
          }

          .logo {
            max-width: 250px;
          }

          .title {
            font-size: 28px;
          }

          .panelTitle {
            font-size: 20px;
          }

          .pill {
            padding: 6px 10px;
            font-size: 14px;
          }

          .primaryBtn,
          .secondaryBtn {
            width: 100%;
            justify-content: center;
          }

          .actions {
            flex-direction: column;
          }

          .breedBox {
            max-height: 260px;
          }
        }
      `}</style>
    </main>
  );
}