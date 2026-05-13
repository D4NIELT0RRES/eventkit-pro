import { z } from 'zod';

export const CreateEquipmentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').trim(),
  patrimonyNo: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().positive('Quantidade deve ser maior que zero'),
  categoryId: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const RegisterMovementSchema = z.object({
  equipmentId: z.string().min(1, 'ID do equipamento é obrigatório'),
  quantity: z.number().positive('Quantidade deve ser maior que zero'),
  type: z.enum(['saida', 'entrada', 'retorno', 'ajuste']),
  workOrderId: z.string().optional(),
  notes: z.string().optional(),
  reference: z.string().optional(),
});

export const CreateKitSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').trim(),
  description: z.string().optional(),
  items: z
    .array(
      z.object({
        equipmentId: z.string().min(1),
        quantity: z.number().positive(),
      })
    )
    .min(1, 'Kit deve ter pelo menos um item'),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateWorkOrderSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').trim(),
  description: z.string().optional(),
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  technicianId: z.string().optional(),
  items: z
    .array(
      z.object({
        equipmentId: z.string().min(1),
        quantity: z.number().positive(),
      })
    )
    .min(1, 'Ordem de serviço deve ter pelo menos um item'),
  priority: z.enum(['baixa', 'media', 'alta']).optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export type CreateEquipmentInput = z.infer<typeof CreateEquipmentSchema>;
export type RegisterMovementInput = z.infer<typeof RegisterMovementSchema>;
export type CreateKitInput = z.infer<typeof CreateKitSchema>;
export type CreateWorkOrderInput = z.infer<typeof CreateWorkOrderSchema>;
