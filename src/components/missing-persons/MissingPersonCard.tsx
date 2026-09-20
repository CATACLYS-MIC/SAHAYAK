import React from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { MissingPerson, CandidateMatch } from '@/types';
import { MapPin, Clock, AlertCircle, Eye, Sparkles, ShieldCheck, User } from 'lucide-react';

interface CardProps {
  key?: React.Key;
  person: MissingPerson;
  candidateMatches: CandidateMatch[];
  onSelect: (person: MissingPerson) => void;
  onReviewMatch?: (match: CandidateMatch) => void;
  userRole: 'PUBLIC' | 'RESPONDER';
}

export function MissingPersonCard({
  person,
  candidateMatches,
  onSelect,
  onReviewMatch,
  userRole
}: CardProps) {
  const pendingMatch = candidateMatches.find(
    m => m.missingPersonId === person.id && m.status === 'PENDING_REVIEW'
  );

  const getStatusBadge = () => {
    switch (person.status) {
      case 'FOUND':
      case 'SAFE':
        return <Badge variant="success" className="shadow-sm">VERIFIED {person.status}</Badge>;
      case 'POSSIBLE MATCH':
        return <Badge variant="warning" className="animate-pulse shadow-sm">POTENTIAL MATCH</Badge>;
      case 'HOSPITALIZED':
      case 'IN SHELTER':
        return <Badge variant="info" className="shadow-sm">{person.status}</Badge>;
      default:
        return (
          <Badge variant={person.urgency === 'CRITICAL' ? 'critical' : person.urgency === 'HIGH' ? 'danger' : 'warning'} className="shadow-sm">
            {person.status}
          </Badge>
        );
    }
  };

  const priorityScore = person.baselinePriorityScore ?? (person.urgency === 'CRITICAL' ? 90 : person.urgency === 'HIGH' ? 75 : 50);

  return (
    <Card className="flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 overflow-hidden group">
      {/* PHOTO HEADER */}
      <div className="h-44 bg-slate-100 dark:bg-slate-800 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 mb-3.5 relative overflow-hidden flex items-center justify-center">
        {person.photo ? (
          <img 
            src={person.photo} 
            alt={person.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <User className="h-12 w-12 stroke-[1.5]" />
            <span className="text-[11px] font-medium mt-1 uppercase tracking-wider">No Photo Provided</span>
          </div>
        )}

        {/* TOP STATUS BADGES */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5 z-10">
          {getStatusBadge()}
          {person.isRealSourceData ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-600/95 text-white backdrop-blur-sm border border-red-400/50 shadow-sm">
              <ShieldCheck className="h-3 w-3" />
              {person.ndrrmaId ? `NDRRMA #${person.ndrrmaId}` : 'OPMCM Gov'}
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-sm border border-slate-700/50">
              ID: {person.id}
            </span>
          )}
        </div>

        {/* BASELINE PRIORITY BADGE */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <div className={`px-2 py-1 rounded text-[11px] font-bold tracking-tight shadow-md flex items-center gap-1.5 backdrop-blur-md ${
            priorityScore >= 80 
              ? 'bg-red-600/90 text-white' 
              : priorityScore >= 65 
              ? 'bg-amber-600/90 text-white' 
              : 'bg-slate-800/90 text-slate-100'
          }`}>
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>Priority: {priorityScore}/100</span>
          </div>
        </div>
      </div>

      {/* BODY INFO */}
      <div className="flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              {person.name}
            </h4>
            <span className="text-xs font-semibold text-slate-500">
              Age {person.age} • {person.gender}
            </span>
          </div>

          {person.disasterContext?.hazardType && (
            <div className="inline-flex items-center text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded mb-2 border border-amber-200 dark:border-amber-900/50">
              <span>Disaster: {person.disasterContext.hazardType}</span>
            </div>
          )}

          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <p className="flex items-start gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="line-clamp-1">
                <strong className="text-slate-800 dark:text-slate-200">Last Seen:</strong> {person.lastKnownLocation || person.lastLocation}
              </span>
            </p>

            <p className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>
                <strong className="text-slate-800 dark:text-slate-200">Time:</strong> {person.lastSeen}
              </span>
            </p>

            {person.clothing && (
              <p className="line-clamp-2 text-[11px] bg-slate-50 dark:bg-slate-950/50 p-2 rounded border border-slate-100 dark:border-slate-800/80">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Attire:</span> {person.clothing}
              </p>
            )}
          </div>
        </div>

        {/* POTENTIAL MATCH HIGHLIGHT OR VERIFICATION STATUS */}
        {pendingMatch ? (
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800/50 text-xs">
            <div className="flex items-center justify-between font-bold text-purple-700 dark:text-purple-300 mb-1">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> AI Lead ({pendingMatch.similarityScore}%)
              </span>
              <span className="text-[10px] uppercase font-semibold">Review Required</span>
            </div>
            <p className="text-[11px] text-purple-900 dark:text-purple-200 line-clamp-1">
              {pendingMatch.locationRelationship}
            </p>
            {onReviewMatch && (
              <Button 
                size="sm" 
                variant="primary" 
                className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs py-1 h-7 border-transparent shadow-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onReviewMatch(pendingMatch);
                }}
              >
                Inspect AI Comparison
              </Button>
            )}
          </div>
        ) : person.status === 'FOUND' ? (
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="text-[11px] font-medium">Verified located by authorized officer</span>
          </div>
        ) : null}

        {/* BOTTOM ACTION BUTTON */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs font-medium border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          onClick={() => onSelect(person)}
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" /> View Case & Timeline
        </Button>
      </div>
    </Card>
  );
}
