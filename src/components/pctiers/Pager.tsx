import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pager({
  page,
  pageCount,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPage: (p: number) => void;
}) {
  if (pageCount <= 1) return <p className="px-1 text-sm text-muted-foreground">{total} players</p>;
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Page {page} of {pageCount} · {total} players
      </p>
      <div className="flex gap-1.5">
        <Button variant="glass" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <ChevronLeft /> Prev
        </Button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            variant={p === page ? "hero" : "glass"}
            size="sm"
            className="hidden w-8 px-0 sm:inline-flex"
            onClick={() => onPage(p)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Button>
        ))}
        <Button variant="glass" size="sm" disabled={page >= pageCount} onClick={() => onPage(page + 1)} aria-label="Next page">
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
