import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { MatchSchedule, CrexService } from "@/services/crexService";

interface ScheduleCardProps {
  match: MatchSchedule;
}

export const ScheduleCard = ({ match }: ScheduleCardProps) => {
  const getTimeUntilMatch = (dateTime: string) => {
    const matchTime = new Date(dateTime);
    const now = new Date();
    const diffMs = matchTime.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Started';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `In ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-fc-red text-white animate-pulse';
      case 'upcoming':
        return 'bg-fc-cyan text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="match-card p-6 space-y-4 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg text-foreground">{match.tournament}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{match.venue || 'Venue TBA'}</span>
          </div>
        </div>
        <Badge className={getStatusColor(match.status)}>
          {getTimeUntilMatch(match.dateTime)}
        </Badge>
      </div>

      {/* Teams */}
      <div className="space-y-4">
        {/* Team 1 */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <span className="text-2xl">{match.team1.flag}</span>
          <div>
            <div className="font-semibold text-foreground">{match.team1.name}</div>
            <div className="text-sm text-muted-foreground">{match.team1.code}</div>
          </div>
        </div>

        {/* VS Divider */}
        <div className="flex justify-center">
          <div className="vs-divider">
            VS
          </div>
        </div>

        {/* Team 2 */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <span className="text-2xl">{match.team2.flag}</span>
          <div>
            <div className="font-semibold text-foreground">{match.team2.name}</div>
            <div className="text-sm text-muted-foreground">{match.team2.code}</div>
          </div>
        </div>
      </div>

      {/* Match Info */}
      <div className="space-y-2 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{CrexService.formatDateTime(match.dateTime)}</span>
        </div>
        
        {match.matchFormat && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Format:</span>
            <Badge variant="secondary">{match.matchFormat}</Badge>
          </div>
        )}
      </div>
    </Card>
  );
};