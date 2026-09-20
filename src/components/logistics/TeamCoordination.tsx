import React, { useState } from 'react';
import { Card, CardHeader, Badge, Button } from '@/components/ui';
import { Users } from 'lucide-react';
import { useAppState } from '@/lib/store';
import { cn } from '@/lib/utils';
import { VOLUNTEER_SKILL_CATEGORIES } from '@/data/logisticsData';

export function TeamCoordination() {
  const { teams } = useAppState();
  const [showRegForm, setShowRegForm] = useState(false);
  
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <h3 className="text-xl font-bold flex items-center text-slate-900 dark:text-slate-100">
          <Users className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          Team Coordination
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowRegForm(!showRegForm)}>
          {showRegForm ? 'Cancel Registration' : 'Register Team Leader'}
        </Button>
      </div>

      {showRegForm && (
        <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-900/10">
          <div className="p-4 sm:p-6">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Team Leader Registration</h4>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Team registered! Pending verification."); setShowRegForm(false); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Leader Name</label>
                  <input required className="w-full border border-slate-200 dark:border-slate-700 rounded p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Team Name</label>
                  <input required className="w-full border border-slate-200 dark:border-slate-700 rounded p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Number of Members</label>
                  <input required type="number" min="1" className="w-full border border-slate-200 dark:border-slate-700 rounded p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">General Operating Area</label>
                  <input required className="w-full border border-slate-200 dark:border-slate-700 rounded p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" />
                </div>
              </div>
              
              <div>
                 <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Relevant Skills (Select multiple)</label>
                 <div className="flex flex-wrap gap-2">
                   {VOLUNTEER_SKILL_CATEGORIES.map(skill => (
                     <label key={skill} className="flex items-center gap-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded">
                       <input type="checkbox" /> {skill}
                     </label>
                   ))}
                 </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Submit for Verification</Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {teams.map(team => (
          <Card key={team.id} className="p-4 sm:p-5 flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {team.name}
                  {team.verificationStatus === 'VERIFIED' && <Badge variant="success">VERIFIED</Badge>}
                  {team.verificationStatus === 'PENDING_VERIFICATION' && <Badge variant="warning">PENDING VERIFICATION</Badge>}
                </h4>
                <p className="text-sm font-medium text-slate-500 mt-1">Leader: {team.leaderName} • {team.memberCount} members</p>
              </div>
              <Badge variant={
                team.status === 'AVAILABLE' ? 'info' :
                team.status === 'DEPLOYED' ? 'success' : 'default'
              }>{team.status}</Badge>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {team.skills?.map(skill => (
                <Badge key={skill} variant="outline" className="text-xs font-normal">{skill}</Badge>
              ))}
            </div>

            <div className="mt-auto bg-slate-50 dark:bg-slate-900/50 p-3 rounded text-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Current Assignment</p>
              {team.currentTask ? (
                <p className="text-slate-800 dark:text-slate-200">{team.assignedLocationName}: {team.currentTask}</p>
              ) : (
                <p className="text-slate-500 italic">No active task assignment.</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
