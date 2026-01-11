import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { mockSecurityLogs } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Shield, ShieldAlert, ShieldX, Ban, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const SecurityLogs = () => {
  const [logs, setLogs] = useState(mockSecurityLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.ip.includes(searchTerm) || log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleBlockIp = (id: number) => {
    setLogs(logs.map((l) => (l.id === id ? { ...l, blocked: true } : l)));
    toast.success('IP blocked successfully');
  };

  const handleUnblockIp = (id: number) => {
    setLogs(logs.map((l) => (l.id === id ? { ...l, blocked: false } : l)));
    toast.success('IP unblocked');
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="badge-destructive flex items-center gap-1">
            <ShieldX className="w-3 h-3" />
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="badge-status bg-warning/20 text-warning flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            High
          </span>
        );
      case 'medium':
        return (
          <span className="badge-status bg-chart-3/20 text-chart-3 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Medium
          </span>
        );
      default:
        return (
          <span className="badge-status bg-muted text-muted-foreground">
            {severity}
          </span>
        );
    }
  };

  const stats = {
    total: logs.length,
    critical: logs.filter((l) => l.severity === 'critical').length,
    blocked: logs.filter((l) => l.blocked).length,
  };

  return (
    <AdminLayout title="Security Logs" subtitle="Monitor and respond to security threats">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Incidents</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-destructive/10">
            <ShieldX className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.critical}</p>
            <p className="text-sm text-muted-foreground">Critical Threats</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/10">
            <Ban className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.blocked}</p>
            <p className="text-sm text-muted-foreground">IPs Blocked</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by IP or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-dark"
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40 input-dark">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead>IP Address</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="table-row-hover border-border">
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                      {log.ip}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{log.action}</TableCell>
                  <TableCell>
                    <span className="text-warning font-semibold">{log.count}x</span>
                  </TableCell>
                  <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{log.timestamp}</TableCell>
                  <TableCell>
                    {log.blocked ? (
                      <span className="badge-success">Blocked</span>
                    ) : (
                      <span className="badge-warning">Active</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.blocked ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnblockIp(log.id)}
                        className="text-xs"
                      >
                        Unblock
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBlockIp(log.id)}
                        className="text-xs"
                      >
                        Block IP
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SecurityLogs;
