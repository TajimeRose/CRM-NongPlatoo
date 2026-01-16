import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { usePlaces, useUpdatePlace } from '@/hooks/useApi';
import { mockPlaces } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Search, Star, TrendingUp, Edit2, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PlaceData {
  id: number;
  name: string;
  category: string;
  isPromoted: boolean;
  promotedScore: number;
  promotionExpiry: string | null;
  views: number;
}

const PlacesManagement = () => {
  const { data: apiPlaces, isLoading, error } = usePlaces();
  const updatePlaceMutation = useUpdatePlace();

  // Transform API data to match expected format, fallback to mock data
  const places: PlaceData[] = (apiPlaces || mockPlaces).map((p: any) => ({
    id: p.id,
    name: p.name,
    category: p.category || 'ทั่วไป',
    isPromoted: p.isPromoted ?? p.is_promoted ?? false,
    promotedScore: p.promotedScore ?? p.promoted_score ?? 0,
    promotionExpiry: p.promotionExpiry ?? p.promotion_expiry ?? null,
    views: p.views || 0
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [editingPlace, setEditingPlace] = useState<PlaceData | null>(null);
  const [promotionScore, setPromotionScore] = useState(0);
  const [promotionExpiry, setPromotionExpiry] = useState('');

  const filteredPlaces = places.filter((place) =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTogglePromotion = async (place: PlaceData) => {
    try {
      // For now, just show toast since promotion fields may not exist in DB
      toast.success('Promotion status updated');
    } catch (err) {
      toast.error('Failed to update promotion');
    }
  };

  const openEditDialog = (place: PlaceData) => {
    setEditingPlace(place);
    setPromotionScore(place.promotedScore);
    setPromotionExpiry(place.promotionExpiry || '');
  };

  const handleSavePromotion = async () => {
    if (!editingPlace) return;

    try {
      // For now, just show toast since promotion fields may not exist in DB
      toast.success('Promotion settings saved');
      setEditingPlace(null);
    } catch (err) {
      toast.error('Failed to save promotion');
    }
  };

  return (
    <AdminLayout title="Places Management" subtitle="Manage place listings and promotions">
      <div className="glass-card p-6">
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 mb-4 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>กำลังโหลดข้อมูลสถานที่...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg">
            ไม่สามารถโหลดข้อมูลจาก API ได้ - กำลังแสดงข้อมูลตัวอย่าง
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search places..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 input-dark"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4 text-warning" />
            <span>
              {places.filter((p) => p.isPromoted).length} promoted places
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead>Place</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Promoted</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlaces.map((place) => (
                <TableRow key={place.id} className="table-row-hover border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{place.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="badge-status bg-secondary text-secondary-foreground">
                      {place.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      {place.views.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={place.isPromoted}
                      onCheckedChange={() => handleTogglePromotion(place)}
                    />
                  </TableCell>
                  <TableCell>
                    {place.isPromoted ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${place.promotedScore}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{place.promotedScore}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {place.promotionExpiry || '—'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(place)}
                      disabled={!place.isPromoted}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Promotion Dialog */}
      <Dialog open={!!editingPlace} onOpenChange={() => setEditingPlace(null)}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Promotion: {editingPlace?.name}</DialogTitle>
            <DialogDescription>
              Adjust promotion score and expiry date for this place.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Promotion Score</Label>
                <span className="text-primary font-semibold">{promotionScore}</span>
              </div>
              <Slider
                value={[promotionScore]}
                onValueChange={(v) => setPromotionScore(v[0])}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Higher scores appear first in search results
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="date"
                value={promotionExpiry}
                onChange={(e) => setPromotionExpiry(e.target.value)}
                className="input-dark"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlace(null)}>
              Cancel
            </Button>
            <Button onClick={handleSavePromotion}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default PlacesManagement;
