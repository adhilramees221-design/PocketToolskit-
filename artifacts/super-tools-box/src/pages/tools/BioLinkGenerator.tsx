import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Link2,
  MessageCircle,
  Phone,
} from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SocialLink = { label: string; url: string };

type BioLinkData = {
  profileName: string;
  bio: string;
  profileImageUrl: string;
  phone: string;
  upiId: string;
  paymentQrUrl: string;
  socials: SocialLink[];
};

const EMPTY_SOCIALS: SocialLink[] = [
  { label: "Instagram", url: "" },
  { label: "YouTube", url: "" },
  { label: "Website", url: "" },
];
const MAX_EXTERNAL_URL_LENGTH = 1024;
const MAX_SHARE_URL_LENGTH = 6000;

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function encodeBioData(data: BioLinkData) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBioData(encoded: string): BioLinkData | null {
  try {
    if (encoded.length > MAX_SHARE_URL_LENGTH) return null;
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(encoded.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));

    if (!parsed || typeof parsed !== "object") return null;
    const value = parsed as Partial<BioLinkData>;
    if (typeof value.profileName !== "string") return null;

    const socials = Array.isArray(value.socials)
      ? value.socials
          .filter((social): social is SocialLink =>
            Boolean(social) &&
            typeof social === "object" &&
            typeof (social as SocialLink).label === "string" &&
            typeof (social as SocialLink).url === "string",
          )
          .slice(0, 6)
      : [];

    return {
      profileName: value.profileName.slice(0, 80),
      bio: typeof value.bio === "string" ? value.bio.slice(0, 280) : "",
      profileImageUrl: typeof value.profileImageUrl === "string" ? value.profileImageUrl.slice(0, MAX_EXTERNAL_URL_LENGTH) : "",
      phone: typeof value.phone === "string" ? value.phone.slice(0, 32) : "",
      upiId: typeof value.upiId === "string" ? value.upiId.slice(0, 100) : "",
      paymentQrUrl: typeof value.paymentQrUrl === "string" ? value.paymentQrUrl.slice(0, MAX_EXTERNAL_URL_LENGTH) : "",
      socials: socials.map((social) => ({
        label: social.label.slice(0, 40),
        url: social.url.slice(0, MAX_EXTERNAL_URL_LENGTH),
      })),
    };
  } catch {
    return null;
  }
}

function safeWebUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase() || "B";
}

function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
  return Promise.resolve();
}

export default function BioLinkGenerator() {
  const { visitorData, visitorSlug } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");
    return {
      visitorData: data ? decodeBioData(data) : null,
      visitorSlug: normalizeSlug(params.get("name") ?? ""),
    };
  }, []);

  if (visitorData) return <BioLinkVisitor data={visitorData} slug={visitorSlug} />;

  return <BioLinkEditor />;
}

