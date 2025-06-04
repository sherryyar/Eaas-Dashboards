import React, { useEffect, useState } from 'react';
import './OpsGenieDashboard.css';

interface OnCallParticipant {
  name: string;
  type: string;
  fullName?: string;
  timeZone?: string;
}

interface Schedule {
  id: string;
  name: string;
  enabled: boolean;
  timezone: string;
  rotations: any[];
}

interface OnCallData {
  data: {
    _parent: Schedule;
    onCallParticipants: OnCallParticipant[];
  };
}

interface TeamSchedule {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

const TEAM_SCHEDULES: TeamSchedule[] = [
  // First Row
  {
    id: '65dded95-3386-4d1b-983c-40683739dc0f',
    name: 'SKY Team',
    emoji: '🌟',
    color: '#FF6B6B'
  },
  {
    id: 'cb0bf42e-23c5-418d-b806-03f29087a85c',
    name: 'Beans Team',
    emoji: '🫘',
    color: '#4ECDC4'
  },
  {
    id: '92e6fb8a-e07e-4cca-9a65-fbffe160f2db',
    name: 'PlatMechs',
    emoji: '⚙️',
    color: '#FFD93D'
  },
  {
    id: 'e78545a2-4114-40e1-be0b-9eee2b0b6786',
    name: 'Meatballs',
    emoji: '🍝',
    color: '#6C5CE7'
  },
  // Second Row
  {
    id: '35b427fb-66a4-4b3b-baab-b80d9bd23e05',
    name: 'Azkaban',
    emoji: '🏰',
    color: '#45B7D1'
  },
  {
    id: '382904d6-73aa-46a5-a450-584895a02790',
    name: 'FireNation',
    emoji: '🔥',
    color: '#FF4757'
  },
  {
    id: 'c48813cd-dffe-4ea2-8529-1bcb382d1cea',
    name: 'EaaS MIM',
    emoji: '🔐',
    color: '#2ED573'
  },
  {
    id: '980a845d-3c2c-47ce-b919-e95a091435da',
    name: 'EaaS Secure MIM',
    emoji: '🛡️',
    color: '#5352ED'
  }
];

const BANNER_TEXT = (
  <>
    <strong>Engineering as a Service, EAID's Managed Service Practice</strong>
    <span className="separator">|</span>
    We are finding out our why/makes us feel #fulfilled at work
    <span className="separator">|</span>
    We're going to automate everything
    <span className="separator">|</span>
    We are proactive
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  </>
);

const OpsGenieDashboard: React.FC = () => {
  const [onCallData, setOnCallData] = useState<Map<string, OnCallData | null>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchOnCallData = async (scheduleId: string): Promise<OnCallData | null> => {
    try {
      const response = await fetch(`http://localhost:3001/api/opsgenie/schedules/${scheduleId}/on-calls`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching schedule ${scheduleId}:`, error);
      return null;
    }
  };

  const fetchAllSchedules = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = new Map<string, OnCallData | null>();
      await Promise.all(
        TEAM_SCHEDULES.map(async (schedule) => {
          const data = await fetchOnCallData(schedule.id);
          results.set(schedule.id, data);
        })
      );
      
      setOnCallData(results);
      setLastUpdated(new Date());
      // Debug log
      console.log('onCallData after fetch:', Array.from(results.entries()));
    } catch (error) {
      setError('Failed to fetch on-call data. Please try again later.');
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSchedules();
    const interval = setInterval(fetchAllSchedules, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchAllSchedules]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderTeamCard = (team: typeof TEAM_SCHEDULES[0]) => {
    const data = onCallData.get(team.id);
    const participants = data?.data?.onCallParticipants || [];
    const isEnabled = data?.data?._parent?.enabled ?? false;
    
    return (
      <div 
        key={team.id} 
        className="team-card"
        style={{
          '--team-color': team.color
        } as React.CSSProperties}
      >
        <div className="team-header">
          <span className="team-emoji">{team.emoji}</span>
          <h2>{team.name}</h2>
          {isEnabled ? (
            <span className="status-badge enabled">Active</span>
          ) : (
            <span className="status-badge disabled">Inactive</span>
          )}
        </div>
        
        <div className="team-content">
          <div className="team-info">
            <h3 className="team-name">{team.name} Team</h3>
            <p className="team-description">On-Call Schedule</p>
          </div>
          <div className="current-oncall">
            <h3>Currently On-Call</h3>
            {participants.length > 0 ? (
              <ul className="oncall-list">
                {participants.map((participant, index) => (
                  <li key={index} className="oncall-member">
                    <div className="member-avatar">
                      {participant.fullName ? participant.fullName.charAt(0) : participant.name.charAt(0)}
                    </div>
                    <span className="member-name">
                      {participant.fullName || participant.name}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-oncall">No one is currently on call</div>
            )}
          </div>
          
          <div className="team-footer">
            <span className="timezone">
              🌍 {data?.data?._parent?.timezone || 'UTC'}
            </span>
            <span className="rotation-count">
              🔄 {data?.data?._parent?.rotations?.length || 0} Rotations
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading on-call schedules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <button onClick={fetchAllSchedules} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  const firstRow = TEAM_SCHEDULES.slice(0, 4);
  const secondRow = TEAM_SCHEDULES.slice(4, 8);

  return (
    <div className="dashboard-container">
      <div className="enterprise-banner">
        <div className="banner-content">
          <div className="banner-text-wrapper">
            <span className="banner-text">{BANNER_TEXT}</span>
            <span className="banner-text">{BANNER_TEXT}</span>
          </div>
        </div>
      </div>
      <div className="dashboard-header">
        <h1>EaaS On-Call Dashboard</h1>
        <div className="last-updated">
          Last updated: {formatTime(lastUpdated)}
          <button onClick={fetchAllSchedules} className="refresh-button" title="Refresh data">
            🔄
          </button>
        </div>
      </div>
      <div className="teams-grid">
        <div className="row">
          {firstRow.map(renderTeamCard)}
        </div>
        <div className="row">
          {secondRow.map(renderTeamCard)}
        </div>
      </div>
    </div>
  );
};

export default OpsGenieDashboard; 