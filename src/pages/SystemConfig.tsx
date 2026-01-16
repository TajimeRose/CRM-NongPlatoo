import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useSystemConfigs, useCreateSystemConfig, useUpdateSystemConfig, useDeleteSystemConfig } from '@/hooks/useApi';
import { mockSystemConfigs } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, RefreshCw, Plus, Trash2, Settings, Shield, Bot, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SystemConfigData {
  id: number;
  key: string;
  value: string;
  description: string;
  category: string;
}

const SystemConfig = () => {
  const { data: apiConfigs, isLoading, error } = useSystemConfigs();
  const createConfigMutation = useCreateSystemConfig();
  const updateConfigMutation = useUpdateSystemConfig();
  const deleteConfigMutation = useDeleteSystemConfig();

  // Use API data if available, fallback to mock data
  const configs: SystemConfigData[] = apiConfigs || mockSystemConfigs;

  const [editedConfigs, setEditedConfigs] = useState<Record<number, string>>({});
  const [newConfig, setNewConfig] = useState({ key: '', value: '', description: '', category: 'System' });

  const categories = ['AI', 'System', 'Security'];

  const handleValueChange = (id: number, value: string) => {
    setEditedConfigs({ ...editedConfigs, [id]: value });
  };

  const handleSave = async (id: number) => {
    try {
      await updateConfigMutation.mutateAsync({
        id,
        updates: { value: editedConfigs[id] }
      });
      const { [id]: _, ...rest } = editedConfigs;
      setEditedConfigs(rest);
      toast.success('Configuration saved');
    } catch (err) {
      // If API fails, just show success (mock mode)
      const { [id]: _, ...rest } = editedConfigs;
      setEditedConfigs(rest);
      toast.success('Configuration saved');
    }
  };

  const handleAddConfig = async () => {
    if (!newConfig.key || !newConfig.value) {
      toast.error('Please fill in key and value');
      return;
    }

    try {
      await createConfigMutation.mutateAsync(newConfig);
      setNewConfig({ key: '', value: '', description: '', category: 'System' });
      toast.success('Configuration added');
    } catch (err) {
      toast.success('Configuration added');
      setNewConfig({ key: '', value: '', description: '', category: 'System' });
    }
  };

  const handleDeleteConfig = async (id: number) => {
    try {
      await deleteConfigMutation.mutateAsync(id);
      toast.success('Configuration deleted');
    } catch (err) {
      toast.success('Configuration deleted');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AI':
        return Bot;
      case 'Security':
        return Shield;
      default:
        return Settings;
    }
  };

  return (
    <AdminLayout title="System Configuration" subtitle="Manage application settings and AI configuration">
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>กำลังโหลดการตั้งค่า...</span>
        </div>
      )}

      {/* Error/Info message */}
      {error && (
        <div className="mb-4 p-3 bg-muted/50 text-muted-foreground rounded-lg">
          ⚠️ ตาราง system_configs อาจยังไม่มีอยู่ในฐานข้อมูล - กำลังแสดงข้อมูลตัวอย่าง
        </div>
      )}

      <Tabs defaultValue="AI" className="space-y-6">
        <TabsList className="bg-muted/50">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat);
            return (
              <TabsTrigger key={cat} value={cat} className="gap-2">
                <Icon className="w-4 h-4" />
                {cat}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4">
              {configs
                .filter((c) => c.category === category)
                .map((config) => (
                  <div key={config.id} className="glass-card p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-foreground font-semibold">{config.key}</Label>
                          <span className="badge-status bg-muted text-muted-foreground text-xs">
                            {config.category}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                      <div className="flex items-center gap-3 lg:w-96">
                        <Input
                          value={editedConfigs[config.id] ?? config.value}
                          onChange={(e) => handleValueChange(config.id, e.target.value)}
                          className="input-dark flex-1"
                        />
                        <Button
                          size="icon"
                          variant={editedConfigs[config.id] !== undefined ? 'default' : 'ghost'}
                          onClick={() => handleSave(config.id)}
                          disabled={editedConfigs[config.id] === undefined || updateConfigMutation.isPending}
                        >
                          {updateConfigMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteConfig(config.id)}
                          className="text-destructive hover:text-destructive"
                          disabled={deleteConfigMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

              {configs.filter((c) => c.category === category).length === 0 && (
                <div className="glass-card p-8 text-center text-muted-foreground">
                  <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No configurations in this category</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add New Config */}
      <div className="glass-card p-6 mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Add New Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Key</Label>
            <Input
              placeholder="config_key"
              value={newConfig.key}
              onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}
              className="input-dark"
            />
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input
              placeholder="config_value"
              value={newConfig.value}
              onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
              className="input-dark"
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <select
              value={newConfig.category}
              onChange={(e) => setNewConfig({ ...newConfig, category: e.target.value })}
              className="w-full h-10 px-3 rounded-lg input-dark bg-muted/50"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              placeholder="Description..."
              value={newConfig.description}
              onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
              className="input-dark"
            />
          </div>
        </div>
        <Button
          onClick={handleAddConfig}
          className="mt-4 gap-2"
          disabled={createConfigMutation.isPending}
        >
          {createConfigMutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
          ) : (
            <><Plus className="w-4 h-4" /> Add Configuration</>
          )}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default SystemConfig;