function BioLinkEditor() {
  const [slug, setSlug] = useState("");
  const [profileName, setProfileName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");
  const [paymentQrUrl, setPaymentQrUrl] = useState("");
  const [socials, setSocials] = useState<SocialLink[]>(EMPTY_SOCIALS);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [generationError, setGenerationError] = useState("");

  const updateSocial = (index: number, field: keyof SocialLink, value: string) => {
    setSocials((current) => current.map((social, socialIndex) =>
      socialIndex === index ? { ...social, [field]: value } : social,
    ));
  };

  const generateLink = () => {
    const cleanSlug = normalizeSlug(slug) || "bio-link";
    const data: BioLinkData = {
      profileName: profileName.trim() || "My Bio Link",
      bio: bio.trim(),
      profileImageUrl: profileImageUrl.trim().slice(0, MAX_EXTERNAL_URL_LENGTH),
      phone: phone.trim(),
      upiId: upiId.trim(),
      paymentQrUrl: paymentQrUrl.trim().slice(0, MAX_EXTERNAL_URL_LENGTH),
      socials: socials
        .map((social) => ({
          label: social.label.trim().slice(0, 40) || "My Link",
          url: social.url.trim().slice(0, MAX_EXTERNAL_URL_LENGTH),
        }))
        .filter((social) => social.url),
    };
    const params = new URLSearchParams({
      name: cleanSlug,
      data: encodeBioData(data),
    });

    // This path keeps the visitor flow on the existing Bio Link Generator route.
    const link = `${window.location.origin}${import.meta.env.BASE_URL}tools/bio-link?${params.toString()}`;
    if (link.length > MAX_SHARE_URL_LENGTH) {
      setGeneratedLink("");
      setGenerationError("This profile has too much link data to share reliably. Shorten an image or social-link URL and try again.");
      return;
    }

    setGenerationError("");
    setGeneratedLink(link);
    setCopied(false);
  };

  const copyLink = async () => {
    if (!generatedLink) return;
    try {
      await copyToClipboard(generatedLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission is controlled by the visitor's browser.
    }
  };

  return (
    <ToolLayout
      toolId="bio-link"
      instructions={
        <ul className="list-disc space-y-1 pl-5">
          <li>Create a custom link name, then add only the contact and social details you want to share.</li>
          <li>Click <strong>Generate Bio Link</strong> and send the copied link to anyone.</li>
          <li>The recipient sees a simple mobile profile card with your links, phone/WhatsApp actions, and payment details.</li>
        </ul>
      }
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="space-y-4">
          <div>
            <h3 className="font-semibold">Your Bio Link</h3>
            <p className="mt-1 text-sm text-muted-foreground">Choose a memorable title for the link you share.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio-link-slug">Bio Link Name / Slug</Label>
            <div className="flex overflow-hidden rounded-lg border bg-background focus-within:ring-2 focus-within:ring-ring">
              <span className="flex items-center border-r bg-muted px-3 text-sm text-muted-foreground">/bio-link?name=</span>
              <Input
                id="bio-link-slug"
                className="border-0 shadow-none focus-visible:ring-0"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="myprofile or adhil-bio"
                autoCapitalize="none"
                maxLength={48}
              />
            </div>
            {slug && <p className="text-xs text-muted-foreground">Link title: <span className="font-medium text-foreground">{normalizeSlug(slug) || "bio-link"}</span></p>}
          </div>
        </section>

        <div className="grid gap-6 border-t pt-6 md:grid-cols-2">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Profile details</h3>
            <Field label="Profile Name" htmlFor="bio-profile-name">
              <Input id="bio-profile-name" value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="Your name" maxLength={80} />
            </Field>
            <Field label="Bio Description" htmlFor="bio-description">
              <Input id="bio-description" value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Short description about you" maxLength={280} />
            </Field>
            <Field label="Profile Image URL" htmlFor="bio-profile-image">
              <Input id="bio-profile-image" type="url" value={profileImageUrl} onChange={(event) => setProfileImageUrl(event.target.value)} placeholder="https://example.com/photo.jpg" maxLength={MAX_EXTERNAL_URL_LENGTH} />
            </Field>
            <Field label="Contact / Phone Number" htmlFor="bio-phone">
              <Input id="bio-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" />
            </Field>
            <Field label="UPI ID" htmlFor="bio-upi">
              <Input id="bio-upi" value={upiId} onChange={(event) => setUpiId(event.target.value)} placeholder="username@upi" />
            </Field>
            <Field label="Payment QR Code Image URL" htmlFor="bio-payment-qr">
              <Input id="bio-payment-qr" type="url" value={paymentQrUrl} onChange={(event) => setPaymentQrUrl(event.target.value)} placeholder="https://example.com/payment-qr.png" maxLength={MAX_EXTERNAL_URL_LENGTH} />
            </Field>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Social media links</h3>
              <p className="mt-1 text-xs text-muted-foreground">Leave any row blank to hide it from your shared page.</p>
            </div>
            {socials.map((social, index) => (
              <div key={index} className="space-y-2 rounded-xl border bg-muted/20 p-3">
                <Label htmlFor={`social-label-${index}`}>Link {index + 1} label</Label>
                <Input
                  id={`social-label-${index}`}
                  value={social.label}
                  onChange={(event) => updateSocial(index, "label", event.target.value)}
                  placeholder="Instagram"
                  maxLength={40}
                />
                <Label htmlFor={`social-url-${index}`}>URL</Label>
                <Input
                  id={`social-url-${index}`}
                  type="url"
                  value={social.url}
                  onChange={(event) => updateSocial(index, "url", event.target.value)}
                  placeholder="https://..."
                  maxLength={MAX_EXTERNAL_URL_LENGTH}
                />
              </div>
            ))}
          </section>
        </div>

        <Button onClick={generateLink} className="h-12 w-full gap-2 text-base font-bold">
          <Link2 className="h-5 w-5" /> Generate Bio Link
        </Button>
        {generationError && <p className="text-center text-sm font-medium text-destructive">{generationError}</p>}

        {generatedLink && (
          <section className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-semibold">Your shareable bio link is ready</p>
            <p className="break-all rounded-lg border bg-background p-3 font-mono text-xs text-muted-foreground">{generatedLink}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={copyLink} className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Bio Link"}
              </Button>
              <Button variant="outline" asChild>
                <a href={generatedLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" /> Preview
                </a>
              </Button>
            </div>
          </section>
        )}
      </div>
    </ToolLayout>
  );
}

function BioLinkVisitor({ data, slug }: { data: BioLinkData; slug: string }) {
  const imageUrl = safeWebUrl(data.profileImageUrl);
  const paymentQrUrl = safeWebUrl(data.paymentQrUrl);
  const socialLinks = data.socials
    .map((social) => ({ ...social, url: safeWebUrl(social.url) }))
    .filter((social) => social.url);
  const phoneNumber = data.phone.replace(/[^\d+]/g, "");
  const whatsappNumber = data.phone.replace(/\D/g, "");
  const upiUrl = data.upiId
    ? `upi://pay?pa=${encodeURIComponent(data.upiId)}&pn=${encodeURIComponent(data.profileName)}`
    : "";

  return (
    <main className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-sky-50 px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-sky-950">
      <article className="w-full max-w-sm overflow-hidden rounded-[2rem] border bg-card p-6 text-center shadow-xl shadow-slate-900/10 dark:shadow-black/30">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${data.profileName}'s profile`}
            className="mx-auto h-24 w-24 rounded-full border-4 border-sky-300 object-cover shadow-md"
            onError={(event) => { event.currentTarget.style.display = "none"; }}
          />
        ) : (
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-4xl font-black text-white shadow-md">
            {initials(data.profileName)}
          </div>
        )}
        {slug && <p className="mt-3 text-xs font-bold tracking-[0.16em] text-primary">@{slug}</p>}
        <h1 className="mt-4 text-2xl font-black">{data.profileName}</h1>
        {data.bio && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{data.bio}</p>}

        {(phoneNumber || whatsappNumber) && (
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {phoneNumber && (
              <a className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground" href={`tel:${phoneNumber}`}>
                <Phone className="h-4 w-4" /> Call
              </a>
            )}
            {whatsappNumber && (
              <a className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white" href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
          </div>
        )}

        {socialLinks.length > 0 && (
          <div className="mt-6 space-y-2">
            {socialLinks.map((social, index) => (
              <a
                key={`${social.label}-${index}`}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border bg-background px-4 text-sm font-bold transition-colors hover:bg-muted"
              >
                <ExternalLink className="h-4 w-4 text-primary" /> {social.label}
              </a>
            ))}
          </div>
        )}

        {(data.upiId || paymentQrUrl) && (
          <section className="mt-6 rounded-2xl border bg-muted/25 p-4">
            <div className="flex items-center justify-center gap-2 text-sm font-bold">
              <CreditCard className="h-4 w-4 text-primary" /> Payment
            </div>
            {data.upiId && <p className="mt-2 text-xs text-muted-foreground">UPI ID: <span className="font-semibold text-foreground">{data.upiId}</span></p>}
            <div className="mt-3 inline-flex rounded-xl bg-white p-2 shadow-sm">
              {paymentQrUrl ? (
                <img src={paymentQrUrl} alt="Payment QR code" className="h-32 w-32 rounded-lg object-contain" onError={(event) => { event.currentTarget.style.display = "none"; }} />
              ) : upiUrl ? (
                <QRCodeSVG value={upiUrl} size={128} />
              ) : null}
            </div>
          </section>
        )}
      </article>

      <a
        href={import.meta.env.BASE_URL}
        className="mt-6 text-center text-xs text-muted-foreground/60 transition-opacity hover:text-primary hover:opacity-100"
      >
        Powered by Pocket Tools Kit
      </a>
    </main>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}