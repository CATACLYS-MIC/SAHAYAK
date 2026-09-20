import React, { useState } from 'react';
import { Card, CardHeader, Badge, Button } from '@/components/ui';
import { ClipboardCheck, Camera, CheckCircle2 } from 'lucide-react';
import { useAppState } from '@/lib/store';
import { Assessment as AssessmentType } from '@/types';
import { cn } from '@/lib/utils';

export function Assessment() {
  const { assessments, addAssessment, currentLocationId, currentLocation, locations } = useAppState();
   

  const [formData, setFormData] = useState({
    type: 'Building Collapse',
    severity: 'MODERATE' as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL',
    impact: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAssessment: AssessmentType = {
      id: `asm-${Date.now()}`,
      locationId: currentLocationId,
      type: formData.type,
      severity: formData.severity,
      impact: formData.impact,
      status: 'PENDING',
      source: 'Citizen Report',
      timestamp: 'Just now'
    };
    addAssessment(newAssessment);
    setFormData({ type: 'Building Collapse', severity: 'MODERATE', impact: '' });
  };

  const localAssessments = assessments.filter(a => a.locationId === currentLocationId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Damage Assessment</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Submit reports for <strong className="text-slate-900 dark:text-slate-200">{currentLocation?.name}</strong>.</p>
        </div>
        <Badge variant="outline">DEMO DATA</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SUBMISSION FORM */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader 
              title="Submit New Report" 
              subtitle="Citizens and officials can report damage here."
            />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Damage Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-sm font-medium text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow">
                  <option>Building Collapse</option>
                  <option>Road Blockage / Landslide</option>
                  <option>Flooding</option>
                  <option>Power/Comm Outage</option>
                  <option>Other Infrastructure</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Severity</label>
                <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value as any})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-sm font-medium text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow">
                  <option value="LOW">Low</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description & Impact</label>
                <textarea 
                  required
                  value={formData.impact}
                  onChange={e => setFormData({...formData, impact: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm font-medium text-slate-900 dark:text-slate-200 min-h-[100px] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  placeholder="Provide details about the severity..."
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visual Evidence</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                  <Camera className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-2" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tap to upload photos</p>
                </div>
              </div>

              <Button type="submit" className="w-full font-bold shadow-sm">Submit Report</Button>
            </form>
          </Card>
        </div>

        {/* AI ANALYSIS BOARD */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-blue-200 dark:border-blue-500/20 bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-blue-950/10 h-full flex flex-col">
            <CardHeader 
              title={<span className="flex items-center text-blue-700 dark:text-blue-400"><ClipboardCheck className="mr-2 h-5 w-5" /> Analysis Board (Demo Data)</span>}
              subtitle="Incoming reports shown here. Advanced AI validation pending integration."
            />
            
            <div className="flex-1 space-y-4">
              {localAssessments.length === 0 ? (
                <div className="text-center p-8 text-slate-500">No damage reports for this area.</div>
              ) : (
                localAssessments.map(assessment => (
                  <div key={assessment.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={assessment.severity === 'CRITICAL' ? 'critical' : assessment.severity === 'HIGH' ? 'danger' : 'warning'}>
                          {assessment.severity}
                        </Badge>
                        {assessment.status === 'VERIFIED' && (
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600 dark:text-emerald-500" /> Verified
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-slate-500">{assessment.timestamp}</span>
                    </div>
                    
                    <h4 className="font-bold text-lg text-slate-900 dark:text-slate-200 mb-1">{assessment.type}</h4>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {assessment.impact}
                    </p>
                    
                    {assessment.status === 'VERIFIED' && (
                      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3 mb-4 opacity-70">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">AI Rapid Assessment (Pending)</p>
                        <p className="text-xs text-slate-500">Deep imagery analysis will be available with Gemini API.</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {assessment.status === 'PENDING' && <Button size="sm">Acknowledge</Button>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
