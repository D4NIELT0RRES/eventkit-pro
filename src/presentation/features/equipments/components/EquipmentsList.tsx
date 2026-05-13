import React, { useEffect, useState } from 'react';
import { useEquipmentService } from '../../hooks/use-app-context';
import { EquipmentResponseDTO } from '../../core/application/dtos';
import { validatePaginationParams } from '../../shared/utils/pagination';

interface EquipmentListProps {
  refreshTrigger?: number;
}

export function EquipmentsList({ refreshTrigger = 0 }: EquipmentListProps) {
  const equipmentService = useEquipmentService();
  const [equipments, setEquipments] = useState<EquipmentResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadEquipments = async () => {
    setLoading(true);
    setError(null);
    try {
      const pagination = validatePaginationParams(page, 10);
      const result = await equipmentService.list({}, pagination);
      setEquipments(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar equipamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipments();
  }, [page, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este equipamento?')) return;

    setDeleting(id);
    try {
      // Você pode adicionar este método later
      // await equipmentService.delete(id);
      alert('Funcionalidade de delete será implementada no repositório');
      // loadEquipments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao deletar');
    } finally {
      setDeleting(null);
    }
  };

  if (loading && equipments.length === 0) {
    return <div className="text-center py-8">Carregando equipamentos...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Marca</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Modelo</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Total</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Disponível</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {equipments.map((equipment) => (
                <tr key={equipment.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm">{equipment.name}</td>
                  <td className="px-6 py-3 text-sm">{equipment.brand || '-'}</td>
                  <td className="px-6 py-3 text-sm">{equipment.model || '-'}</td>
                  <td className="px-6 py-3 text-sm text-center font-medium">{equipment.quantity}</td>
                  <td className="px-6 py-3 text-sm text-center">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                        equipment.availableQuantity === 0
                          ? 'bg-red-500'
                          : equipment.availableQuantity < equipment.quantity / 2
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                      }`}
                    >
                      {equipment.availableQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        equipment.status === 'ativo'
                          ? 'bg-green-100 text-green-800'
                          : equipment.status === 'inativo'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {equipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-center">
                    <button
                      onClick={() => handleDelete(equipment.id)}
                      disabled={deleting === equipment.id}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400 text-sm font-medium"
                    >
                      {deleting === equipment.id ? 'Deletando...' : 'Deletar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      {total > 10 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2">
            Página {page} de {Math.ceil(total / 10)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 10)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
