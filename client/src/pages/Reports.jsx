export default function Reports() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
        <div className="space-x-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">Export PDF</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Export Excel</button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500 py-20">
        <p className="text-lg">Select a report type to generate statistics and charts.</p>
        <div className="mt-8 flex justify-center gap-4">
          <button className="px-6 py-3 bg-blue-50 text-blue-600 font-medium rounded-lg">Monthly Expenses</button>
          <button className="px-6 py-3 bg-blue-50 text-blue-600 font-medium rounded-lg">Category Distribution</button>
          <button className="px-6 py-3 bg-blue-50 text-blue-600 font-medium rounded-lg">Supplier Summary</button>
        </div>
      </div>
    </div>
  );
}