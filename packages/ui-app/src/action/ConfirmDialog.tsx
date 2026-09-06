import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@humble/ui-base";

/** The confirmation an action asked for. Presentation only: confirming dispatches the op. */
export function ConfirmDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean | undefined;
  onConfirm: () => void;
  testId?: string | undefined;
}) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent data-testid={props.testId}>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.body}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>
            Go back
          </Button>
          <Button
            variant={props.destructive ? "destructive" : "default"}
            onClick={() => {
              props.onOpenChange(false);
              props.onConfirm();
            }}
            data-testid={props.testId ? `${props.testId}-confirm` : undefined}
          >
            {props.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
