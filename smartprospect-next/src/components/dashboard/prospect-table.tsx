import type { Prospect } from "@/types/database";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download } from "lucide-react";

interface ProspectTableProps {
  prospects: Prospect[];
  loading?: boolean;
}

export function ProspectTable({ prospects, loading }: ProspectTableProps) {
  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Firma</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Landingpage</TableHead>
            <TableHead>Assets</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-slate-500">
                Lädt Prospects...
              </TableCell>
            </TableRow>
          )}
          {!loading && prospects.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-slate-400">
                Noch keine Prospects importiert.
              </TableCell>
            </TableRow>
          )}
          {prospects.map((prospect, index) => (
            <TableRow key={prospect.id}>
              <TableCell className="font-mono text-sm">{index + 1}</TableCell>
              <TableCell>{(prospect.contact as Record<string, string>)?.name ?? "-"}</TableCell>
              <TableCell>{prospect.company_name ?? "-"}</TableCell>
              <TableCell>
                <Badge className="bg-green-100 text-green-700">{prospect.status}</Badge>
              </TableCell>
              <TableCell>
                {prospect.landing_page_url ? (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={prospect.landing_page_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </TableCell>
              <TableCell>
                {prospect.video_url || prospect.flyer_url ? (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={prospect.video_url ?? prospect.flyer_url ?? "#"} target="_blank" rel="noreferrer">
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
