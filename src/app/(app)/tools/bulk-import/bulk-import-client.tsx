
'use client';

import { useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, UploadCloud, FileText, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import type { EntityType } from '@/types';
import { importEntitiesFromCSV, type ImportResult } from './actions';
import { ScrollArea } from '@/components/ui/scroll-area';

type EntityToImport = 'dealer' | 'loadix-unit' | 'methanisation-site';

const entityTypeOptions: { value: EntityToImport; label: string }[] = [
  { value: 'dealer', label: 'Concessionnaires' },
  { value: 'loadix-unit', label: 'Engins LOADIX' },
  { value: 'methanisation-site', label: 'Sites de Méthanisation' },
];

const csvInstructions: Record<EntityToImport, { title: string; columns: string[], notes?: string[] }> = {
  dealer: {
    title: "Format CSV pour Concessionnaires",
    columns: [
      "name (requis)", "address (requis)", "city (requis)", "postalCode (requis)", "country (requis)",
      "department", "phone", "fax", "email", "website", "contactPerson", "brandSign", "branchName",
      "tractorBrands (séparés par ';')", "machineTypes (séparés par ';')",
      "prospectionStatus ('hot', 'warm', 'cold', 'converted', 'lost', ou 'none')", "initialCommentText"
    ],
    notes: ["La géolocalisation sera ignorée, à ajouter manuellement si besoin via modification.", "Les dates ne sont pas incluses dans cet import de base."]
  },
  'loadix-unit': {
    title: "Format CSV pour Engins LOADIX",
    columns: [
      "name (requis)", "serialNumber (requis)", "model (requis - ex: 'LOADIX Pro v2')",
      "status (requis - 'active', 'maintenance', 'inactive', 'in_stock', 'sold')",
      "address (requis)", "city (requis)", "postalCode (requis)", "country (requis)",
      "purchaseDate (YYYY-MM-DD)", "lastMaintenanceDate (YYYY-MM-DD)", "dealerId", "methanisationSiteId"
    ],
    notes: ["La géolocalisation sera ignorée.", "dealerId et methanisationSiteId doivent correspondre à des IDs existants si fournis."]
  },
  'methanisation-site': {
    title: "Format CSV pour Sites de Méthanisation",
    title: "Format CSV pour Sites de Méthanisation (Simplifié)",
    columns: [
      "name (requis)",
 "address (requis)",
 "city (requis)",
 "postalCode (requis)",
 "country (requis)"
    ],
    notes: ["Ce format inclut les champs essentiels pour l'identification et la géolocalisation.", "La géolocalisation sera effectuée automatiquement si les champs d'adresse sont valides.", "D'autres champs (capacité, opérateur, date de début, clients, technologies, concessionnaires liés) pourront être ajoutés ultérieurement via l'édition individuelle des fiches."]
  }
};

export default function BulkImportClient() {
  const [selectedEntityType, setSelectedEntityType] = useState<EntityToImport | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCsvFile(null);
    setCsvData(null);
    setCsvHeaders([]);
    setImportResult(null);
    setFileError(null);

    if (file) {
      if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
        setFileError('Format de fichier invalide. Veuillez sélectionner un fichier .csv.');
        return;
      }
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
          const headers = lines[0]?.split(',').map(h => h.trim()) || [];
          setCsvHeaders(headers);
          const dataRows = lines.slice(1, 6).map(line => line.split(',').map(cell => cell.trim())); // Preview first 5 data rows
          setCsvData(dataRows);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!csvFile || !selectedEntityType) return;
    setIsLoading(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvString = event.target?.result as string;
      if (csvString) {
        try {
          const result = await importEntitiesFromCSV(csvString, selectedEntityType as EntityType);
          setImportResult(result);
        } catch (error) {
          console.error("Erreur lors de l'importation CSV:", error);
          setImportResult({
            success: false,
            message: error instanceof Error ? error.message : "Une erreur inconnue est survenue.",
            totalRows: 0,
            importedCount: 0,
            errorCount: 0,
            errorsDetail: []
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    reader.readAsText(csvFile);
  };

  const currentInstructions = selectedEntityType ? csvInstructions[selectedEntityType] : null;

  return (
    <div className="space-y-6 md:space-y-8 h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-end">
        <div>
          <Label htmlFor="entityType" className="text-sm font-medium text-foreground/80">
            Type d'entité à importer
          </Label>
          <Select
            value={selectedEntityType || ''}
            onValueChange={(value) => setSelectedEntityType(value as EntityToImport)}
          >
            <SelectTrigger id="entityType" className="mt-1 bg-input/50 border-border/70 focus:bg-input">
              <SelectValue placeholder="Sélectionner un type d'entité..." />
            </SelectTrigger>
            <SelectContent>
              {entityTypeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="csvFile" className="text-sm font-medium text-foreground/80">
            Fichier CSV
          </Label>
          <Input
            id="csvFile"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mt-1 bg-input/50 border-border/70 focus:bg-input file:text-primary file:font-medium"
            disabled={!selectedEntityType}
          />
          {fileError && <p className="mt-1 text-sm text-destructive">{fileError}</p>}
        </div>
      </div>

      {currentInstructions && (
        <Alert variant="default" className="bg-accent/10 border-accent/50 text-accent-foreground/90">
          <Info className="h-5 w-5 text-accent" />
          <AlertTitle className="font-bebas-neue text-lg text-accent">{currentInstructions.title}</AlertTitle>
          <AlertDescription className="text-xs space-y-1">
            <p className="font-semibold">Colonnes attendues (dans cet ordre, la première ligne doit contenir les en-têtes) :</p>
            <ul className="list-disc list-inside pl-2">
              {currentInstructions.columns.map(col => <li key={col}>{col}</li>)}
            </ul>
            {currentInstructions.notes && currentInstructions.notes.length > 0 && (
              <>
                <p className="font-semibold mt-1.5">Notes importantes :</p>
                <ul className="list-disc list-inside pl-2">
                  {currentInstructions.notes.map(note => <li key={note}>{note}</li>)}
                </ul>
              </>
            )}
             <p className="mt-1.5">Assurez-vous que votre fichier CSV utilise la virgule (,) comme délimiteur et est encodé en UTF-8.</p>
          </AlertDescription>
        </Alert>
      )}

      {csvData && csvData.length > 0 && selectedEntityType && (
        <div className="space-y-3 flex-grow flex flex-col min-h-0">
          <h3 className="text-lg font-bebas-neue text-primary flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Aperçu du fichier CSV (5 premières lignes de données)
          </h3>
          <ScrollArea className="border rounded-md flex-grow">
            <Table className="bg-background/30">
              <TableHeader>
                <TableRow>
                  {csvHeaders.map((header, index) => (
                    <TableHead key={index} className="whitespace-nowrap px-2 py-1.5 text-xs">{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} className="whitespace-nowrap px-2 py-1 text-xs">{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <Button
            onClick={handleImport}
            disabled={isLoading || !csvFile || !selectedEntityType}
            className="w-full md:w-auto md:self-end py-3 text-base mt-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Importation en cours...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-5 w-5" />
                Importer vers Firestore
              </>
            )}
          </Button>
        </div>
      )}

      {importResult && (
        <Alert variant={importResult.success && importResult.errorCount === 0 ? "default" : "destructive"} className={`mt-6 ${importResult.success && importResult.errorCount === 0 ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400' : 'bg-destructive/10 border-destructive/50 text-destructive-foreground'}`}>
          {importResult.success && importResult.errorCount === 0 ? <CheckCircle className={`h-5 w-5 ${importResult.success && importResult.errorCount === 0 ? 'text-green-600 dark:text-green-500' : 'text-destructive'}`} /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
          <AlertTitle className="font-bebas-neue text-lg">{importResult.message}</AlertTitle>
          <AlertDescription className="text-xs space-y-1">
            <p>Lignes totales traitées : {importResult.totalRows}</p>
            <p>Lignes importées avec succès : {importResult.importedCount}</p>
            <p>Lignes avec erreurs : {importResult.errorCount}</p>
            {importResult.errorsDetail && importResult.errorsDetail.length > 0 && (
              <div className="mt-2">
                <h4 className="font-semibold">Détail des erreurs :</h4>
                <ScrollArea className="max-h-40 mt-1 border rounded-md p-2 bg-background/50">
                  <ul className="space-y-1.5">
                    {importResult.errorsDetail.map((err, index) => (
                      <li key={index} className="p-1.5 rounded-sm border border-destructive/30 bg-destructive/5">
                        Ligne {err.rowIndex + 1}: {err.message} <br />
                        <code className="text-xs text-destructive/80 block truncate">Données: {
 Array.isArray(err.rowData)
 ? err.rowData.join(', ')
 : typeof err.rowData === 'object'
 ? Object.values(err.rowData).join(', ')
 : String(err.rowData)
 }</code>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
       {!csvFile && !importResult && selectedEntityType && (
        <div className="text-center text-muted-foreground py-10 border-2 border-dashed border-border/50 rounded-lg">
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground/70 mb-2" />
          <p className="font-medium">Veuillez sélectionner un fichier CSV à importer.</p>
          <p className="text-xs mt-1">Assurez-vous qu'il respecte le format décrit ci-dessus.</p>
        </div>
      )}
    </div>
  );
}
