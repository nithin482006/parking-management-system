import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { User } from "lucide-react";

interface ProfileEditorProps {
  initialName?: string;
  initialPhone?: string;
}

export function ProfileEditor({ initialName = "", initialPhone = "" }: ProfileEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: initialName,
    phone: initialPhone,
  });

  const updateProfileMutation = trpc.user.updateProfile.useMutation();

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <Card className="card-elevated p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <User className="w-5 h-5" />
        Personal Information
      </h3>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-elegant"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="input-elegant"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              className="btn-primary"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setFormData({ name: initialName, phone: initialPhone });
              }}
              className="btn-secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Full Name</label>
            <p className="text-lg font-medium text-slate-900">
              {formData.name || "Not set"}
            </p>
          </div>
          <div>
            <label className="text-sm text-slate-600">Phone Number</label>
            <p className="text-lg font-medium text-slate-900">
              {formData.phone || "Not set"}
            </p>
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            className="btn-secondary mt-4"
          >
            Edit Profile
          </Button>
        </div>
      )}
    </Card>
  );
}
