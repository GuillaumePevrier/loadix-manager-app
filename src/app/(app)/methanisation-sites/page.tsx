import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sites de Méthanisation",
};

export default function MethanisationSitesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Sites de Méthanisation</h2>
        {/* Add components for filtering, sorting, etc. here later */}
      </div>
      {/* Placeholder for the table or list of methanisation sites */}
      <div className="h-[500px] rounded-md border border-dashed shadow-sm">
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          {/* Placeholder content */}
          <p>Liste des sites de méthanisation à venir...</p>
        </div>
      </div>
    </div>
  );
}