"use client";

import { useState } from "react"

interface MatchScoreProps {
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  breakdown?: { price: number; quality: number; quantity: number; location: number }
  interactive?: boolean
}

function scoreColor(score: number) {
  if (score >= 90) return { ring: "#1B7A3D", bg: "#1B7A3D", text: "white", label: "Excellent" }
  if (score >= 80) return { ring: "#22A357", bg: "#22A357", text: "white", label: "Good" }
  if (score >= 70) return { ring: "#E9A23B", bg: "#E9A23B", text: "white", label: "Fair" }
  return { ring: "#D94F4F", bg: "#D94F4F", text: "white", label: "Poor" }
}

interface ScoreRingProps {
  score: number
  size: number
  strokeWidth: number
}

function ScoreRing({ score, size, strokeWidth }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const colors = scoreColor(score)

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#DDE8E1"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colors.ring}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
      />
    </svg>
  )
}

function ScoreBreakdownBar({ label, score }: { label: string; score: number }) {
  const colors = scoreColor(score)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-sage w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-ivory-deeper rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: colors.ring }}
        />
      </div>
      <span className="font-mono text-xs font-medium text-forest w-6 text-right">{score}</span>
    </div>
  )
}

export default function MatchScore({
  score,
  size = "md",
  showLabel = true,
  breakdown,
  interactive = true,
}: MatchScoreProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const colors = scoreColor(score)

  const sizeConfig = {
    sm: { ring: 48, stroke: 4, numSize: "text-sm", labelSize: "text-[10px]" },
    md: { ring: 64, stroke: 5, numSize: "text-lg", labelSize: "text-[11px]" },
    lg: { ring: 84, stroke: 6, numSize: "text-2xl", labelSize: "text-xs" },
  }

  const cfg = sizeConfig[size]

  const badge = (
    <div
      className={`relative inline-flex flex-col items-center justify-center ${interactive && breakdown ? "cursor-pointer" : ""}`}
      style={{ width: cfg.ring, height: cfg.ring }}
      onClick={() => interactive && breakdown && setShowBreakdown(!showBreakdown)}
      title={interactive && breakdown ? "View score breakdown" : undefined}
    >
      <div className="absolute inset-0">
        <ScoreRing score={score} size={cfg.ring} strokeWidth={cfg.stroke} />
      </div>
      <span
        className={`font-mono font-semibold leading-none ${cfg.numSize}`}
        style={{ color: colors.ring }}
      >
        {score}
      </span>
      {showLabel && (
        <span
          className={`leading-none mt-0.5 ${cfg.labelSize}`}
          style={{ color: colors.ring, opacity: 0.75 }}
        >
          Match
        </span>
      )}
    </div>
  )

  if (!breakdown) return badge

  const highlights = [
    score >= 90 && "Excellent price for your requirement",
    breakdown.quality >= 90 && "Preferred quality available",
    breakdown.quantity >= 90 && "Meets required quantity",
    breakdown.location >= 80 && "Nearby source",
  ].filter(Boolean) as string[]

  return (
    <div className="relative">
      {badge}
      {showBreakdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowBreakdown(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-border shadow-lg z-50 p-4 slide-up">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span
                  className="font-mono text-2xl font-semibold"
                  style={{ color: colors.ring }}
                >
                  {score}
                </span>
                <span className="text-xs text-sage ml-1">/100</span>
              </div>
              <span
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{
                  backgroundColor: colors.ring + "18",
                  color: colors.ring,
                }}
              >
                {colors.label} match
              </span>
            </div>

            <div className="space-y-2 mb-3 pb-3 border-b border-border">
              <ScoreBreakdownBar label="Price" score={breakdown.price} />
              <ScoreBreakdownBar label="Quality" score={breakdown.quality} />
              <ScoreBreakdownBar label="Quantity" score={breakdown.quantity} />
              <ScoreBreakdownBar label="Location" score={breakdown.location} />
            </div>

            {highlights.length > 0 && (
              <div className="space-y-1">
                {highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-forest-mid">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="6" fill="#1B7A3D" fillOpacity="0.12" />
                      <path d="M3.5 6l2 2 3-3" stroke="#1B7A3D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {h}
                  </div>
                ))}
              </div>
            )}

            <button
              className="mt-3 w-full text-xs text-sage hover:text-forest transition-colors"
              onClick={() => setShowBreakdown(false)}
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  )
}
