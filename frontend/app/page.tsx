'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getUsers, executeFlow, clearData, type User } from '@/lib/api'
import { ThemeToggle } from '@/components/theme-toggle'
import { Inbox, Loader2, Play, Trash2 } from 'lucide-react'

let initialLoadStarted = false

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const usersPerPage = 10;

  useEffect(() => {
    if (initialLoadStarted) return
    initialLoadStarted = true
    async function loadUsers() {
      const result = await getUsers();
      if (result.success && result.data) {
        setUsers(result.data);
      }
      setInitialLoading(false);
    }
    loadUsers();
  }, []);

  const handleExecute = async () => {
    setLoading(true);

    try {
      const result = await executeFlow();

      if (result.success) {
        const usersResult = await getUsers();
        if (usersResult.success && usersResult.data) {
          setUsers(usersResult.data);
          setCurrentPage(1);
          toast.success(`${usersResult.data.length} usuários carregados`);
        } else {
          toast.success(result.message || 'Dados processados');
        }
      } else {
        toast.error(result.error || 'Erro ao processar');
      }
    } catch {
      toast.error('Erro ao executar fluxo');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);

    try {
      const result = await clearData();

      if (result.success) {
        setUsers([]);
        setCurrentPage(1);
        toast.success('Dados limpos');
      } else {
        toast.error(result.error || 'Erro ao limpar');
      }
    } catch {
      toast.error('Erro ao limpar dados');
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    const calculatedPages = Math.ceil(users.length / usersPerPage);
    setTotalPages(calculatedPages);
  }, [users]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <main className="h-screen overflow-hidden bg-page-pattern relative">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-7xl h-full flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 sm:gap-0 flex-shrink-0 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                Teste FullStack - Lucas Vital
              </h1>
              {users.length > 0 && (
                <Badge variant="secondary">{users.length} registros</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dashboard de dados
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <ThemeToggle />
            <Button
              onClick={handleExecute}
              disabled={loading || clearing}
              variant="default"
              className="flex-1 sm:flex-none px-4 sm:px-6 shadow-sm text-sm transition-colors transition-transform hover:scale-[1.02] active:scale-[0.98]"
              size="default"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Processando</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Executar
                </>
              )}
            </Button>
            
            <Button
              onClick={handleClear}
              disabled={loading || clearing}
              variant="outline"
              className="flex-1 sm:flex-none px-4 sm:px-6 shadow-sm text-sm transition-colors transition-transform hover:scale-[1.02] active:scale-[0.98] border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive/70"
              size="default"
            >
              {clearing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Limpando</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar
                </>
              )}
            </Button>
          </div>
        </div>

        <Card className="overflow-x-auto flex-shrink-0 rounded-xl border-border shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-0">
            {initialLoading ? (
              <div className="w-full">
                <div className="border-b border-border bg-muted/50 flex w-full gap-2 sm:gap-4 px-3 sm:px-4 py-2.5">
                  <Skeleton className="h-5 w-12 sm:w-16 flex-shrink-0" />
                  <Skeleton className="h-5 flex-1 max-w-[120px] sm:max-w-[180px]" />
                  <Skeleton className="hidden md:block h-5 flex-1 max-w-[160px]" />
                  <Skeleton className="h-5 w-20 sm:w-24 flex-shrink-0" />
                </div>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex w-full gap-2 sm:gap-4 px-3 sm:px-4 py-2.5 border-b border-border last:border-b-0"
                  >
                    <Skeleton className="h-5 w-12 sm:w-16 flex-shrink-0" />
                    <Skeleton className="h-5 flex-1 max-w-[120px] sm:max-w-[180px]" />
                    <Skeleton className="hidden md:block h-5 flex-1 max-w-[160px]" />
                    <Skeleton className="h-5 w-20 sm:w-24 flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border bg-muted/50">
                  <TableHead className="w-16 sm:w-20 font-semibold text-muted-foreground tracking-tight h-9 sm:h-10 text-xs sm:text-sm py-2">
                    ID
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground tracking-tight h-9 sm:h-10 text-xs sm:text-sm py-2">
                    Nome
                  </TableHead>
                  <TableHead className="hidden md:table-cell font-semibold text-muted-foreground tracking-tight h-9 sm:h-10 text-xs sm:text-sm py-2">
                    Email
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground tracking-tight h-9 sm:h-10 text-xs sm:text-sm py-2">
                    Telefone
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  <>
                    {currentUsers.map((user, i) => (
                      <TableRow
                        key={user.id}
                        className={`hover:bg-muted/50 transition-colors h-9 sm:h-10 border-border ${i % 2 === 1 ? 'bg-muted/30' : ''}`}
                      >
                        <TableCell className="font-medium text-foreground text-xs sm:text-sm py-2">
                          {user.id}
                        </TableCell>
                        <TableCell className="text-foreground text-xs sm:text-sm py-2">
                          {user.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-xs sm:text-sm py-2">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs sm:text-sm py-2">
                          {user.phone}
                        </TableCell>
                      </TableRow>
                    ))}
                    {currentUsers.length < usersPerPage &&
                      Array.from({
                        length: usersPerPage - currentUsers.length,
                      }).map((_, j) => (
                        <TableRow
                          key={`empty-${j}`}
                          className={`h-9 sm:h-10 border-border ${(currentUsers.length + j) % 2 === 1 ? 'bg-muted/30' : ''}`}
                        >
                          <TableCell
                            colSpan={4}
                            className="text-transparent md:hidden"
                          >
                            -
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-transparent">
                            -
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-transparent">
                            -
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-transparent">
                            -
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-transparent">
                            -
                          </TableCell>
                        </TableRow>
                      ))}
                  </>
                ) : (
                <TableRow className="h-[320px] sm:h-[360px] border-border bg-muted/20">
                  <TableCell colSpan={4} className="text-center md:hidden p-0"></TableCell>
                  <TableCell colSpan={4} className="hidden md:table-cell text-center p-0 align-middle">
                    <div className="flex flex-col items-center justify-center py-10">
                      <Inbox className="w-14 h-14 text-muted-foreground mb-3" strokeWidth={1.5} />
                      <p className="text-muted-foreground font-medium mb-1">Nenhum dado disponível</p>
                      <p className="text-sm text-muted-foreground/80">Clique em Executar para carregar os dados</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
            )}
          </CardContent>
        </Card>

        {users.length > 0 && (
          <Pagination className="mt-3 sm:mt-4 flex-shrink-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1 || totalPages <= 1}
                />
              </PaginationItem>
              {totalPages > 1 &&
                Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const maxVisible = 5
                  let pageNum: number
                  if (totalPages <= maxVisible) {
                    pageNum = i + 1
                  } else if (currentPage <= Math.ceil(maxVisible / 2)) {
                    pageNum = i + 1
                  } else if (
                    currentPage >=
                    totalPages - Math.floor(maxVisible / 2)
                  ) {
                    pageNum = totalPages - maxVisible + i + 1
                  } else {
                    pageNum =
                      currentPage - Math.floor(maxVisible / 2) + i
                  }
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        onClick={() => paginate(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => paginate(currentPage + 1)}
                  disabled={
                    currentPage === totalPages || totalPages <= 1
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

      </div>
    </main>
  )
}
