"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Building2, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { SubscriptionTier } from "@/lib/admin-types";

// Validation schema
const createOrgSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(63, "Slug must be less than 63 characters")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "Slug must be lowercase, start/end with letter or number, and contain only letters, numbers, and hyphens"
    ),
  owner_email: z.string().email("Invalid email address"),
  subscription_tier: z.enum(["free", "pro", "enterprise"]),
});

type CreateOrgForm = z.infer<typeof createOrgSchema>;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 63);
}

const TIER_OPTIONS: { value: SubscriptionTier; label: string; description: string }[] = [
  {
    value: "free",
    label: "Free",
    description: "Basic features, 1 user",
  },
  {
    value: "pro",
    label: "Pro",
    description: "Advanced features, 10 users",
  },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Unlimited features & users",
  },
];

export default function NewOrganizationPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateOrgForm>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: "",
      slug: "",
      owner_email: "",
      subscription_tier: "pro",
    },
  });

  const name = watch("name");
  const slug = watch("slug");
  const tier = watch("subscription_tier");

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setValue("name", newName);

    // Only auto-generate slug if user hasn't manually edited it
    const currentSlug = slug;
    const expectedSlug = generateSlug(name);
    if (!currentSlug || currentSlug === expectedSlug) {
      setValue("slug", generateSlug(newName));
    }
  };

  const onSubmit = async (data: CreateOrgForm) => {
    setSubmitting(true);
    try {
      const response = await api.adminCreateTenant(data);
      setInvitationLink(response.invitation_link);
      toast.success("Organization Created", {
        description: `${data.name} has been successfully created.`,
      });
    } catch (err) {
      toast.error("Failed to create organization", {
        description: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyInvitationLink = async () => {
    if (!invitationLink) return;
    await navigator.clipboard.writeText(invitationLink);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // Success state - show invitation link
  if (invitationLink) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/orgs">
            <Button variant="ghost" size="sm" className="text-zinc-400">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Organizations
            </Button>
          </Link>
        </div>

        <Card className="border-emerald-500/20 bg-zinc-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                <Check className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-white">Organization Created!</CardTitle>
                <CardDescription>
                  Send the invitation link to the organization owner
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">
                Invitation Link
              </label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={invitationLink}
                  className="flex-1 border-zinc-700 bg-zinc-800 font-mono text-sm text-white"
                />
                <Button
                  onClick={copyInvitationLink}
                  variant="outline"
                  className="border-zinc-700 text-zinc-300"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                This link will allow the owner to set up their account and access the organization.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Link href="/admin/orgs" className="flex-1">
                <Button variant="outline" className="w-full border-zinc-700 text-zinc-300">
                  View All Organizations
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setInvitationLink(null);
                  setValue("name", "");
                  setValue("slug", "");
                  setValue("owner_email", "");
                }}
                className="flex-1 bg-amber-500 text-black hover:bg-amber-400"
              >
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orgs">
          <Button variant="ghost" size="sm" className="text-zinc-400">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Organizations
          </Button>
        </Link>
      </div>

      {/* Form Card */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
              <Building2 className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-white">New Organization</CardTitle>
              <CardDescription>
                Provision a new client organization
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Organization Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Organization Name
              </label>
              <Input
                {...register("name")}
                onChange={handleNameChange}
                placeholder="e.g., Acme Tax Prep"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Organization Slug
                <span className="ml-2 text-xs text-zinc-500">(URL identifier)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">numbersence.com/</span>
                <Input
                  {...register("slug")}
                  placeholder="acme-tax-prep"
                  className="flex-1 border-zinc-700 bg-zinc-800 font-mono text-amber-500 placeholder:text-zinc-600"
                />
              </div>
              {errors.slug && (
                <p className="mt-1 text-sm text-red-400">{errors.slug.message}</p>
              )}
              <p className="mt-1 text-xs text-zinc-500">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>

            {/* Owner Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Owner Email
                <span className="ml-2 text-xs text-zinc-500">(Primary admin)</span>
              </label>
              <Input
                {...register("owner_email")}
                type="email"
                placeholder="owner@acmetax.com"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
              {errors.owner_email && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.owner_email.message}
                </p>
              )}
            </div>

            {/* Subscription Tier */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Subscription Tier
              </label>
              <div className="grid grid-cols-3 gap-3">
                {TIER_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                      tier === option.value
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    <input
                      type="radio"
                      {...register("subscription_tier")}
                      value={option.value}
                      className="sr-only"
                    />
                    <div className="flex flex-col gap-1">
                      <span
                        className={`font-medium ${
                          tier === option.value ? "text-amber-500" : "text-white"
                        }`}
                      >
                        {option.label}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {option.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Preview */}
            {name && slug && (
              <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                <p className="mb-2 text-xs font-medium uppercase text-zinc-500">
                  Preview
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-700">
                    <Building2 className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{name}</p>
                    <p className="text-sm text-zinc-500">
                      numbersence.com/<span className="text-amber-500">{slug}</span>
                    </p>
                  </div>
                  <Badge className="ml-auto capitalize" variant="outline">
                    {tier}
                  </Badge>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Link href="/admin/orgs" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-zinc-700 text-zinc-300"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-amber-500 text-black hover:bg-amber-400"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Organization"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
