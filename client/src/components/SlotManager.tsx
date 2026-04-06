import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface SlotManagerProps {
  facilityId: number;
}

export function SlotManager({ facilityId }: SlotManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    slotNumber: "",
    level: "",
    type: "regular" as const,
    pricePerHour: 0,
    maxDuration: 24,
  });

  const slotsQuery = trpc.slots.getFacilitySlots.useQuery({ facilityId });
  const createSlotMutation = trpc.slots.create.useMutation();
  const updateSlotMutation = trpc.slots.update.useMutation();
  const deleteSlotMutation = trpc.slots.delete.useMutation();

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.slotNumber || formData.pricePerHour <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingSlotId) {
        await updateSlotMutation.mutateAsync({
          slotId: editingSlotId,
          ...formData,
          pricePerHour: formData.pricePerHour.toString(),
        });
        toast.success("Slot updated successfully");
      } else {
        await createSlotMutation.mutateAsync({
          facilityId,
          ...formData,
          pricePerHour: formData.pricePerHour.toString(),
        });
        toast.success("Slot created successfully");
      }
      setFormData({
        slotNumber: "",
        level: "",
        type: "regular",
        pricePerHour: 0,
        maxDuration: 24,
      });
      setEditingSlotId(null);
      setShowForm(false);
      slotsQuery.refetch();
    } catch (error) {
      toast.error(editingSlotId ? "Failed to update slot" : "Failed to create slot");
    }
  };

  const handleEditSlot = (slot: any) => {
    setFormData({
      slotNumber: slot.slotNumber,
      level: slot.level || "",
      type: slot.type || "regular",
      pricePerHour: Number(slot.pricePerHour),
      maxDuration: slot.maxDuration || 24,
    });
    setEditingSlotId(slot.id);
    setShowForm(true);
  };

  const handleDeleteSlot = async (slotId: number) => {
    if (!confirm("Are you sure you want to delete this slot?")) return;

    try {
      await deleteSlotMutation.mutateAsync({ slotId });
      toast.success("Slot deleted");
      slotsQuery.refetch();
    } catch (error) {
      toast.error("Failed to delete slot");
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      slotNumber: "",
      level: "",
      type: "regular",
      pricePerHour: 0,
      maxDuration: 24,
    });
    setEditingSlotId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Parking Slots</h3>
        <Button
          onClick={() => {
            if (!showForm) {
              handleCancelEdit();
            }
            setShowForm(!showForm);
          }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          {editingSlotId ? "Cancel Edit" : "Add Slot"}
        </Button>
      </div>

      {/* Add/Edit Slot Form */}
      {showForm && (
        <Card className="card-elevated p-6">
          <form onSubmit={handleAddSlot} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Slot Number *
                </label>
                <input
                  type="text"
                  value={formData.slotNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, slotNumber: e.target.value })
                  }
                  className="input-elegant"
                  placeholder="A1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Level
                </label>
                <input
                  type="text"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                  className="input-elegant"
                  placeholder="Ground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  className="input-elegant"
                >
                  <option value="regular">Regular</option>
                  <option value="compact">Compact</option>
                  <option value="handicap">Handicap</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price per Hour ($) *
                </label>
                <input
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerHour: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="input-elegant"
                  placeholder="5.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Max Duration (hours)
                </label>
                <input
                  type="number"
                  value={formData.maxDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxDuration: parseInt(e.target.value) || 24,
                    })
                  }
                  className="input-elegant"
                  placeholder="24"
                  min="1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createSlotMutation.isPending || updateSlotMutation.isPending}
                className="btn-primary"
              >
                {createSlotMutation.isPending || updateSlotMutation.isPending
                  ? editingSlotId
                    ? "Updating..."
                    : "Creating..."
                  : editingSlotId
                  ? "Update Slot"
                  : "Create Slot"}
              </Button>
              <Button
                type="button"
                onClick={handleCancelEdit}
                className="btn-secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Slots Grid */}
      {slotsQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="card-elevated p-4 animate-pulse">
              <div className="h-6 bg-slate-200 rounded mb-3"></div>
              <div className="h-4 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slotsQuery.data?.map((slot) => (
            <Card key={slot.id} className="card-elevated p-4 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{slot.slotNumber}</h4>
                  <p className="text-sm text-slate-600">{slot.level || 'Ground'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSlot(slot)}
                    className="p-2 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Type:</span> {slot.type}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Price:</span> ${slot.pricePerHour}/hour
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Max Duration:</span> {slot.maxDuration}h
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Status:</span>{" "}
                  <span className="capitalize">{slot.status || "available"}</span>
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
