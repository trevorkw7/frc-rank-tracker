  import React, { useState } from 'react';
  import './App.css';

  const App: React.FC = () => {
    const [teamNumber, setTeamNumber] = useState('');
    const [eventCode, setEventCode] = useState('');
    const [comparisonData, setComparisonData] = useState<any[]>();

    const apiKey = import.meta.env.VITE_BLUE_ALLIANCE_API_KEY;

    const fetchEventCode = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setEventCode('');
      setComparisonData([]);

      if (teamNumber) {
        const currentYear = new Date().getFullYear();
        const teamKey = `frc${teamNumber}`;

        const response = await fetch(`https://www.thebluealliance.com/api/v3/team/${teamKey}/events/${currentYear}/statuses`, {
          headers: {
            'X-TBA-Auth-Key': apiKey || '',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setEventCode(Object.keys(data)[0]);
        } else {
          setEventCode('');
        }
      }
    };

    const fetchEventData = async (eventKey: string) => {
      const response = await fetch(`https://www.thebluealliance.com/api/v3/event/${eventKey}/teams/statuses`, {
        headers: {
          'X-TBA-Auth-Key': apiKey || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    };

    const compareRankings = async () => {
      if (eventCode) {
       const eventData = await fetchEventData(eventCode);
       console.log({eventData})

        if (eventData) {
          const teamStatus = eventData[`frc${teamNumber}`];
          const sortOrderInfo = teamStatus.qual.sort_order_info;
          const teamSortOrders = teamStatus.qual.ranking.sort_orders;

          const comparisonResults: any[] = [];

          sortOrderInfo.forEach((criteria: any, index: number) => {
            let rank = 1;
            for (const otherTeamStatus of Object.values(eventData)) {
              if (otherTeamStatus.qual.ranking.sort_orders[index] > teamSortOrders[index]) {
                rank++;
              }
            }
            comparisonResults.push({ name: criteria.name, rank });
          });

          setComparisonData(comparisonResults);
        }
      }
    };

    const renderComparison = () => {
      if (comparisonData) {
        return (
          <ul className='comparison-list'>
            {comparisonData.map((data, index) => (
              <li key={index}>
                {data.name}: Rank {data.rank}
              </li>
            ))}
          </ul>
        );
      }
      return null;
    };

    return (
      <div className="App">
        <header className="App-header">
          <h1>Team Rankings</h1>
          <form onSubmit={fetchEventCode}>
            <label htmlFor="teamNumber">Team Number</label>
            <input
              id="teamNumber"
              type="text"
              value={teamNumber}
              onChange={(e) => setTeamNumber(e.target.value)}
            />
            <button type="submit">Get Event Code</button>
          </form>
          {eventCode && (
            <div>
              <h3>Current Event Code: {eventCode|| 'No current events found'}</h3>
              <br/>
              <button onClick={compareRankings}>Get Rankings</button>
            </div>
          )}
          {renderComparison()}
        </header>
      </div>
    );
  };

  export default App;

