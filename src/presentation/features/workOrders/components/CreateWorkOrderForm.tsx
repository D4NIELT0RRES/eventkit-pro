import React, { useState, useEffect } from 'react';
import { useDI } from '../../hooks/use-app-context';
import { CreateWorkOrderDTO, WorkOrderItemDTO } from '../../core/application/dtos';

interface CreateWorkOrderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateWorkOrderForm({ onSuccess, onCancel }: CreateWorkOrderFormProps) {
  const { di } = useDI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [items, setItems] = useState<WorkOrderItemDTO[]>([]);

  const [formData, setFormData] = useState<CreateWorkOrderDTO>({
    title: '',
    description: '',
    clientId: '',
    technicianId: '',
    items: [],
    priority: 'media',
  });

  // Carregar equipamentos disponíveis
  useEffect(() => {
    loadEquipments();
  }, []);

  const loadEquipments = async () => {
    try {
      const result = await di.equipmentService.list({}, { page: 1, limit: 100 });
      setEquipments(result.items);
    } catch (err) {
      console.error('Erro ao carregar equipamentos:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddItem = () => {
    setItems([...items, { equipmentId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Adicione pelo menos um equipamento');
      return;
    }

    setLoading(true);

    try {
      const workOrderData = {
        ...formData,
        items,
      };

      await di.createWorkOrderUseCase.execute(workOrderData);
      setFormData({
        title: '',
        description: '',
        clientId: '',
        technicianId: '',
        items: [],
        priority: 'media',
      });
      setItems([]);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar ordem de serviço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow max-w-4xl">
      <h3 className="text-2xl font-bold mb-6">Nova Ordem de Serviço</h3>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Informações Básicas */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Informações Básicas</h4>

        <div>
          <label className="block text-sm font-medium mb-1">Título *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Ex: Montagem Som Evento XYZ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 h-24"
            placeholder="Detalhes adicionais sobre a ordem de serviço..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cliente *</label>
            <input
              type="text"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="ID ou Nome do Cliente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prioridade</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipamentos */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-lg">Equipamentos *</h4>
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
          >
            + Adicionar Equipamento
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded">
            Nenhum equipamento adicionado. Clique em "Adicionar Equipamento" para começar.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-3 items-end p-4 bg-gray-50 rounded border">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Equipamento</label>
                  <select
                    value={item.equipmentId}
                    onChange={(e) => handleItemChange(index, 'equipmentId', e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Selecione um equipamento</option>
                    {equipments.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} - {eq.brand} (Disponível: {eq.availableQuantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-32">
                  <label className="block text-sm font-medium mb-1">Quantidade</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    required
                    min="1"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumo */}
      {items.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          <p className="text-sm font-medium text-blue-900">
            Total de itens: {items.reduce((sum, item) => sum + item.quantity, 0)} unidades
          </p>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-2 pt-4 border-t">
        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
        >
          {loading ? 'Criando...' : 'Criar Ordem de Serviço'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 font-medium"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
