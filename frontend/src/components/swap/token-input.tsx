import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Token } from "@/types/token";

interface TokenInputProps {
  token: Token;
  amount: string;
  onChange?: (value: string) => void;
  balance?: number;
  isLoadingBalance?: boolean;
  onMaxClick?: () => void;
  hasError?: boolean;
  readOnly?: boolean;
  label: string;
}

export function TokenInput({
  token,
  amount,
  onChange,
  balance,
  isLoadingBalance,
  onMaxClick,
  hasError,
  readOnly,
  label,
}: TokenInputProps) {
  return (
    <div className="rounded-lg border border-white/20 bg-black/30 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">{label}</span>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-white hover:bg-white/20 text-lg font-medium"
        >
          {token.icon} {token.symbol}
        </Button>
      </div>
      <Input
        type="number"
        placeholder="0.0"
        value={amount}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        disabled={readOnly}
        className={`border-0 bg-transparent text-lg md:text-xl lg:text-2xl font-bold focus-visible:ring-0 text-white placeholder-white/50 ${
          hasError ? "text-red-400" : ""
        }`}
      />
      <div className="flex justify-end">
        {onMaxClick ? (
          <Button
            variant="link"
            className="text-sm text-white/70 p-0 h-auto hover:text-white/90"
            onClick={onMaxClick}
          >
            {isLoadingBalance
              ? "Loading..."
              : balance
              ? `Balance: ${balance}`
              : null}
          </Button>
        ) : (
          <span className="text-sm text-white/70">
            {isLoadingBalance
              ? "Loading..."
              : balance
              ? `Balance: ${balance}`
              : null}
          </span>
        )}
      </div>
    </div>
  );
}