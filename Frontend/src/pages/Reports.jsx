import { usePortfolio } from "../context/PortfolioContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet, BarChart3, PieChart, Users } from "lucide-react";

export default function Reports() {
  const { activePortfolio } = usePortfolio();

  const handleExportPDF = () => {
    if (activePortfolio) {
      window.open(`http://localhost:5000/api/portfolios/${activePortfolio._id}/report/pdf`);
    }
  };

  const handleExportExcel = () => {
    if (activePortfolio) {
      window.open(`http://localhost:5000/api/portfolios/${activePortfolio._id}/report/excel`);
    }
  };

  const reportTypes = [
    { name: "Monthly Expenses", description: "Breakdown of spending by month", icon: BarChart3 },
    { name: "Category Distribution", description: "Where your money goes", icon: PieChart },
    { name: "Supplier Summary", description: "Top vendors and contractors", icon: Users },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Reports"
        description="Generate & export analytical reports."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileDown className="h-4 w-4" /> PDF
            </Button>
            <Button size="sm" onClick={handleExportExcel} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </Button>
          </>
        }
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {reportTypes.map((report) => (
          <Card key={report.name} className="p-6 cursor-pointer hover:shadow-md transition-shadow group">
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <report.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold mb-1">{report.name}</h3>
            <p className="text-sm text-muted-foreground">{report.description}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-10 text-center">
        <p className="text-muted-foreground text-sm">
          Select a report type above to generate charts and statistics.
          <br />
          Export portfolio reports using the PDF / Excel buttons.
        </p>
      </Card>
    </div>
  );
}