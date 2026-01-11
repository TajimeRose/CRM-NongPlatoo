import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { mockSystemConfigs } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, RefreshCw, Plus, Trash2, Settings, Shield, Bot } from 'lucide-react';
import { toast } from 'sonner';

const SystemConfig = () => {
  const [configs, setConfigs] = useState(mockSystemConfigs);
  const [editedConfigs, setEditedConfigs] = useState<Record<number, string>>({});
  const [newConfig, setNewConfig] = useState({ key: '', value: '', description: '', category: 'System' });

  const categories = ['AI', 'System', 'Security'];

  const handleValueChange = (id: number, value: string) => {
    setEditedConfigs({ ...editedConfigs, [id]: value });
  };

  const handleSave = (id: number) => {
    setConfigs(
      configs.map((c) => (c.id === id ? { ...c, value: editedConfigs[id] || c.value } : c))
    );
    const { [id]: _, ...rest } = editedConfigs;
    setEditedConfigs(rest);
    toast.success('Configuration saved');
  };

  const handleAddConfig = () => {
    if (!newConfig.key || !newConfig.value) {
      toast.error('Please fill in key and value');
      return;
    }
    setConfigs([
      ...configs,
      {
        id: configs.length + 1,
        ...newConfig,
      },
    ]);
    setNewConfig({ key: '', value: '', description: '', category: 'System' });
    toast.success('Configuration added');
  };

  const handleDeleteConfig = (id: number) => {
    setConfigs(configs.filter((c) => c.id !== id));
    toast.success('Configuration deleted');
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
                          disabled={editedConfigs[config.id] === undefined}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteConfig(config.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
        <Button onClick={handleAddConfig} className="mt-4 gap-2">
          <Plus className="w-4 h-4" />
          Add Configuration
        </Button>
      </div>
    </AdminLayout>
  );
};

export default SystemConfig;
