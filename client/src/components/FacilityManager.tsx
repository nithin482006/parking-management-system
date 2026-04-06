import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export function FacilityManager() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    zipCode: "",
    totalSlots: 0,
    description: "",
  });

  const facilitiesQuery = trpc.facilities.getAll.useQuery();
  const createFacilityMutation = trpc.facilities.create.useMutation();
  const deleteFacilityMutation = trpc.facilities.delete.useMutation();

  const handleDeleteFacility = async (facilityId: number) => {
    if (!confirm("Are you sure you want to delete this facility? This action cannot be undone.")) return;

    try {
      await deleteFacilityMutation.mutateAsync({ facilityId });
      toast.success("Facility deleted");
      facilitiesQuery.refetch();
    } catch (error) {
      toast.error("Failed to delete facility");
    }
  };

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || formData.totalSlots <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await createFacilityMutation.mutateAsync({
        ...formData,
        totalSlots: parseInt(formData.totalSlots.toString()),
      });
      toast.success("Facility created successfully");
      setFormData({
        name: "",
        address: "",
        city: "",
        zipCode: "",
        totalSlots: 0,
        description: "",
      });
      setShowForm(false);
      facilitiesQuery.refetch();
    } catch (error) {
      toast.error("Failed to create facility");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Parking Facilities</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Facility
        </Button>
      </div>

      {/* Add Facility Form */}
      {showForm && (
        <Card className="card-elevated p-6">
          <form onSubmit={handleAddFacility} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Facility Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-elegant"
                  placeholder="Downtown Parking"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="input-elegant"
                  placeholder="New York"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="input-elegant"
                  placeholder="123 Main Street"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                  className="input-elegant"
                  placeholder="10001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Total Slots *
                </label>
                <input
                  type="number"
                  value={formData.totalSlots}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalSlots: parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-elegant"
                  placeholder="100"
                  min="1"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input-elegant resize-none"
                placeholder="Facility description..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createFacilityMutation.isPending} className="btn-primary">
                {createFacilityMutation.isPending ? "Creating..." : "Create Facility"}
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

      {/* Facilities Grid */}
      {facilitiesQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="card-elevated p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded mb-4"></div>
              <div className="h-4 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facilitiesQuery.data?.map((facility) => (
            <Card key={facility.id} className="card-elevated p-6 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{facility.name}</h3>
                  <p className="text-sm text-slate-600">{facility.city}</p>
                </div>
                <button
                  onClick={() => handleDeleteFacility(facility.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-slate-600">{facility.address}</p>
                <p className="text-sm font-medium text-slate-900">
                  Total Slots: <span className="text-blue-600">{facility.totalSlots}</span>
                </p>
                {facility.description && (
                  <p className="text-sm text-slate-600">{facility.description}</p>
                )}
              </div>
              <Button className="w-full btn-secondary text-sm">Manage Slots</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
