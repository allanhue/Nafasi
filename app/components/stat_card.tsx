import React from "react";

type StatCardVariant = "purple" | "blue" | "orange" | "red" | "green" | "pink" | "cyan" | "indigo" | "emerald";

const variantStyles: Record<StatCardVariant, { bg: string; border: string; text: string; icon: string }> = {
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", icon: "text-purple-600" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: "text-blue-600" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", icon: "text-orange-600" },
  red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: "text-red-600" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: "text-green-600" },
  pink: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", icon: "text-pink-600" },
  cyan: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", icon: "text-cyan-600" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", icon: "text-indigo-600" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-600" },
};

interface StatCardProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  detail?: string;
  variant?: StatCardVariant;
}

export default function StatCard({
  icon: Icon,
  title,
  value,
  detail,
  variant = "blue",
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={`${styles.bg} ${styles.border} rounded-lg border p-5 transition-all duration-300 hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`${styles.text} text-sm font-semibold mb-2`}>{title}</p>
          <p className="text-3xl font-bold text-[#20231f]">{value}</p>
          {detail && <p className="text-xs text-gray-600 mt-2">{detail}</p>}
        </div>
        {Icon && <Icon className={`${styles.icon} w-8 h-8 flex-shrink-0`} />}
      </div>
    </div>
  );
}
