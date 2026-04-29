import { useState } from "react";
import { toast } from "sonner";

const ReportsPanel = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [exportFormat, setExportFormat] = useState("pdf");

  // Sample data
  const reportData: Record<string, any> = {
    daily: {
      revenue: 12420,
      users: 45,
      sessions: 120,
      growth: "+12%",
      transactions: 89,
      topCategory: "Technology"
    },
    weekly: {
      revenue: 89310,
      users: 312,
      sessions: 850,
      growth: "+18%",
      transactions: 625,
      topCategory: "Finance"
    },
    monthly: {
      revenue: 321900,
      users: 1280,
      sessions: 3450,
      growth: "+24%",
      transactions: 2675,
      topCategory: "Marketing"
    }
  };

  const transactionData = [
    { id: 1, user: "Arun Kumar", amount: 2500, category: "Finance", date: "2024-03-15", status: "Completed" },
    { id: 2, user: "Priya Sharma", amount: 1800, category: "Technology", date: "2024-03-15", status: "Pending" },
    { id: 3, user: "Rahul Mehta", amount: 3200, category: "Marketing", date: "2024-03-14", status: "Completed" },
    { id: 4, user: "Sneha R", amount: 1500, category: "Finance", date: "2024-03-14", status: "Completed" },
    { id: 5, user: "Vikram", amount: 2100, category: "Technology", date: "2024-03-13", status: "Completed" },
  ];

  const categoryData = [
    { name: "Finance", revenue: 125000, percentage: 38, color: "bg-blue-500" },
    { name: "Technology", revenue: 98000, percentage: 30, color: "bg-purple-500" },
    { name: "Marketing", revenue: 75000, percentage: 23, color: "bg-green-500" },
    { name: "Consulting", revenue: 25000, percentage: 8, color: "bg-amber-500" },
  ];

  const handleExport = () => {
    toast.info(`Exporting ${selectedPeriod.toUpperCase()} report as ${exportFormat.toUpperCase()}`);
  };

  const currentReport = reportData[selectedPeriod];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1 text-sm">Comprehensive reports and insights</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="pdf">Export as PDF</option>
                <option value="excel">Export as Excel</option>
                <option value="csv">Export as CSV</option>
              </select>

              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-8">
          <div className="inline-flex bg-gray-100 p-1 rounded-lg">
            {["daily", "weekly", "monthly"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-6 py-2.5 rounded-md font-medium capitalize transition-colors ${selectedPeriod === period
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {formatCurrency(currentReport.revenue)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${currentReport.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {currentReport.growth}
              </span>
              <span className="text-sm text-gray-500 ml-2">from previous period</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{currentReport.users}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <span className="font-medium text-gray-900">{currentReport.sessions}</span> sessions
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Transactions</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{currentReport.transactions}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Avg. ₹{Math.round(currentReport.revenue / currentReport.transactions).toLocaleString()}/transaction
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Top Category</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{currentReport.topCategory}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Leading category by revenue
            </div>
          </div>
        </div>

        {/* Charts and Transactions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue by Category</h3>
              <span className="text-sm text-gray-500">This {selectedPeriod}</span>
            </div>

            <div className="space-y-4">
              {categoryData.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(category.revenue)}</p>
                      <p className="text-xs text-gray-500">{category.percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${category.color}`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {transactionData.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{transaction.user}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{transaction.date}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${transaction.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                          }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Summary</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Performance Highlights</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Revenue increased by {currentReport.growth}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  User acquisition up by 15%
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Conversion rate improved by 8%
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Top Metrics</h4>
              <ul className="space-y-2">
                <li className="flex justify-between text-sm">
                  <span className="text-gray-600">Average Transaction Value</span>
                  <span className="font-medium text-gray-900">{formatCurrency(currentReport.revenue / currentReport.transactions)}</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-gray-600">User Growth Rate</span>
                  <span className="font-medium text-gray-900">+15%</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-gray-600">Session Duration</span>
                  <span className="font-medium text-gray-900">4.2 min</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Recommendations</h4>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600">• Increase marketing budget for {currentReport.topCategory}</li>
                <li className="text-sm text-gray-600">• Optimize user onboarding process</li>
                <li className="text-sm text-gray-600">• Expand {currentReport.topCategory} service offerings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPanel;