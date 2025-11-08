"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, FileText, CheckCircle } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ProspectLandingPage } from "./prospect-landing-page";

interface ProspectData {
  id: string;
  url: string;
  anrede: string;
  vorname: string;
  nachname: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  stadt: string;
  pdfLink: string;
  landingpageLink: string;
}

interface ReviewCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  campaignId: string;
  onApprove: () => void;
}

const generateMockProspects = (count: number): ProspectData[] => {
  const anreden = ["Herr", "Frau", "Dr.", "Prof."];
  const vornamen = ["Max", "Anna", "Thomas", "Sarah", "Michael", "Lisa", "Peter", "Julia", "Markus", "Nina"];
  const nachnamen = ["Müller", "Schmidt", "Weber", "Fischer", "Wagner", "Becker", "Schulz", "Hoffmann", "Koch", "Richter"];
  const strassen = ["Hauptstraße", "Bahnhofstraße", "Kirchstraße", "Gartenweg", "Berliner Allee", "Marktplatz"];
  const staedte = ["Berlin", "München", "Hamburg", "Köln", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig"];

  return Array.from({ length: count }, (_, i) => ({
    id: `prospect-${(i + 1).toString().padStart(3, "0")}`,
    url: `https://example-company-${i + 1}.de`,
    anrede: anreden[i % anreden.length],
    vorname: vornamen[i % vornamen.length],
    nachname: nachnamen[i % nachnamen.length],
    strasse: strassen[i % strassen.length],
    hausnummer: `${Math.floor(Math.random() * 200) + 1}`,
    plz: `${10000 + Math.floor(Math.random() * 89999)}`,
    stadt: staedte[i % staedte.length],
    pdfLink: `/campaigns/camp-001/prospect-${(i + 1).toString().padStart(3, "0")}/flyer.pdf`,
    landingpageLink: `https://sp.link/${(i + 1).toString().padStart(3, "0")}`,
  }));
};

export function ReviewCampaignDialog({
  open,
  onOpenChange,
  campaignName,
  campaignId,
  onApprove,
}: ReviewCampaignDialogProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [landingPageOpen, setLandingPageOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<ProspectData | null>(null);

  const allProspects = generateMockProspects(47);
  const totalPages = Math.ceil(allProspects.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProspects = allProspects.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleApprove = () => {
    onApprove();
    onOpenChange(false);
  };

  const handleOpenLandingPage = (prospect: ProspectData) => {
    setSelectedProspect(prospect);
    setLandingPageOpen(true);
  };

  const handlePdfOpen = (link: string) => {
    if (typeof window !== "undefined") {
      window.open(link, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Kampagne prüfen und freigeben</DialogTitle>
          <DialogDescription>
            {campaignName} ({campaignId}) – {allProspects.length} Prospects
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-lg">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                <TableHead className="w-12">Nr.</TableHead>
                <TableHead>Anrede</TableHead>
                <TableHead>Vorname</TableHead>
                <TableHead>Nachname</TableHead>
                <TableHead>Strasse</TableHead>
                <TableHead>Nr.</TableHead>
                <TableHead>PLZ</TableHead>
                <TableHead>Stadt</TableHead>
                <TableHead>Website</TableHead>
                <TableHead className="text-center">PDF</TableHead>
                <TableHead className="text-center">Landingpage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProspects.map((prospect, index) => (
                <TableRow key={prospect.id}>
                  <TableCell className="text-slate-500">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell>{prospect.anrede}</TableCell>
                  <TableCell>{prospect.vorname}</TableCell>
                  <TableCell>{prospect.nachname}</TableCell>
                  <TableCell>{prospect.strasse}</TableCell>
                  <TableCell>{prospect.hausnummer}</TableCell>
                  <TableCell>{prospect.plz}</TableCell>
                  <TableCell>{prospect.stadt}</TableCell>
                  <TableCell>
                    <a
                      href={prospect.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                      <span className="truncate max-w-[150px]">{prospect.url}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => handlePdfOpen(prospect.pdfLink)}>
                      <FileText className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenLandingPage(prospect)}>
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
          <div className="text-sm text-slate-600">
            Zeige {startIndex + 1} bis {Math.min(endIndex, allProspects.length)} von {allProspects.length} Prospects
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => goToPage(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => goToPage(pageNumber)}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => goToPage(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Kampagne freigeben
          </Button>
        </DialogFooter>
      </DialogContent>

      {selectedProspect && (
        <ProspectLandingPage
          open={landingPageOpen}
          onOpenChange={setLandingPageOpen}
          prospect={{
            id: selectedProspect.id,
            anrede: selectedProspect.anrede,
            vorname: selectedProspect.vorname,
            nachname: selectedProspect.nachname,
            stadt: selectedProspect.stadt,
            url: selectedProspect.url,
          }}
        />
      )}
    </Dialog>
  );
}
