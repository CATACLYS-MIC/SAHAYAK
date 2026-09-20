import React, { useState, useMemo } from 'react';
import { BaseMap } from '@/components/Map';
import { CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { DistrictResourceData, getResourceColor } from '@/lib/drrPortalService';
import { Badge, Button } from '@/components/ui';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  MapPin, 
  Info, 
  Tent, 
  Utensils, 
  Stethoscope, 
  Droplet, 
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrrNepalResourceMapProps {
  districts: DistrictResourceData[];
  selectedDistrict: DistrictResourceData | null;
  onSelectDistrict: (district: DistrictResourceData) => void;
  onViewVdcRecords?: (districtName: string) => void;
}

export type ResourceCategoryFilter = 'all' | 'tentsAndTarps' | 'foodRations' | 'medicalKits' | 'drinkingWater' | 'blanketsBedding';

export function DrrNepalResourceMap({
  districts,
  selectedDistrict,
  onSelectDistrict,
  onViewVdcRecords
}: DrrNepalResourceMapProps) {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategoryFilter>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');

  // Compute category-specific score for each district
  const evaluatedDistricts = useMemo(() => {
    return districts.map(district => {
      let score = district.resourceIndex;
      let commodityDetail: { available: number; distributed: number; required: number; unit: string } | null = null;

      if (selectedCategory !== 'all') {
        commodityDetail = district.commodities[selectedCategory];
        if (commodityDetail && commodityDetail.required > 0) {
          const ratio = (commodityDetail.available + commodityDetail.distributed * 0.4) / commodityDetail.required;
          score = Math.min(100, Math.round(ratio * 70));
        }
      }

      const colorStyle = getResourceColor(score);
      return {
        ...district,
        computedScore: score,
        colorStyle,
        activeCommodity: commodityDetail
      };
    });
  }, [districts, selectedCategory]);

  const filteredDistricts = useMemo(() => {
    if (selectedProvince === 'ALL') return evaluatedDistricts;
    return evaluatedDistricts.filter(d => d.province.toLowerCase() === selectedProvince.toLowerCase());
  }, [evaluatedDistricts, selectedProvince]);

  const provinces = ['ALL', 'Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];

  const categoryButtons = [
    { id: 'all' as ResourceCategoryFilter, label: 'All Resources', icon: Layers },
    { id: 'tentsAndTarps' as ResourceCategoryFilter, label: 'Tents & Tarps', icon: Tent },
    { id: 'foodRations' as ResourceCategoryFilter, label: 'Food Rations', icon: Utensils },
    { id: 'medicalKits' as ResourceCategoryFilter, label: 'Medical Kits', icon: Stethoscope },
    { id: 'drinkingWater' as ResourceCategoryFilter, label: 'Clean Water', icon: Droplet },
    { id: 'blanketsBedding' as ResourceCategoryFilter, label: 'Blankets', icon: Package },
  ];

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Map Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Commodity Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center shrink-0">
            <Layers className="w-3.5 h-3.5 mr-1 text-blue-500" /> Metric:
          </span>
          {categoryButtons.map(cat => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap",
                  isActive 
                    ? "bg-blue-600 text-white shadow-xs font-semibold" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Province Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Province:</span>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {provinces.map(p => (
              <option key={p} value={p}>{p === 'ALL' ? 'All Nepal (7 Provinces)' : p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Display Frame */}
      <div className="relative w-full h-[580px] lg:h-[640px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900">
        <BaseMap 
          className="w-full h-full"
          center={[28.25, 84.15]} 
          zoom={7}
          showGalliBadge={true}
        >
          {filteredDistricts.map(district => {
            const isSelected = selectedDistrict?.id === district.id;
            const radius = isSelected ? 22 : 16;

            return (
              <CircleMarker
                key={district.id}
                center={[district.lat, district.lng]}
                radius={radius}
                pathOptions={{
                  fillColor: district.colorStyle.fillColor,
                  color: isSelected ? '#ffffff' : district.colorStyle.borderColor,
                  weight: isSelected ? 3.5 : 2,
                  fillOpacity: 0.82,
                  dashArray: isSelected ? '3, 3' : undefined
                }}
                eventHandlers={{
                  click: () => onSelectDistrict(district)
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <div className="text-xs p-1 font-sans">
                    <div className="font-bold text-slate-900">{district.district} ({district.province})</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: district.colorStyle.fillColor }}></span>
                      <span className="font-semibold text-slate-700">{district.colorStyle.label} (Score: {district.computedScore})</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Distributed: {district.totalUnitsDistributed.toLocaleString()} units
                    </div>
                  </div>
                </Tooltip>

                <Popup className="drr-custom-popup">
                  <div className="p-1 min-w-[240px] max-w-[280px] font-sans">
                    <div className="flex items-start justify-between border-b border-slate-200 pb-2 mb-2">
                      <div>
                        <h4 className="font-bold text-base text-slate-900 leading-tight">{district.district}</h4>
                        <span className="text-[11px] text-slate-500">{district.province} Province</span>
                      </div>
                      <span 
                        className="px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: district.colorStyle.fillColor }}
                      >
                        {district.colorStyle.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-3 italic">
                      {district.statusLabel}
                    </p>

                    {/* Metric Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Distributed</span>
                        <span className="font-bold text-slate-900 text-sm">{district.totalUnitsDistributed.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Households</span>
                        <span className="font-bold text-slate-900 text-sm">{district.beneficiaryHouseholds.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Fulfillment</span>
                        <span className={cn("font-bold text-sm", district.fulfillmentRate >= 80 ? "text-emerald-700" : "text-amber-700")}>
                          {district.fulfillmentRate}%
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Warehouses</span>
                        <span className="font-bold text-slate-900 text-sm">{district.activeWarehouses} Active</span>
                      </div>
                    </div>

                    {/* Commodities quick view */}
                    <div className="space-y-1 mb-3 text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                      <div className="font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Resource Breakdown:</span>
                        <span className="text-[10px] text-slate-500">Avail / Req</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>⛺ Tents & Tarps:</span>
                        <span className="font-mono font-medium">{district.commodities.tentsAndTarps.available.toLocaleString()} / {district.commodities.tentsAndTarps.required.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>🌾 Food Rations:</span>
                        <span className="font-mono font-medium">{district.commodities.foodRations.available.toLocaleString()} / {district.commodities.foodRations.required.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>💊 Medical Kits:</span>
                        <span className="font-mono font-medium">{district.commodities.medicalKits.available.toLocaleString()} / {district.commodities.medicalKits.required.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>💧 Clean Water:</span>
                        <span className="font-mono font-medium">{district.commodities.drinkingWater.available.toLocaleString()} L</span>
                      </div>
                    </div>

                    {/* Key VDCs */}
                    <div className="mb-3">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Key VDCs/Municipalities:</span>
                      <div className="flex flex-wrap gap-1">
                        {district.keyVdcsServed.map(vdc => (
                          <span key={vdc} className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-medium">
                            {vdc}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => onViewVdcRecords && onViewVdcRecords(district.district)}
                      className="w-full text-center py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors shadow-xs"
                    >
                      View VDC Distribution Records →
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </BaseMap>

        {/* Floating Interactive Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-3 border border-slate-200/90 dark:border-slate-800/90 shadow-md max-w-xs text-xs">
          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 mb-2">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Resource Color Scale
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">All Nepal</span>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-600 inline-block shrink-0 shadow-xs"></span>
                <span className="font-medium">High / Surplus Stock</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">&gt; 70 Index</span>
            </div>

            <div className="flex items-center justify-between gap-3 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-blue-600 inline-block shrink-0 shadow-xs"></span>
                <span className="font-medium">Moderate / Balanced</span>
              </div>
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">45 - 69</span>
            </div>

            <div className="flex items-center justify-between gap-3 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-amber-600 inline-block shrink-0 shadow-xs"></span>
                <span className="font-medium">Low / Depletion Warning</span>
              </div>
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">25 - 44</span>
            </div>

            <div className="flex items-center justify-between gap-3 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 border border-red-600 inline-block shrink-0 shadow-xs"></span>
                <span className="font-medium">Critical Scarcity / Deficit</span>
              </div>
              <span className="text-[10px] font-mono text-red-600 dark:text-red-400 font-bold">&lt; 25 Index</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Click any node on the map to inspect district breakdown or trigger VDC relief log drill-down.
          </div>
        </div>

        {/* Selected District Floating Quick Inspector Card */}
        {selectedDistrict && (
          <div className="absolute top-4 left-4 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-3.5 border border-blue-200 dark:border-blue-900/50 shadow-lg max-w-sm">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wider">Selected District</span>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{selectedDistrict.district}</h4>
              </div>
              <span 
                className="px-2 py-0.5 rounded text-[11px] font-bold text-white"
                style={{ backgroundColor: getResourceColor(selectedDistrict.resourceIndex).fillColor }}
              >
                {selectedDistrict.status}
              </span>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2.5 line-clamp-2">
              {selectedDistrict.statusLabel}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs mb-2.5">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded">
                <span className="text-[10px] text-slate-500 block">Total Distributed</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDistrict.totalUnitsDistributed.toLocaleString()} units</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded">
                <span className="text-[10px] text-slate-500 block">Fulfillment</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDistrict.fulfillmentRate}%</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewVdcRecords && onViewVdcRecords(selectedDistrict.district)}
                className="text-xs py-1 h-auto flex-1 font-semibold"
              >
                VDC Records ({selectedDistrict.keyVdcsServed.length})
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
