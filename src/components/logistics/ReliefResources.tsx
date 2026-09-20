import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { 
  fetchDrrCountryDistributions, 
  fetchDrrVdcDistributions, 
  DistrictResourceData, 
  VdcDistributionRecord, 
  DrrCountrySummary,
  getResourceColor
} from '@/lib/drrPortalService';
import { DrrNepalResourceMap } from './DrrNepalResourceMap';
import { DrrVdcDistributionTable } from './DrrVdcDistributionTable';
import { 
  Package, 
  Map as MapIcon, 
  LayoutGrid, 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  Building, 
  Users, 
  CheckCircle2, 
  AlertOctagon,
  ArrowUpRight,
  Sparkles,
  Tent,
  Utensils,
  Stethoscope,
  Droplet
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ReliefResources() {
  const [viewMode, setViewMode] = useState<'maps' | 'cards' | 'vdc'>('maps');
  const [districts, setDistricts] = useState<DistrictResourceData[]>([]);
  const [vdcRecords, setVdcRecords] = useState<VdcDistributionRecord[]>([]);
  const [summary, setSummary] = useState<DrrCountrySummary | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictResourceData | null>(null);
  const [activeDistrictFilter, setActiveDistrictFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cardSearch, setCardSearch] = useState<string>('');
  const [cardStatusFilter, setCardStatusFilter] = useState<string>('ALL');

  const loadDrrData = async () => {
    setIsLoading(true);
    try {
      const [countryRes, vdcRes] = await Promise.all([
        fetchDrrCountryDistributions(),
        fetchDrrVdcDistributions()
      ]);
      setDistricts(countryRes.data);
      setSummary(countryRes.summary);
      setVdcRecords(vdcRes);
      if (countryRes.data.length > 0 && !selectedDistrict) {
        setSelectedDistrict(countryRes.data[0]);
      }
    } catch (err) {
      console.error('Error loading DRR Portal resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrrData();
  }, []);

  const handleSelectDistrictFromMap = (district: DistrictResourceData) => {
    setSelectedDistrict(district);
  };

  const handleViewVdcForDistrict = (districtName: string) => {
    setActiveDistrictFilter(districtName);
    setViewMode('vdc');
  };

  const filteredCardDistricts = districts.filter(d => {
    if (cardStatusFilter !== 'ALL' && d.status !== cardStatusFilter) {
      return false;
    }
    if (cardSearch.trim()) {
      const q = cardSearch.toLowerCase();
      return (
        d.district.toLowerCase().includes(q) ||
        d.province.toLowerCase().includes(q) ||
        d.keyVdcsServed.some(v => v.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate national commodity totals
  const nationalCommodities = React.useMemo(() => {
    let tents = { avail: 0, dist: 0, req: 0 };
    let food = { avail: 0, dist: 0, req: 0 };
    let medical = { avail: 0, dist: 0, req: 0 };
    let water = { avail: 0, dist: 0, req: 0 };
    let blankets = { avail: 0, dist: 0, req: 0 };

    districts.forEach(d => {
      tents.avail += d.commodities.tentsAndTarps.available;
      tents.dist += d.commodities.tentsAndTarps.distributed;
      tents.req += d.commodities.tentsAndTarps.required;

      food.avail += d.commodities.foodRations.available;
      food.dist += d.commodities.foodRations.distributed;
      food.req += d.commodities.foodRations.required;

      medical.avail += d.commodities.medicalKits.available;
      medical.dist += d.commodities.medicalKits.distributed;
      medical.req += d.commodities.medicalKits.required;

      water.avail += d.commodities.drinkingWater.available;
      water.dist += d.commodities.drinkingWater.distributed;
      water.req += d.commodities.drinkingWater.required;

      blankets.avail += d.commodities.blanketsBedding.available;
      blankets.dist += d.commodities.blanketsBedding.distributed;
      blankets.req += d.commodities.blanketsBedding.required;
    });

    return { tents, food, medical, water, blankets };
  }, [districts]);

  return (
    <section className="space-y-6">
      {/* Section Header with DRR Portal Source Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <Package className="h-5 w-5" />
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Relief Resources Dashboard
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> DRR Portal Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl">
            Integrated resource inventory & relief allocation tracking grounded directly in Nepal Government DRR records. 
            Visualize country-wide district resource surplus and deficits on the map, review category stock levels, or inspect local VDC dispatches.
          </p>
        </div>

        {/* Source Links & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-slate-500">Official Portals:</span>
            <a
              href="http://drrportal.gov.np/distributed_country"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-medium ml-1"
            >
              distributed_country <ArrowUpRight className="w-3 h-3" />
            </a>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <a
              href="http://drrportal.gov.np/vdcdistribution"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-medium"
            >
              vdcdistribution <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadDrrData}
            disabled={isLoading}
            className="h-8 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin text-blue-600")} />
            Sync DRR
          </Button>
        </div>
      </div>

      {/* Top Level Summary Statistics */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Total Relief Distributed</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                {summary.totalReliefUnitsDistributed.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500">units</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Across 77 Districts</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Beneficiary Households</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                {summary.totalBeneficiaryHouseholds.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500">families</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">VDC / Local Units</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Surplus / Staging Hubs</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {summary.districtsWithSurplus}
              </span>
              <span className="text-[11px] text-slate-500">districts</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">Buffer &gt; 70%</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Critical Deficit Zones</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 font-mono">
                {summary.districtsWithDeficit}
              </span>
              <span className="text-[11px] text-slate-500">districts</span>
            </div>
            <span className="text-[10px] text-red-600 dark:text-red-400 font-medium mt-1 block">Severe Stock Deficit</span>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">VDC Logs Recorded</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                {vdcRecords.length}
              </span>
              <span className="text-[11px] text-slate-500">live dispatches</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Sync: {summary.lastSyncTimestamp}</span>
          </div>
        </div>
      )}

      {/* View Switcher Controls (Maps, Cards, VDC Table) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('maps')}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all",
              viewMode === 'maps'
                ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <MapIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Nepal Resource Map (Color-Coded)
          </button>

          <button
            onClick={() => setViewMode('cards')}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all",
              viewMode === 'cards'
                ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Resource Cards View
          </button>

          <button
            onClick={() => setViewMode('vdc')}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all",
              viewMode === 'vdc'
                ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            VDC Distribution Logs ({vdcRecords.length})
          </button>
        </div>

        <div className="text-right px-2 hidden sm:block">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {viewMode === 'maps' && 'Visualizing high (green) vs low (red) resource areas across Nepal'}
            {viewMode === 'cards' && 'Detailed inventory cards by commodity & district'}
            {viewMode === 'vdc' && 'Drill-down to individual VDC dispatches'}
          </span>
        </div>
      </div>

      {/* VIEW MODE 1: NEPAL RESOURCE MAP */}
      {viewMode === 'maps' && (
        <div className="space-y-4">
          <DrrNepalResourceMap
            districts={districts}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={handleSelectDistrictFromMap}
            onViewVdcRecords={handleViewVdcForDistrict}
          />
        </div>
      )}

      {/* VIEW MODE 2: CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="space-y-6">
          {/* Commodity Overview Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" /> Key Relief Commodity Totals
              </h4>
              <span className="text-xs text-slate-500">Across All Nepal Hubs</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Tents */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-sm">
                    <Tent className="w-4 h-4 text-orange-500" /> Tents & Tarps
                  </span>
                  <Badge variant="outline" className="text-[10px]">Shelter</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Available</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">
                      {nationalCommodities.tents.avail.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Distributed</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      {nationalCommodities.tents.dist.toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px]">
                    <span className="text-slate-500">Unmet Demand:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {Math.max(0, nationalCommodities.tents.req - nationalCommodities.tents.avail).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Food */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-sm">
                    <Utensils className="w-4 h-4 text-emerald-500" /> Food Rations
                  </span>
                  <Badge variant="outline" className="text-[10px]">Food</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Available</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">
                      {nationalCommodities.food.avail.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Distributed</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      {nationalCommodities.food.dist.toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px]">
                    <span className="text-slate-500">Unmet Demand:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {Math.max(0, nationalCommodities.food.req - nationalCommodities.food.avail).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medical */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-sm">
                    <Stethoscope className="w-4 h-4 text-blue-500" /> Medical Kits
                  </span>
                  <Badge variant="outline" className="text-[10px]">Health</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Available</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">
                      {nationalCommodities.medical.avail.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Distributed</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      {nationalCommodities.medical.dist.toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px]">
                    <span className="text-slate-500">Unmet Demand:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {Math.max(0, nationalCommodities.medical.req - nationalCommodities.medical.avail).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Water */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-sm">
                    <Droplet className="w-4 h-4 text-cyan-500" /> Clean Water
                  </span>
                  <Badge variant="outline" className="text-[10px]">WASH</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Available</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">
                      {nationalCommodities.water.avail.toLocaleString()} L
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Distributed</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      {nationalCommodities.water.dist.toLocaleString()} L
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px]">
                    <span className="text-slate-500">Unmet Demand:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {Math.max(0, nationalCommodities.water.req - nationalCommodities.water.avail).toLocaleString()} L
                    </span>
                  </div>
                </div>
              </div>

              {/* Blankets */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-sm">
                    <Package className="w-4 h-4 text-purple-500" /> Blankets & Bedding
                  </span>
                  <Badge variant="outline" className="text-[10px]">Winter</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Available</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">
                      {nationalCommodities.blankets.avail.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Distributed</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      {nationalCommodities.blankets.dist.toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px]">
                    <span className="text-slate-500">Unmet Demand:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {Math.max(0, nationalCommodities.blankets.req - nationalCommodities.blankets.avail).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* District Resource Cards Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search district or VDC..."
                value={cardSearch}
                onChange={(e) => setCardSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 mr-1">Status:</span>
              {['ALL', 'HIGH', 'MODERATE', 'LOW', 'CRITICAL'].map(status => (
                <button
                  key={status}
                  onClick={() => setCardStatusFilter(status)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-md font-medium transition-all",
                    cardStatusFilter === status
                      ? "bg-blue-600 text-white font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  )}
                >
                  {status === 'ALL' ? 'All Districts' : status}
                </button>
              ))}
            </div>
          </div>

          {/* District Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredCardDistricts.map(district => {
              const colorInfo = getResourceColor(district.resourceIndex);
              return (
                <Card key={district.id} className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{district.district}</h4>
                        <span className="text-xs text-slate-500">{district.province} Province</span>
                      </div>
                      <span className={cn("px-2 py-0.5 rounded text-[11px] font-bold", colorInfo.badgeBg)}>
                        {colorInfo.label} ({district.resourceIndex})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 italic">
                      {district.statusLabel}
                    </p>

                    {/* Numbers Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                      <div className="bg-slate-50 dark:bg-slate-800/60 rounded p-2 text-center">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Distributed</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-base">
                          {district.totalUnitsDistributed.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 rounded p-2 text-center">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Fulfillment</span>
                        <span className={cn("font-bold text-base", district.fulfillmentRate >= 80 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                          {district.fulfillmentRate}%
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 rounded p-2 text-center">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Beneficiaries</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {district.beneficiaryHouseholds.toLocaleString()} HH
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 rounded p-2 text-center">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Warehouses</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {district.activeWarehouses} Active
                        </span>
                      </div>
                    </div>

                    {/* Key VDCs */}
                    <div className="mb-3">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Key VDCs/Municipalities:</span>
                      <div className="flex flex-wrap gap-1">
                        {district.keyVdcsServed.map(vdc => (
                          <span key={vdc} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium">
                            {vdc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between rounded-b-lg">
                    <span className="text-slate-500">Updated: {district.lastUpdated}</span>
                    <button
                      onClick={() => handleViewVdcForDistrict(district.district)}
                      className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      VDC Logs <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: VDC DISTRIBUTION LOGS TABLE */}
      {viewMode === 'vdc' && (
        <DrrVdcDistributionTable
          records={vdcRecords}
          activeDistrictFilter={activeDistrictFilter}
          onClearDistrictFilter={() => setActiveDistrictFilter('ALL')}
          onRefresh={loadDrrData}
          isLoading={isLoading}
        />
      )}
    </section>
  );
}
