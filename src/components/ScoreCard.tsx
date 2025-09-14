import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, MapPin, Trophy, User } from "lucide-react";
import { ScoreboardMatch } from "@/services/crexService";

interface ScoreCardProps {
  match: ScoreboardMatch;
}

export const ScoreCard = ({ match }: ScoreCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-fc-red text-white animate-pulse';
      case 'completed':
        return 'bg-fc-green text-white';
      case 'upcoming':
        return 'bg-fc-cyan text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatScore = (team: ScoreboardMatch['team1']) => {
    if (team.score && team.overs) {
      return `${team.score} (${team.overs})`;
    }
    return team.score || 'Yet to bat';
  };

  return (
    <Card className="match-card p-6 space-y-4">
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
          {match.status === 'live' ? '🔴 LIVE' : match.status.toUpperCase()}
        </Badge>
      </div>

      {/* Teams and Scores */}
      <div className="space-y-4">
        {/* Team 1 */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{match.team1.flag}</span>
            <div>
              <div className="font-semibold text-foreground">{match.team1.name}</div>
              <div className="text-sm text-muted-foreground">{match.team1.code}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg text-foreground">{formatScore(match.team1)}</div>
          </div>
        </div>

        {/* VS Divider */}
        <div className="flex justify-center">
          <div className="vs-divider">
            VS
          </div>
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{match.team2.flag}</span>
            <div>
              <div className="font-semibold text-foreground">{match.team2.name}</div>
              <div className="text-sm text-muted-foreground">{match.team2.code}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg text-foreground">{formatScore(match.team2)}</div>
          </div>
        </div>
      </div>

      {/* Match Details */}
      <div className="space-y-2 pt-4 border-t border-border">
        {match.result && (
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-fc-green" />
            <span className="font-medium text-fc-green">{match.result}</span>
          </div>
        )}
        
        {match.tossInfo && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>🪙</span>
            <span>{match.tossInfo}</span>
          </div>
        )}
        
        {match.playerOfMatch && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Player of the Match: <span className="font-medium text-foreground">{match.playerOfMatch}</span></span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Last updated: {new Date(match.lastUpdate || '').toLocaleTimeString()}</span>
        </div>
      </div>
    </Card>
  );
};