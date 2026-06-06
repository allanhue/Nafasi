import React from "react";

type FeatureCardVariant = "purple" | "blue" | "orange" | "red" | "green" | "pink" | "cyan" | "indigo" | "emerald";

const variantStyles: Record<FeatureCardVariant, { bg: string; border: string; text: string; icon: string }> = {
  purple: { bg: "bg-purple-50 hover:bg-purple-100", border: "border-purple-200 hover:border-purple-300", text: "text-purple-700", icon: "text-purple-600" },
  blue: { bg: "bg-blue-50 hover:bg-blue-100", border: "border-blue-200 hover:border-blue-300", text: "text-blue-700", icon: "text-blue-600" },
  orange: { bg: "bg-orange-50 hover:bg-orange-100", border: "border-orange-200 hover:border-orange-300", text: "text-orange-700", icon: "text-orange-600" },
  red: { bg: "bg-red-50 hover:bg-red-100", border: "border-red-200 hover:border-red-300", text: "text-red-700", icon: "text-red-600" },
  green: { bg: "bg-green-50 hover:bg-green-100", border: "border-green-200 hover:border-green-300", text: "text-green-700", icon: "text-green-600" },
  pink: { bg: "bg-pink-50 hover:bg-pink-100", border: "border-pink-200 hover:border-pink-300", text: "text-pink-700", icon: "text-pink-600" },
  cyan: { bg: "bg-cyan-50 hover:bg-cyan-100", border: "border-cyan-200 hover:border-cyan-300", text: "text-cyan-700", icon: "text-cyan-600" },
  indigo: { bg: "bg-indigo-50 hover:bg-indigo-100", border: "border-indigo-200 hover:border-indigo-300", text: "text-indigo-700", icon: "text-indigo-600" },
  emerald: { bg: "bg-emerald-50 hover:bg-emerald-100", border: "border-emerald-200 hover:border-emerald-300", text: "text-emerald-700", icon: "text-emerald-600" },
};

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  variant?: FeatureCardVariant;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  variant = "blue",
}: FeatureCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={`${styles.bg} ${styles.border} rounded-lg border p-4 transition-all duration-300 hover:shadow-md cursor-pointer group`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`${styles.icon} w-6 h-6 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <h3 className={`${styles.text} font-semibold text-sm`}>{title}</h3>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
