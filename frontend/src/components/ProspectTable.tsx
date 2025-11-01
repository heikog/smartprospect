import { useEffect, useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ExternalLink, Download, RefreshCcw, AlertTriangle } from 'lucide-react';
import { listProspects, type ProspectRecord } from '../services/campaigns';

type ProspectStatus = 'creating' | 'ready' | 'error';

type ProspectRow = {
  id: string;
  name: string;
  company: string;
  status: ProspectStatus;
  pdfLink: string;
  landingLink: string;
};

const fallbackProspects: ProspectRow[] = [
  { id: '001', name: 'Max Mustermann', company: 'techsolutions.de', status: 'ready', pdfLink: '#', landingLink: '#' },
  { id: '002', name: 'Anna Schmidt', company: 'digital-innovations.de', status: 'creating', pdfLink: '#', landingLink: '#' },
  { id: '003', name: 'Thomas Weber', company: 'cloudsystems.com', status: 'ready', pdfLink: '#', landingLink: '#' },
  { id: '004', name: 'Sarah Müller', company: 'analytics-pro.de', status: 'error', pdfLink: '#', landingLink: '#' },
  { id: '005', name: 'Michael Fischer', company: 'automation.de', status: 'ready', pdfLink: '#', landingLink: '#' }
];

interface ProspectTableProps {
  campaignId: string;
}

export function ProspectTable({ campaignId }: ProspectTableProps) {
  const [prospects, setProspects] = useState<ProspectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const data = await listProspects(campaignId);

        if (!isActive) return;

        if (!data.length) {
          setProspects([]);
          return;
        }

        setProspects(data.map(mapProspectRecord));
      } catch (error) {
        console.error('Fehler beim Laden der Prospects', error);
        if (isActive) {
          setLoadError('Prospects konnten nicht geladen werden. Demo-Daten werden angezeigt.');
          setProspects([]);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, [campaignId]);

  const getStatusBadge = (status: ProspectStatus) => {
    switch (status) {
      case 'creating':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Wird erstellt</Badge>;
      case 'ready':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Vollständig</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Fehler</Badge>;
    }
  };

  const displayedProspects = useMemo(() => {
    if (prospects.length > 0) {
      return prospects;
    }
    return fallbackProspects;
  }, [prospects]);

  return (
    <div className="bg-white rounded-lg border">
      {loadError && (
        <div className="px-4 py-2 text-xs text-amber-600 border-b border-amber-200 bg-amber-50">
          {loadError}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Firma / URL</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Landingpage</TableHead>
            <TableHead>Assets</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                Prospects werden geladen …
              </TableCell>
            </TableRow>
          ) : (
            displayedProspects.map((prospect) => (
              <TableRow key={prospect.id}>
                <TableCell className="font-mono text-sm">{prospect.id}</TableCell>
                <TableCell>{prospect.name}</TableCell>
                <TableCell className="text-sm text-slate-600">{prospect.company}</TableCell>
                <TableCell>{getStatusBadge(prospect.status)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => prospect.landingLink !== '#' && window.open(prospect.landingLink, '_blank')}
                    disabled={prospect.landingLink === '#'}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  {prospect.status === 'error' ? (
                    <Button variant="ghost" size="sm">
                      <RefreshCcw className="w-4 h-4 text-red-500" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => prospect.pdfLink !== '#' && window.open(prospect.pdfLink, '_blank')}
                      disabled={prospect.pdfLink === '#'}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="p-4 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-500" />
        <span>Fehlerhafte Prospects können erneut generiert oder manuell angepasst werden.</span>
      </div>
    </div>
  );
}

function mapProspectRecord(record: ProspectRecord): ProspectRow {
  const hostname = safeHostname(record.url);
  return {
    id: record.id.slice(0, 8),
    name: `${record.vorname} ${record.nachname}`,
    company: hostname,
    status: record.asset_status,
    pdfLink: record.pdf_path ?? '#',
    landingLink: record.landing_page_path ?? '#'
  };
}

function safeHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (_) {
    return url;
  }
}
