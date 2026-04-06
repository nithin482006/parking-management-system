import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Trash2, Edit2 } from "lucide-react";

export function VehicleManager() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    licensePlate: "",
    vehicleType: "car" as const,
    color: "",
    model: "",
  });

  const vehiclesQuery = trpc.user.getVehicles.useQuery();
  const addVehicleMutation = trpc.user.addVehicle.useMutation();
  const deleteVehicleMutation = trpc.user.deleteVehicle.useMutation();

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.licensePlate) {
      toast.error("License plate is required");
      return;
    }

    try {
      await addVehicleMutation.mutateAsync(formData);
      toast.success("Vehicle added successfully");
      setFormData({ licensePlate: "", vehicleType: "car", color: "", model: "" });
      setShowForm(false);
      vehiclesQuery.refetch();
    } catch (error) {
      toast.error("Failed to add vehicle");
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await deleteVehicleMutation.mutateAsync({ vehicleId });
      toast.success("Vehicle deleted");
      vehiclesQuery.refetch();
    } catch (error) {
      toast.error("Failed to delete vehicle");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900">My Vehicles</h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Add Vehicle Form */}
      {showForm && (
        <Card className="card-elevated p-6 mb-4">
          <form onSubmit={handleAddVehicle} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  License Plate *
                </label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) =>
                    setFormData({ ...formData, licensePlate: e.target.value })
                  }
                  className="input-elegant"
                  placeholder="ABC-1234"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vehicle Type *
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleType: e.target.value as any,
                    })
                  }
                  className="input-elegant"
                >
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  className="input-elegant"
                  placeholder="Toyota Camry"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="input-elegant"
                  placeholder="Black"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={addVehicleMutation.isPending}
                className="btn-primary"
              >
                {addVehicleMutation.isPending ? "Adding..." : "Add Vehicle"}
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Vehicles List */}
      {vehiclesQuery.isLoading ? (
        <p className="text-slate-600">Loading vehicles...</p>
      ) : vehiclesQuery.data && vehiclesQuery.data.length > 0 ? (
        <div className="space-y-3">
          {vehiclesQuery.data.map((vehicle) => (
            <Card key={vehicle.id} className="card-elevated p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{vehicle.licensePlate}</p>
                  <p className="text-sm text-slate-600">
                    {vehicle.model} ({vehicle.vehicleType})
                  </p>
                  {vehicle.color && (
                    <p className="text-sm text-slate-600">Color: {vehicle.color}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {vehicle.isDefault && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      Default
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-slate-600 text-center py-4">No vehicles added yet</p>
      )}
    </div>
  );
}
