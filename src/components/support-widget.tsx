"use client";

import { useState } from "react";
import { MessageCircle, X, ChevronRight, Send, ArrowLeft, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type View = "faq" | "contact";

const FAQ_ITEMS = [
  {
    question: "How do I invite team members?",
    answer: "Go to Settings → Team → Invite Members",
  },
  {
    question: "How does multi-tenancy work?",
    answer: "Each organization has isolated data via Row Level Security",
  },
  {
    question: "What are the API rate limits?",
    answer: "1000 requests/minute for standard, 5000 for enterprise",
  },
];

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>("faq");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = () => {
    if (!message.trim()) return;
    // Mock submission - would send to Azure Queue in production
    console.log("Support message:", message);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMessage("");
      setView("faq");
    }, 2000);
  };

  const resetWidget = () => {
    setView("faq");
    setMessage("");
    setSubmitted(false);
    setExpandedFaq(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Popover */}
      <div
        className={cn(
          "absolute bottom-14 right-0 w-80 origin-bottom-right transition-all duration-200",
          isOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        )}
      >
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-2">
              {view === "contact" && (
                <button
                  onClick={() => setView("faq")}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <span className="font-medium">
                {view === "faq" ? "Help & Support" : "Contact Us"}
              </span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                resetWidget();
              }}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {view === "faq" && (
              <div className="space-y-2">
                <p className="mb-3 text-sm text-muted-foreground">
                  Frequently asked questions
                </p>
                {FAQ_ITEMS.map((item, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg border border-border"
                  >
                    <button
                      onClick={() =>
                        setExpandedFaq(expandedFaq === index ? null : index)
                      }
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-muted/50"
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        {item.question}
                      </span>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          expandedFaq === index && "rotate-90"
                        )}
                      />
                    </button>
                    {expandedFaq === index && (
                      <div className="border-t border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}

                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Can't find what you're looking for?
                  </p>
                  <button
                    onClick={() => setView("contact")}
                    className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Contact Us
                  </button>
                </div>
              </div>
            )}

            {view === "contact" && (
              <div>
                {submitted ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
                      <Send className="h-5 w-5 text-emerald-500" />
                    </div>
                    <p className="font-medium">Message sent!</p>
                    <p className="text-sm text-muted-foreground">
                      We'll get back to you soon
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="mb-3 text-sm text-muted-foreground">
                      Describe your issue and we'll respond via email
                    </p>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help?"
                      rows={4}
                      className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={!message.trim()}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      Send Message
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2.5 font-medium shadow-lg transition-all",
          isOpen
            ? "bg-muted text-foreground"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
        <span className="text-sm">{isOpen ? "Close" : "Support"}</span>
      </button>
    </div>
  );
}
