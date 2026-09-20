import React, { useState, useMemo } from 'react';
import { VdcDistributionRecord } from '@/lib/drrPortalService';
import { Badge, Button } from '@/components/ui';
import { Search, Filter, RefreshCw, ExternalLink, Building2, Calendar, Users, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrrVdcDistributionTableProps {
  records: VdcDistributionRecord[];
  activeDistrictFilter?: string;
  onClearDistrictFilter?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function DrrVdcDistributionTable({
  records,
  activeDistrictFilter,
  onClearDistrictFilter,
  onRefresh,
  isLoading
}: DrrVdcDistributionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // District filter
      if (activeDistrictFilter && activeDistrictFilter !== 'ALL') {
        if (record.district.toLowerCase() !== activeDistrictFilter.toLowerCase()) {
          return false;
        }
      }
      // Category filter
      if (selectedCategory !== 'ALL') {
        if (record.reliefCategory.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesVdc = record.vdcMunicipality.toLowerCase().includes(query);
        const matchesDistrict = record.district.toLowerCase().includes(query);
        const matchesItem = record.itemName.toLowerCase().includes(query);
        const matchesAgency = record.distributedBy.toLowerCase().includes(query);
        if (!matchesVdc && !matchesDistrict && !matchesItem && !matchesAgency) {
          return false;
        }
      }
      return true;
    });
  }, [records, activeDistrictFilter, selectedCategory, searchTerm]);

  const categories = ['ALL', 'Shelter', 'Food', 'Medicine', 'Water', 'Clothing'];

  const totalFilteredHouseholds = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.beneficiaryHouseholds, 0);
  }, [filteredRecords]);

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex-1 flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search VDC / Municipality, item, or agency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md font-medium transition-all whitespace-nowrap",
                  selectedCategory === cat
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {activeDistrictFilter && activeDistrictFilter !== 'ALL' && (
            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-md text-xs font-semibold">
              <span>District: {activeDistrictFilter}</span>
              <button
                onClick={onClearDistrictFilter}
                className="ml-1 hover:text-blue-900 dark:hover:text-blue-100 font-bold"
                title="Clear district filter"
              >
                ×
              </button>
            </div>
          )}

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="text-xs h-8 flex items-center gap-1.5"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin text-blue-600")} />
              Sync DRR Portal
            </Button>
          )}

          <a
            href="http://drrportal.gov.np/vdcdistribution"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
          >
            <span>Live drrportal.gov.np/vdcdistribution</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
        <div className="flex items-center gap-4">
          <span>Showing <strong>{filteredRecords.length}</strong> distribution logs</span>
          <span>Beneficiary Households: <strong>{totalFilteredHouseholds.toLocaleString()}</strong></span>
        </div>
        <span className="text-[11px] text-slate-400">Source: Ministry of Home Affairs / NEOC</span>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">VDC / Local Municipality</th>
                <th className="py-3 px-4">Relief Commodity</th>
                <th className="py-3 px-4 text-right">Quantity Distributed</th>
                <th className="py-3 px-4">Distributing Agency</th>
                <th className="py-3 px-4 text-center">Households</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No VDC distribution records found matching the current search or filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {record.date}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {record.district}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{record.vdcMunicipality}</span>
                        {record.wardNo && (
                          <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-normal">
                            Ward {record.wardNo}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{record.itemName}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{record.reliefCategory}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                        {record.quantityDistributed.toLocaleString()}
                      </span>{' '}
                      <span className="text-[11px] text-slate-500 font-normal">{record.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <span className="line-clamp-1">{record.distributedBy}</span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold text-slate-700 dark:text-slate-300">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>{record.beneficiaryHouseholds.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-semibold text-[10px]">
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
