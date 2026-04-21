import { useState, useEffect } from 'react';
import type { Holding, CapitalGains } from './types';
import { fetchHoldings, fetchCapitalGains } from './services/api';
import Header from './components/Header';
import CapitalGainsCard from './components/CapitalGainsCard';
import HoldingsTable from './components/HoldingsTable';
import Loader from './components/Loader';
import ErrorState from './components/ErrorState';
import './styles/App.css';

export default function App() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [capitalGains, setCapitalGains] = useState<CapitalGains | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [h, cg] = await Promise.all([fetchHoldings(), fetchCapitalGains()]);
        setHoldings(h);
        setCapitalGains(cg.capitalGains);
        // Auto-select holdings with short-term losses
        const stLossIndices = h
          .map((holding: Holding, i: number) => holding.stcg.gain < 0 ? i : -1)
          .filter((i: number) => i !== -1);
        setSelectedIndices(stLossIndices);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const toggleHolding = (index: number) => {
    setSelectedIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const selectAll = () => setSelectedIndices(holdings.map((_, i) => i));
  const deselectAll = () => setSelectedIndices([]);

  const getAfterHarvesting = (): CapitalGains | null => {
    if (!capitalGains) return null;
    
    let stcgProfits = capitalGains.stcg.profits;
    let stcgLosses = capitalGains.stcg.losses;
    let ltcgProfits = capitalGains.ltcg.profits;
    let ltcgLosses = capitalGains.ltcg.losses;

    selectedIndices.forEach(idx => {
      const h = holdings[idx];
      if (h.stcg.gain > 0) stcgProfits += h.stcg.gain;
      else stcgLosses += Math.abs(h.stcg.gain);

      if (h.ltcg.gain > 0) ltcgProfits += h.ltcg.gain;
      else ltcgLosses += Math.abs(h.ltcg.gain);
    });

    return {
      stcg: { profits: stcgProfits, losses: stcgLosses },
      ltcg: { profits: ltcgProfits, losses: ltcgLosses }
    };
  };

  const afterHarvesting = getAfterHarvesting();
  
  const calculateSavings = () => {
    if (!capitalGains || !afterHarvesting) return 0;
    const pre = (capitalGains.stcg.profits - capitalGains.stcg.losses) + (capitalGains.ltcg.profits - capitalGains.ltcg.losses);
    const post = (afterHarvesting.stcg.profits - afterHarvesting.stcg.losses) + (afterHarvesting.ltcg.profits - afterHarvesting.ltcg.losses);
    return pre > post ? pre - post : 0;
  };

  const savings = calculateSavings();

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="app">
      <Header />
      
      <main className="main">
        <div className="main__title-row">
          <h1 className="main__title">Tax Harvesting</h1>
          <div className="how-it-works-container">
            <button className="main__how-it-works">How it works?</button>
            <div className="tooltip">
              <div className="tooltip__beak"></div>
              <div className="tooltip__content">
                <ul className="tooltip__list">
                  <li>See your capital gains for FY 2024-25 in the left card</li>
                  <li>Check boxes for assets you plan on selling to reduce your tax liability</li>
                  <li>Instantly see your updated tax liability in the right card</li>
                </ul>
                <p className="tooltip__pro-tip">
                  <strong>Pro tip:</strong> Experiment with different combinations of your holdings to optimize your tax liability
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`disclaimer-bar ${isDisclaimerExpanded ? 'is-expanded' : ''}`}>
          <div className="disclaimer-bar__header" onClick={() => setIsDisclaimerExpanded(!isDisclaimerExpanded)}>
            <svg className="disclaimer-bar__icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <span className="disclaimer-bar__text">Important Notes & Disclaimers</span>
            <svg 
              className={`disclaimer-bar__toggle ${isDisclaimerExpanded ? 'is-rotated' : ''}`} 
              viewBox="0 0 24 24" fill="currentColor"
            >
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
            </svg>
          </div>
          
          {isDisclaimerExpanded && (
            <div className="disclaimer-bar__content">
              <p>• Tax-loss harvesting is currently not allowed under Indian tax regulations. Please consult your tax advisor before making any decisions.</p>
              <p>• Tax harvesting does not apply to derivatives or futures. These are handled separately as business income under tax rules.</p>
              <p>• Price and market value data is fetched from Coingecko, not from individual exchanges. As a result, values may slightly differ from the ones on your exchange.</p>
              <p>• Some countries do not have a short-term / long-term bifurcation. For now, we are calculating everything as long-term.</p>
              <p>• Only realized losses are considered for harvesting. Unrealized losses in held assets are not counted.</p>
            </div>
          )}
        </div>

        <div className="cards-section">
          {capitalGains && (
            <CapitalGainsCard title="Pre Harvesting" variant="pre" data={capitalGains} />
          )}

          {afterHarvesting && (
            <CapitalGainsCard 
              title="After Harvesting" 
              variant="post" 
              data={afterHarvesting}
              savings={savings}
            />
          )}
        </div>

        <HoldingsTable 
          holdings={holdings}
          selectedIndices={selectedIndices}
          setSelectedIndices={setSelectedIndices}
          toggleHolding={toggleHolding}
          selectAll={selectAll}
          deselectAll={deselectAll}
        />

        <footer className="footer">
          © {new Date().getFullYear()} KoinX.
        </footer>
      </main>
    </div>
  );
}
