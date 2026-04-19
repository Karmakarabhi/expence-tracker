import { usePortfolio } from "../context/PortfolioContext";

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

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={handleExportPDF} className="flex-1 sm:flex-none bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-center">Export PDF</button>
          <button onClick={handleExportExcel} className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-center">Export Excel</button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500 py-10 md:py-20">
        <p className="text-lg">Select a report type to generate statistics and charts.</p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-6 py-3 bg-blue-50 text-blue-600 font-medium rounded-lg">Monthly Expenses</button>
          <button className="px-6 py-3 bg-blue-50 text-blue-600 font-medium rounded-lg">Category Distribution</button>
          <button className="px-6 py-3 bg-blue-50 text-blue-600 font-medium rounded-lg">Supplier Summary</button>
        </div>
      </div>
    </div>
  );
}