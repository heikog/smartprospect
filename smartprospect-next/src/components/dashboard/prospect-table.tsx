import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download } from "lucide-react";

const mockProspects = [
  { id: "001", name: "Max Mustermann", company: "Tech Solutions GmbH", email: "max@techsolutions.de", status: "completed" },
  { id: "002", name: "Anna Schmidt", company: "Digital Innovations AG", email: "anna@digital-innovations.de", status: "completed" },
  { id: "003", name: "Thomas Weber", company: "Cloud Systems Ltd", email: "thomas@cloudsystems.com", status: "completed" },
  { id: "004", name: "Sarah Müller", company: "Data Analytics Pro", email: "sarah@analytics-pro.de", status: "completed" },
  { id: "005", name: "Michael Fischer", company: "Automation Works", email: "michael@automation.de", status: "completed" },
];

interface ProspectTableProps {
  campaignId: string;
}

export function ProspectTable({ campaignId }: ProspectTableProps) {
  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Firma</TableHead>
            <TableHead>E-Mail</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Landingpage</TableHead>
            <TableHead>Assets</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockProspects.map((prospect) => (
            <TableRow key={`${campaignId}-${prospect.id}`}>
              <TableCell className="font-mono text-sm">{prospect.id}</TableCell>
              <TableCell>{prospect.name}</TableCell>
              <TableCell>{prospect.company}</TableCell>
              <TableCell className="text-sm text-slate-600">{prospect.email}</TableCell>
              <TableCell>
                <Badge className="bg-green-100 text-green-700">Vollständig</Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
