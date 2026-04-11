export default function ReportsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Rental Reports</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Monthly rent collection summary</li>
            <li>• Tenant payment history</li>
            <li>• Property occupancy rates</li>
            <li>• Maintenance expenses</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Inventory Reports</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Stock movement summary</li>
            <li>• Warehouse utilization</li>
            <li>• Product level analysis</li>
            <li>• Inventory valuation</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Spaces Reports</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Booking statistics</li>
            <li>• Revenue analytics</li>
            <li>• Space utilization</li>
            <li>• Guest feedback</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
