import { ChevronDown } from 'lucide-react';
import { useActionStore, type Action } from '@/stores/action-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActionButtonProps {
  actions: Action[];
  selectedIds: string[];
}

export function ActionButton({ actions, selectedIds }: ActionButtonProps) {
  const { openActionModal } = useActionStore();

  if (actions.length === 0) return null;

  // Filter actions that are available on index view
  const indexActions = actions.filter((a) => !a.onlyOnDetail);

  if (indexActions.length === 0) return null;

  const handleActionClick = (action: Action) => {
    openActionModal(action, selectedIds);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={selectedIds.length === 0}>
          Actions
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={{ width: "max-content" }}>
        {indexActions.map((action) => (
          <DropdownMenuItem
            key={action.slug}
            onClick={() => handleActionClick(action)}
            className={action.destructive ? 'text-destructive' : ''}
          >
            {action.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
