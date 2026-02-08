/**
 * LensSelector Component
 *
 * Resource için mevcut lens'leri dropdown menu olarak gösterir.
 * Laravel Nova'nın LensSelector.vue component'inden esinlenilmiştir.
 *
 * Kullanım:
 * ```tsx
 * <LensSelector
 *   resourceName="users"
 *   lenses={lenses}
 *   currentLens="active-users"
 * />
 * ```
 */

import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Filter, ChevronDown } from 'lucide-react';
import type { LensSelectorProps } from '@/types/lens';
import { cn } from '@/lib/utils';

/**
 * LensSelector Component
 *
 * @param resourceName - Resource adı (örn: "users")
 * @param lenses - Mevcut lens'ler listesi
 * @param currentLens - Şu anda aktif olan lens slug'ı (opsiyonel)
 */
export function LensSelector({
  resourceName,
  lenses,
  currentLens,
}: LensSelectorProps) {
  // Lens yoksa component'i gösterme
  if (!lenses || lenses.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Lens
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {lenses.map((lens) => (
          <DropdownMenuItem key={lens.slug} asChild>
            <Link
              to={`/resource/${resourceName}/lens/${lens.slug}`}
              className={cn(
                'cursor-pointer',
                currentLens === lens.slug && 'bg-accent'
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{lens.name}</span>
                {lens.description && (
                  <span className="text-xs text-muted-foreground">
                    {lens.description}
                  </span>
                )}
              </div>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
