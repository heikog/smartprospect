/**
 * Credit Ledger Dialog - Displays credit transaction history
 */
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface CreditLedgerEntry {
  id: number;
  change: number;
  reason: string;
  meta: Record<string, any>;
  created_at: string;
}

const REASON_LABELS: Record<string, string> = {
  signup_bonus: 'Anmelde-Bonus',
  campaign_charge: 'Kampagne-Gebühr',
  campaign_base: 'Kampagne-Basis',
  prospect_fee: 'Prospect-Gebühr',
  manual_adjustment: 'Manuelle Anpassung',
  campaign_refund: 'Kampagne-Rückerstattung'
};

export function CreditLedgerDialog({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { profile } = useAuth();
  const [entries, setEntries] = useState<CreditLedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && profile?.id) {
      loadLedgerEntries();
    }
  }, [open, profile?.id]);

  async function loadLedgerEntries() {
    if (!profile?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('[CreditLedger] Loading ledger entries for profile:', profile.id);
      const { data, error: fetchError } = await supabase
        .from('credit_ledger')
        .select('*')
        .eq('profile_id', profile.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) {
        console.error('[CreditLedger] Error loading entries:', fetchError);
        throw fetchError;
      }

      console.log('[CreditLedger] Loaded', data?.length || 0, 'entries');
      setEntries(data || []);
    } catch (err) {
      console.error('[CreditLedger] Error:', err);
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Historie');
    } finally {
      setIsLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatReason = (reason: string) => {
    return REASON_LABELS[reason] || reason;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Credit-Historie</DialogTitle>
          <DialogDescription>
            Alle Credit-Bewegungen für Ihr Konto
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="text-red-600 py-4">{error}</div>
        ) : entries.length === 0 ? (
          <div className="text-slate-500 py-8 text-center">Noch keine Transaktionen</div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Grund</TableHead>
                  <TableHead className="text-right">Änderung</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-slate-600 text-sm">
                      {formatDate(entry.created_at)}
                    </TableCell>
                    <TableCell>{formatReason(entry.reason)}</TableCell>
                    <TableCell className={`text-right font-semibold ${entry.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.change >= 0 ? '+' : ''}{entry.change}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {entry.meta?.campaign_id ? `Kampagne: ${entry.meta.campaign_id.substring(0, 8)}...` : ''}
                      {entry.meta?.prospects ? ` (${entry.meta.prospects} Prospects)` : ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

