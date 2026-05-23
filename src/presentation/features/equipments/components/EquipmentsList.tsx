import React, { useEffect, useState } from 'react';
import { useEquipmentService } from '../../hooks/use-app-context';
import { EquipmentResponseDTO } from '../../core/application/dtos';
import { validatePaginationParams } from '../../shared/utils/pagination';

interface EquipmentListProps {
  refreshTrigger?: number;
}

interface AdjustModalState {
  equipment: EquipmentResponseDTO;
  quantity: number;
  availableQuantity: number;
}

export function EquipmentsList({ refreshTrigger = 0 }: EquipmentListProps) {
  const equipmentService = useEquipmentService();
  const [equipments, setEquipments] = useState<EquipmentResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [adjustModal, setAdjustModal] = useState<AdjustModalState | null>(null);
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

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
      alert('Funcionalidade de delete será implementada no repositório');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao deletar');
    } finally {
      setDeleting(null);
    }
  };

  const openAdjustModal = (equipment: EquipmentResponseDTO) => {
    setAdjustError(null);
    setAdjustModal({
      equipment,
      quantity: equipment.quantity,
      availableQuantity: equipment.availableQuantity,
    });
  };

  const closeAdjustModal = () => {
    setAdjustModal(null);
    setAdjustError(null);
  };

  const handleAdjustSubmit = async () => {
    if (!adjustModal) return;

    if (adjustModal.quantity <= 0) {
      setAdjustError('Quantidade total deve ser maior que zero');
      return;
    }
    if (adjustModal.availableQuantity < 0) {
      setAdjustError('Quantidade disponível não pode ser negativa');
      return;
    }
    if (adjustModal.availableQuantity > adjustModal.quantity) {
      setAdjustError('Quantidade disponível não pode ser maior que a total');
      return;
    }

    setAdjusting(true);
    setAdjustError(null);
    try {
      await equipmentService.adjustStock(adjustModal.equipment.id, {
        quantity: adjustModal.quantity,
        availableQuantity: adjustModal.availableQuantity,
        reason: 'Ajuste manual',
      });
      closeAdjustModal();
      loadEquipments();
    } catch (err) {
      setAdjustError(err instanceof Error ? err.message : 'Erro ao ajustar estoque');
    } finally {
      setAdjusting(false);
    }
  };

  if (loading && equipments.length === 0) {
    return <div className="text-center py-8">Carregando equipamentos...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">{error}</div>;
  }

  return (
    <>
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
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openAdjustModal(equipment)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ajustar
                        </button>
                        <button
                          onClick={() => handleDelete(equipment.id)}
                          disabled={deleting === equipment.id}
                          className="text-red-600 hover:text-red-800 disabled:text-gray-400 text-sm font-medium"
                        >
                          {deleting === equipment.id ? 'Deletando...' : 'Deletar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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

      {/* Modal de ajuste de estoque */}
      {adjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Ajustar Estoque</h2>
            <p className="text-sm text-gray-500 mb-4">{adjustModal.equipment.name}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade Total
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setAdjustModal((prev) =>
                        prev ? { ...prev, quantity: Math.max(1, prev.quantity - 1) } : prev
                      )
                    }
                    className="w-9 h-9 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold text-lg"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={adjustModal.quantity}
                    onChange={(e) =>
                      setAdjustModal((prev) =>
                        prev ? { ...prev, quantity: parseInt(e.target.value) || 0 } : prev
                      )
                    }
                    className="w-20 text-center border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() =>
                      setAdjustModal((prev) =>
                        prev ? { ...prev, quantity: prev.quantity + 1 } : prev
                      )
                    }
                    className="w-9 h-9 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade Disponível
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setAdjustModal((prev) =>
                        prev ? { ...prev, availableQuantity: Math.max(0, prev.availableQuantity - 1) } : prev
                      )
                    }
                    className="w-9 h-9 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold text-lg"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={adjustModal.quantity}
                    value={adjustModal.availableQuantity}
                    onChange={(e) =>
                      setAdjustModal((prev) =>
                        prev ? { ...prev, availableQuantity: parseInt(e.target.value) || 0 } : prev
                      )
                    }
                    className="w-20 text-center border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() =>
                      setAdjustModal((prev) =>
                        prev ? { ...prev, availableQuantity: Math.min(prev.quantity, prev.availableQuantity + 1) } : prev
                      )
                    }
                    className="w-9 h-9 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold text-lg"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Em uso: {adjustModal.quantity - adjustModal.availableQuantity}
                </p>
              </div>
            </div>

            {adjustError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {adjustError}
              </p>
            )}

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={closeAdjustModal}
                disabled={adjusting}
                className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdjustSubmit}
                disabled={adjusting}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {adjusting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
