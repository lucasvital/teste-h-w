'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { executeFlow, clearData, getUsers } from './actions/users'
import { Loader2, Play, Trash2 } from 'lucide-react'

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const usersPerPage = 10;

  useEffect(() => {
    async function loadUsers() {
      const result = await getUsers();
      if (result.success && result.data) {
        setUsers(result.data);
      }
    }
    loadUsers();
  }, []);

  const handleExecute = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const result = await executeFlow();
      
      if (result.success) {
        const usersResult = await getUsers();
        if (usersResult.success && usersResult.data) {
          setUsers(usersResult.data);
          setCurrentPage(1);
          setMessage({ 
            type: 'success', 
            text: `${usersResult.data.length} usuários carregados`
          });
        } else {
          setMessage({ 
            type: 'success', 
            text: result.message || 'Dados processados'
          });
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Erro ao processar'
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Erro ao executar fluxo'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    setMessage(null);

    try {
      const result = await clearData();
      
      if (result.success) {
        setUsers([]);
        setCurrentPage(1);
        setMessage({ 
          type: 'success', 
          text: 'Dados limpos'
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Erro ao limpar'
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Erro ao limpar dados'
      });
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    const calculatedPages = Math.ceil(users.length / usersPerPage);
    setTotalPages(calculatedPages);
  }, [users]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <main className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 relative">
      {message && (
        <div 
          className={`fixed top-4 right-4 z-50 p-3 rounded-lg border shadow-lg text-sm font-medium transition-all duration-300 animate-in slide-in-from-top-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-7xl h-full flex flex-col">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 sm:gap-0 flex-shrink-0">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              Teste FullStack - Lucas Vital
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Dashboard de dados
            </p>
          </div>
          
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Button 
              onClick={handleExecute} 
              disabled={loading || clearing}
              className="flex-1 sm:flex-none px-4 sm:px-6 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-sm hover:shadow-md text-sm"
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
              className="flex-1 sm:flex-none px-4 sm:px-6 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
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

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto flex-shrink-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b bg-gray-50">
                <TableHead className="w-16 sm:w-20 font-semibold text-gray-700 h-9 sm:h-10 text-xs sm:text-sm py-2">ID</TableHead>
                <TableHead className="font-semibold text-gray-700 h-9 sm:h-10 text-xs sm:text-sm py-2">Nome</TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-gray-700 h-9 sm:h-10 text-xs sm:text-sm py-2">Email</TableHead>
                <TableHead className="font-semibold text-gray-700 h-9 sm:h-10 text-xs sm:text-sm py-2">Telefone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                <>
                  {currentUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50 transition-colors h-9 sm:h-10">
                      <TableCell className="font-medium text-gray-900 text-xs sm:text-sm py-2">{user.id}</TableCell>
                      <TableCell className="text-gray-800 text-xs sm:text-sm py-2">{user.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-gray-600 text-xs sm:text-sm py-2">{user.email}</TableCell>
                      <TableCell className="text-gray-600 text-xs sm:text-sm py-2">{user.phone}</TableCell>
                    </TableRow>
                  ))}
                  {currentUsers.length < usersPerPage && Array.from({ length: usersPerPage - currentUsers.length }).map((_, i) => (
                    <TableRow key={`empty-${i}`} className="h-9 sm:h-10">
                      <TableCell colSpan={4} className="text-transparent md:hidden">-</TableCell>
                      <TableCell className="hidden md:table-cell text-transparent">-</TableCell>
                      <TableCell className="hidden md:table-cell text-transparent">-</TableCell>
                      <TableCell className="hidden md:table-cell text-transparent">-</TableCell>
                      <TableCell className="hidden md:table-cell text-transparent">-</TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                <TableRow className="h-[360px] sm:h-[400px]">
                  <TableCell colSpan={4} className="text-center md:hidden"></TableCell>
                  <TableCell colSpan={4} className="hidden md:table-cell text-center">
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="text-gray-400 mb-3">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium mb-1">Nenhum dado disponível</p>
                      <p className="text-sm text-gray-500">Clique em Executar para carregar os dados</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {users.length > 0 && (
          <div className="flex justify-center items-center gap-1 sm:gap-2 mt-3 sm:mt-4 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1 || totalPages <= 1}
              className="border-gray-300 hover:bg-gray-100 px-4 text-sm"
            >
              PREVIOUS
            </Button>
            
            {totalPages > 1 && Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const maxVisible = 5;
              let pageNum;
              if (totalPages <= maxVisible) {
                pageNum = i + 1;
              } else if (currentPage <= Math.ceil(maxVisible / 2)) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - Math.floor(maxVisible / 2)) {
                pageNum = totalPages - maxVisible + i + 1;
              } else {
                pageNum = currentPage - Math.floor(maxVisible / 2) + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => paginate(pageNum)}
                  className={currentPage === pageNum 
                    ? "bg-blue-600 hover:bg-blue-700 text-white min-w-[32px] sm:min-w-[40px] text-xs sm:text-sm" 
                    : "border-gray-300 hover:bg-gray-100 min-w-[32px] sm:min-w-[40px] text-xs sm:text-sm"
                  }
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages <= 1}
              className="border-gray-300 hover:bg-gray-100 px-4 text-sm"
            >
              NEXT
            </Button>
          </div>
        )}

      </div>
    </main>
  )
}
