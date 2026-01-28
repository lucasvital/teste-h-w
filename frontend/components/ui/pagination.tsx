import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('flex justify-center', className)}
    {...props}
  />
)
Pagination.displayName = 'Pagination'

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1 sm:gap-2 list-none', className)}
    {...props}
  />
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn(className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

type PaginationLinkProps = {
  isActive?: boolean
} & React.ComponentProps<typeof Button>

const PaginationLink = ({
  className,
  isActive,
  ...props
}: PaginationLinkProps) => (
  <Button
    aria-current={isActive ? 'page' : undefined}
    variant={isActive ? 'default' : 'outline'}
    size="sm"
    className={cn(
      'min-w-[32px] sm:min-w-[40px] text-xs sm:text-sm',
      !isActive && 'border-border hover:bg-muted hover:text-muted-foreground',
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = 'PaginationLink'

type PaginationPreviousProps = React.ComponentProps<typeof Button>

const PaginationPrevious = ({ className, ...props }: PaginationPreviousProps) => (
  <Button
    aria-label="Página anterior"
    variant="outline"
    size="sm"
    className={cn(
      'border-border hover:bg-muted hover:text-muted-foreground px-4 text-sm',
      className
    )}
    {...props}
  >
    <ChevronLeft className="mr-1 h-4 w-4" />
    PREVIOUS
  </Button>
)
PaginationPrevious.displayName = 'PaginationPrevious'

type PaginationNextProps = React.ComponentProps<typeof Button>

const PaginationNext = ({ className, ...props }: PaginationNextProps) => (
  <Button
    aria-label="Próxima página"
    variant="outline"
    size="sm"
    className={cn(
      'border-border hover:bg-muted hover:text-muted-foreground px-4 text-sm',
      className
    )}
    {...props}
  >
    NEXT
    <ChevronRight className="ml-1 h-4 w-4" />
  </Button>
)
PaginationNext.displayName = 'PaginationNext'

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
}
