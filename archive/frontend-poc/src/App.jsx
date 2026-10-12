import React, { useState } from 'react';
import { 
  CheckCircle2, RefreshCw, ChevronRight, ChevronLeft, Download, 
  Send, Sparkles, Sliders, ShieldCheck, HelpCircle, Share2, 
  FileText, ArrowRight, Save, MessageSquare, BarChart2, Plus, ArrowUpRight
} from 'lucide-react';

export default function App() {
  // Navigation & Flow state
  const [currentStep, setCurrentStep] = useState(1); // 1 = Config, 2 = Deck Review, 3 = Distribution
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  // Configuration State (Step 1)
  const [selectedRegion, setSelectedRegion] = useState('Europe');
  const [selectedMarket, setSelectedMarket] = useState('UK');
  const [selectedTemplate, setSelectedTemplate] = useState('FNOS Executive Deck');
  const [selectedWindows, setSelectedWindows] = useState(['MAT', 'YTD']);
  const [kbiTab, setKbiTab] = useState('consumer');

  // Deck Workspace State (Step 2)
  const [activeSlide, setActiveSlide] = useState(0);
  const [rightPanelTab, setRightPanelTab] = useState('commentary'); // 'commentary' | 'insights'
  const [isAiGeneratingCommentary, setIsAiGeneratingCommentary] = useState(false);
  const [savedSlideAlert, setSavedSlideAlert] = useState(false);

  // Commentary Content (Editable by user)
  const [commentary, setCommentary] = useState({
    headline: "Total Italian cooking-sauce market grew +3.9% in the latest 12 wks (£106.7m) but is flat MAT (+0.7%), with growth entirely price-led as penetration fell -1.4pp.",
    soWhat: "The category is carried by inflation, not demand; falling penetration across nearly every player signals shrinking household reach and fragile underlying health.",
    nowWhat: "1. Protect core share via targeted trade promotions in tier-1 supermarkets.\n2. Rebalance media spend towards digital retail media to counter private label trade down.\n3. Accelerate Seed cell innovation (Dolmio high-protein & plant-based variants) to capture margin."
  });

  // Gen AI Insights Chat (Step 2 Right Tab)
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'ai',
      text: "I have analyzed the UK market data from Databricks Gold Layer. You can ask for ad-hoc scenario modeling or click a suggested prompt below."
    }
  ]);

  // Slides metadata for Sorter
  const slides = [
    { id: 0, title: "F&N EU Strategic Cells Overview", category: "FINANCE", badgeColor: "#2563EB" },
    { id: 1, title: "F&N EU Brand Overview", category: "FINANCE", badgeColor: "#2563EB" },
    { id: 2, title: "Brand Equity & Share Performance", category: "CONSUMER & MARKET INSIGHTS", badgeColor: "#0D9488" },
    { id: 3, title: "Marketing Spend & ROI Calibration", category: "MARKETING", badgeColor: "#D96B27" },
    { id: 4, title: "Strategic Growth Outlook", category: "STRATEGY", badgeColor: "#7C3AED" },
  ];

  // Handler: Step 1 -> Step 2 with simulated multi-agent execution
  const handleGenerateNarratives = () => {
    setIsGenerating(true);
    setGenerationStep('Router Agent initializing workflow...');
    setTimeout(() => {
      setGenerationStep('SQL Agent querying Databricks Gold Layer for UK & Europe metrics...');
    }, 400);
    setTimeout(() => {
      setGenerationStep('Insights & Summarizer Agents generating executive narrative blocks...');
    }, 800);
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStep(2);
    }, 1300);
  };

  // Handler: Trigger AI regeneration for commentary
  const handleRegenerateCommentaryWithAi = () => {
    setIsAiGeneratingCommentary(true);
    setTimeout(() => {
      setCommentary({
        headline: "Italian cooking sauces accelerated +4.2% in L12W driven by Dolmio premium launches; MAT volume stabilized at +1.1% with resilient brand equity.",
        soWhat: "Consumer trade-down to private label halted following the Q1 promotional reset. Seed cell products contributed +38% of total incremental value growth.",
        nowWhat: "1. Lock in secondary display commitments with Tesco and Sainsbury's for Q3.\n2. Allocate an additional £400k into TikTok creator campaigns targeting quick-cook meals.\n3. Maintain Harvest line gross margins above 48%."
      });
      setIsAiGeneratingCommentary(false);
    }, 900);
  };

  // Handler: Save to slide
  const handleSaveToSlide = () => {
    setSavedSlideAlert(true);
    setTimeout(() => setSavedSlideAlert(false), 2500);
  };

  // Handler: Send Gen AI Prompt
  const handleSendPrompt = (promptText = chatPrompt) => {
    if (!promptText.trim()) return;
    const userMsg = { sender: 'user', text: promptText };
    setChatHistory(prev => [...prev, userMsg]);
    setChatPrompt('');

    setTimeout(() => {
      let reply = "Based on our econometric models, promotional sensitivity in Seed is 0.82 (low elasticity), meaning consumers are willing to buy even with minimal discounts. Conversely, Harvest lines exhibit 1.64 elasticity, requiring strict discount ceilings to avoid margin erosion.";
      if (promptText.toLowerCase().includes('momentum') || promptText.toLowerCase().includes('rig')) {
        reply = "Estimated RIG (Real Internal Growth) momentum for UK in Q3 is projected at +2.1%, provided out-of-stock rates remain under 1.5% at central retailer depots.";
      } else if (promptText.toLowerCase().includes('harvest')) {
        reply = "Harvest cell drag currently reduces total European portfolio CAGR by -0.4 pp. Rationalizing 6 low-performing SKUs will immediately reclaim 85 bps of gross margin.";
      }
      setChatHistory(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 700);
  };

  const toggleWindow = (win) => {
    setSelectedWindows(prev => 
      prev.includes(win) ? prev.filter(w => w !== win) : [...prev, win]
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAF9' }}>
      
      {/* ============================================================== */}
      {/* GLOBAL HEADER                                                  */}
      {/* ============================================================== */}
      <header style={{
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setCurrentStep(1)}>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#008542', letterSpacing: '-0.5px' }}>FNOS</span>
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>Automation Engine</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>Corporate reporting feeds active</span>
          </div>
          <span style={{ fontSize: '13px', color: '#64748B' }}>akhil.kumar@tigeranalytics.com</span>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#008542',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: '700'
          }}>
            AK
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* AI GENERATION MODAL OVERLAY                                    */}
      {/* ============================================================== */}
      {isGenerating && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '520px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <Sparkles size={28} className="animate-spin" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
              Synthesizing Executive Deck Narratives
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>
              Multi-Agent Presentation Orchestrator active
            </p>
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '13px',
              color: '#2563EB',
              fontWeight: '600'
            }}>
              {generationStep}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 1: CONFIGURATION & LOGIC MAPPING                           */}
      {/* ============================================================== */}
      {currentStep === 1 && (
        <main style={{ maxWidth: '1320px', margin: '0 auto', width: '100%', padding: '24px 32px 80px 32px' }} className="animate-fade-in">
          
          {/* Status Bar */}
          <div style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #DCFCE7',
            borderRadius: '12px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#166534' }}>Corporate Database Connection Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#15803D' }}>
              <RefreshCw size={14} />
              <span>Status: P01 2026 data active (Last updated: Feb 26, 2026, 08:54)</span>
            </div>
          </div>

          {/* Key Business Indicators (KBIs) */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1E293B' }}>Key Business Indicators</h2>
              <div style={{
                backgroundColor: '#F1F5F9',
                padding: '4px',
                borderRadius: '24px',
                display: 'flex',
                gap: '4px'
              }}>
                {['consumer', 'finance', 'marketing'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setKbiTab(tab)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: kbiTab === tab ? '#FFFFFF' : 'transparent',
                      color: kbiTab === tab ? '#0F172A' : '#64748B',
                      boxShadow: kbiTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    {tab === 'consumer' ? 'Consumer & Market Insights' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              {[
                { title: 'RSV', val: '$6.7 B', delta: '+4.5%', sub: 'Retail Sales Value', icon: '$' },
                { title: 'Market Share', val: '23.4%', delta: '+0.5 pts', sub: 'Nielsen/Sprint', icon: '%' },
                { title: 'Volume', val: '477.2 kt', delta: '+2.6%', sub: 'Kilotons Ingested', icon: '📦' },
                { title: 'Weighted Distribution', val: '88.3%', delta: '+2.2 pts', sub: 'Weighted Physical Avail', icon: '🗺' },
                { title: 'HH Penetration', val: '41.2%', delta: '+0.7 pts', sub: 'Household Penetration', icon: '👥' },
              ].map((card, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      {card.icon}
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#059669',
                      backgroundColor: '#ECFDF5',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {card.delta}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', marginBottom: '4px' }}>{card.title}</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>{card.val}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>{card.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Confirmation and Logic Mapping */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '32px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Confirmation and Logic Mapping
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>
              Select your parameters below to generate performance narratives mapped directly to your slide templates.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                  Region
                </label>
                <select 
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="Europe">Europe</option>
                  <option value="North America">North America</option>
                  <option value="APAC">APAC</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                  Market
                </label>
                <select 
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="UK">UK</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Italy">Italy</option>
                  <option value="Spain">Spain</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                  Template
                </label>
                <select 
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="FNOS Executive Deck">FNOS Executive Deck</option>
                  <option value="Brand Review Pack">Brand Review Pack</option>
                  <option value="Quarterly Financials">Quarterly Financials</option>
                </select>
              </div>
            </div>

            {/* Reporting Windows */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '10px' }}>Reporting windows</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['MAT', 'YTD', 'L12W', 'L4W'].map(w => {
                  const active = selectedWindows.includes(w);
                  return (
                    <button
                      key={w}
                      onClick={() => toggleWindow(w)}
                      style={{
                        padding: '6px 20px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '700',
                        backgroundColor: active ? '#008542' : '#FFFFFF',
                        color: active ? '#FFFFFF' : '#475569',
                        border: active ? '1px solid #008542' : '1px solid #CBD5E1',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info callout */}
            <div style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <HelpCircle size={16} color="#059669" />
              <span style={{ fontSize: '12px', color: '#166534', fontWeight: '500' }}>
                Certified by corporate FP&A and Insights boards. Contains 5 active segments with synced narrative loops.
              </span>
            </div>
          </div>

          {/* Recent Reports */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Recent reports</h3>
              <a href="#" style={{ fontSize: '13px', fontWeight: '600', color: '#2563EB', textDecoration: 'none' }}>View all</a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { title: 'FNOS_2026_Q1_Review', status: 'Published', date: '04 Apr 2026', brand: 'Dolmio' },
                { title: 'FNOS_2026_Q2_Review', status: 'Published', date: '28 Jun 2026', brand: 'Dolmio' },
                { title: 'FNOS_2026_Draft_v3', status: 'Draft', date: '01 Jul 2026', brand: 'Dolmio' },
              ].map((rep, i) => (
                <div key={i} style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{rep.title}</span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: rep.status === 'Published' ? '#15803D' : '#475569',
                        backgroundColor: rep.status === 'Published' ? '#DCFCE7' : '#F1F5F9',
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {rep.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Brand: {rep.brand}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Template: Executive Deck</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>Updated: {rep.date}</div>
                  </div>
                  <Share2 size={16} color="#94A3B8" style={{ cursor: 'pointer' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Big Trigger Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleGenerateNarratives}
              style={{
                backgroundColor: '#1E3A8A',
                color: '#FFFFFF',
                padding: '14px 32px',
                borderRadius: '28px',
                fontSize: '15px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.4)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#172554'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E3A8A'}
            >
              <span>Generate Narratives</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* STEP 2: POWERPOINT DECK REVIEW WORKSPACE                       */}
      {/* ============================================================== */}
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }} className="animate-fade-in">
          
          {/* Sub Header */}
          <div style={{
            height: '48px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => setCurrentStep(1)} 
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}
              >
                <ChevronLeft size={16} />
                <span>STEP 2 OF 3</span>
              </button>
              <span style={{ color: '#CBD5E1' }}>|</span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>PowerPoint Deck Review Workspace</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: '700',
              color: '#15803D'
            }}>
              <ShieldCheck size={14} />
              <span>EXECUTIVE READY MODE</span>
            </div>
          </div>

          {/* 3-Column Workspace */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr 380px',
            flex: 1,
            height: 'calc(100vh - 176px)',
            overflow: 'hidden'
          }}>
            
            {/* COLUMN 1: SLIDE SORTER */}
            <div style={{
              borderRight: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              overflowY: 'auto',
              padding: '20px 16px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#059669', letterSpacing: '0.5px', marginBottom: '14px' }}>
                SLIDE SORTER
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {slides.map((s, idx) => {
                  const isActive = activeSlide === idx;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setActiveSlide(idx)}
                      style={{
                        borderRadius: '10px',
                        border: isActive ? '2px solid #10B981' : '1px solid #E2E8F0',
                        backgroundColor: isActive ? '#F0FDF4' : '#FFFFFF',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          backgroundColor: isActive ? '#10B981' : '#F1F5F9',
                          color: isActive ? '#FFFFFF' : '#64748B',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: '700',
                          color: s.badgeColor,
                          backgroundColor: '#F8FAFC',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {s.category}
                        </span>
                      </div>

                      {/* Mini Thumbnail Mockup */}
                      <div style={{
                        height: '46px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        marginBottom: '8px',
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <div style={{ width: '40%', height: '5px', backgroundColor: '#CBD5E1', borderRadius: '2px' }}></div>
                        <div style={{ width: '80%', height: '8px', backgroundColor: isActive ? '#BBF7D0' : '#E2E8F0', borderRadius: '2px' }}></div>
                        <div style={{ width: '60%', height: '5px', backgroundColor: '#CBD5E1', borderRadius: '2px' }}></div>
                      </div>

                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', lineHeight: '1.3' }}>
                        {s.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 2: ACTIVE PRESENTATION SLIDE CANVAS */}
            <div style={{
              backgroundColor: '#F1F5F9',
              padding: '24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                width: '100%',
                maxWidth: '960px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                fontSize: '12px',
                color: '#64748B',
                fontWeight: '600'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669' }}>
                  <FileText size={15} />
                  <span style={{ fontWeight: '700' }}>Active Presentation Slide</span>
                </div>
                <span>Slide {activeSlide + 1} of 5 — 16:9 HD Format</span>
              </div>

              {/* 16:9 Slide Canvas Card */}
              <div style={{
                width: '100%',
                maxWidth: '960px',
                aspectRatio: '16 / 9',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                border: '1px solid #E2E8F0',
                padding: '28px 36px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                
                {/* Slide Top Banner */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#1E3A8A', fontSize: '18px', fontWeight: '800' }}>■</span>
                      <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A' }}>
                        {slides[activeSlide].title}
                      </h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        backgroundColor: '#1E3A8A',
                        color: '#FFFFFF',
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}>
                        {slides[activeSlide].category}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        backgroundColor: '#F1F5F9',
                        color: '#475569',
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}>
                        QUARTERLY UPDATE
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        color: '#D97706',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        • Data Updated
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.4px', marginBottom: '16px' }}>
                    DETAILED SEGMENT PERFORMANCE MATRIX FOR UK
                  </div>
                </div>

                {/* Slide Content: Matrix + AI Callout (Matches Screenshot 095559.png) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.1fr', gap: '20px', flex: 1, minHeight: 0 }}>
                  
                  {/* Left 4-Column Strategic Matrix */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '6px 4px', textAlign: 'left', width: '34%' }}></th>
                          <th style={{ padding: '6px 4px', backgroundColor: '#EA580C', color: '#FFFFFF', fontWeight: '700', textAlign: 'center', borderRadius: '4px 0 0 0' }}>SEED</th>
                          <th style={{ padding: '6px 4px', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: '700', textAlign: 'center' }}>GROWTH<br/>ENGINE</th>
                          <th style={{ padding: '6px 4px', backgroundColor: '#0D9488', color: '#FFFFFF', fontWeight: '700', textAlign: 'center' }}>FUEL FOR<br/>GROWTH</th>
                          <th style={{ padding: '6px 4px', backgroundColor: '#DC2626', color: '#FFFFFF', fontWeight: '700', textAlign: 'center', borderRadius: '0 4px 0 0' }}>HARVEST</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { metric: '% NSV Growth YOY (vs. Archetype)', c1: '>10%', c2: '4-10%', c3: '2-4%', c4: 'None' },
                          { metric: '2 Year CAGR % NSV Growth', c1: '+15.8%', c2: '+8.4%', c3: '+3.2%', c4: '-0.9%', highlight: true },
                          { metric: 'Promo investment TLI / QGI %', c1: '105 / 109', c2: '99 / 103', c3: '97 / 100', c4: '93 / 96' },
                          { metric: 'A&CP (%) vs. PY and FY Plan', c1: '+2.6 / +1.4', c2: '+1.1 / +0.5', c3: '-0.3 / -0.6', c4: '-1.8 / -1.1' },
                        ].map((row, rIdx) => (
                          <tr key={rIdx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                            <td style={{ padding: '8px 4px', fontWeight: '700', color: '#334155', fontSize: '10px' }}>
                              {row.metric}
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'center', color: row.highlight ? '#15803D' : '#1E293B', fontWeight: row.highlight ? '700' : '500' }}>
                              {row.c1}
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'center', color: row.highlight ? '#15803D' : '#1E293B', fontWeight: row.highlight ? '700' : '500' }}>
                              {row.c2}
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'center', color: row.highlight ? '#15803D' : '#1E293B', fontWeight: row.highlight ? '700' : '500' }}>
                              {row.c3}
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'center', color: row.highlight ? '#DC2626' : '#1E293B', fontWeight: row.highlight ? '700' : '500' }}>
                              {row.c4}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Right: AI Insights Callout */}
                  <div style={{
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Sparkles size={14} color="#059669" />
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#166534' }}>
                          AI Insights • STRATEGIC MATRIX ANALYSIS
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#475569', marginBottom: '8px', lineHeight: '1.4' }}>
                        With the matrix now fully populated, three reads stand out for the operating plan:
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#1E293B' }}>GROWTH TIERING ALIGNMENT: </span>
                          <span style={{ fontSize: '9.5px', color: '#334155' }}>
                            Seed delivers &gt;10% NSV growth on outsized A&CP (+2.6 vs PY), while Harvest expands Gross Profit (+2.3).
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#1E293B' }}>MARGIN VS GROWTH: </span>
                          <span style={{ fontSize: '9.5px', color: '#334155' }}>
                            Seed is intentionally GP-dilutive (-0.8) to fund innovation; Fuel and Harvest carry the margin.
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#1E293B' }}>PROMO EFFICIENCY: </span>
                          <span style={{ fontSize: '9.5px', color: '#334155' }}>
                            QGI rises from Harvest (93) to Seed (109) — marketing spend converts premium buyers.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slide Footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '8px',
                  fontSize: '9px',
                  color: '#94A3B8',
                  fontWeight: '600'
                }}>
                  <span>MARS Food & Nutrition Corporate Review</span>
                  <span style={{ color: '#059669', fontWeight: '700' }}>CONFIDENTIAL — CORPORATE GOVERNANCE</span>
                  <span>Slide {activeSlide + 1} of 5</span>
                </div>
              </div>

              {/* Bottom Notification & Save Action */}
              <div style={{
                width: '100%',
                maxWidth: '960px',
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Edited slides persist locally. Commit slide modifications to save changes.
                </span>
                <button
                  onClick={handleSaveToSlide}
                  style={{
                    backgroundColor: savedSlideAlert ? '#059669' : '#10B981',
                    color: '#FFFFFF',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Save size={15} />
                  <span>{savedSlideAlert ? 'Saved to Slide!' : 'Save to Slide'}</span>
                </button>
              </div>
            </div>

            {/* COLUMN 3: AI & COMMENTARY WORKSPACE */}
            <div style={{
              borderLeft: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              overflowY: 'auto',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Tabs */}
              <div style={{
                backgroundColor: '#F1F5F9',
                borderRadius: '8px',
                padding: '3px',
                display: 'flex',
                gap: '4px',
                marginBottom: '16px'
              }}>
                <button
                  onClick={() => setRightPanelTab('commentary')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: rightPanelTab === 'commentary' ? '#FFFFFF' : 'transparent',
                    color: rightPanelTab === 'commentary' ? '#0F172A' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: rightPanelTab === 'commentary' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <MessageSquare size={14} />
                  <span>Commentary</span>
                </button>
                <button
                  onClick={() => setRightPanelTab('insights')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: rightPanelTab === 'insights' ? '#FFFFFF' : 'transparent',
                    color: rightPanelTab === 'insights' ? '#0F172A' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: rightPanelTab === 'insights' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <Sparkles size={14} color="#7C3AED" />
                  <span>Insights & Charts</span>
                </button>
              </div>

              {/* TAB 1: COMMENTARY WORKSPACE */}
              {rightPanelTab === 'commentary' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Governance Notice */}
                  <div style={{
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '11px',
                    color: '#166534',
                    lineHeight: '1.4'
                  }}>
                    The selected Executive Deck is governance-certified by the Insights leadership board. Generating narratives will apply standard corporate review logic.
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569', letterSpacing: '0.4px' }}>
                      COMMENTARY WORKSPACE
                    </span>
                    <button
                      onClick={handleRegenerateCommentaryWithAi}
                      disabled={isAiGeneratingCommentary}
                      style={{
                        backgroundColor: '#059669',
                        color: '#FFFFFF',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Sparkles size={13} className={isAiGeneratingCommentary ? 'animate-spin' : ''} />
                      <span>{isAiGeneratingCommentary ? 'Thinking...' : 'GENERATE WITH AI'}</span>
                    </button>
                  </div>

                  {/* Block 1: Category Headline */}
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', marginBottom: '2px' }}>Category Headline</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>Overall Italian cooking sauce market headline</div>
                    <textarea
                      value={commentary.headline}
                      onChange={(e) => setCommentary({ ...commentary, headline: e.target.value })}
                      rows={3}
                      style={{
                        width: '100%',
                        fontSize: '12px',
                        color: '#334155',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        padding: '8px',
                        lineHeight: '1.4',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Block 2: Category So What */}
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', marginBottom: '2px' }}>Category So What</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>Category health and growth driver analysis</div>
                    <textarea
                      value={commentary.soWhat}
                      onChange={(e) => setCommentary({ ...commentary, soWhat: e.target.value })}
                      rows={3}
                      style={{
                        width: '100%',
                        fontSize: '12px',
                        color: '#334155',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        padding: '8px',
                        lineHeight: '1.4',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Block 3: Category Now What */}
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', marginBottom: '2px' }}>Category Now What</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>Recommended tactical and strategic responses</div>
                    <textarea
                      value={commentary.nowWhat}
                      onChange={(e) => setCommentary({ ...commentary, nowWhat: e.target.value })}
                      rows={4}
                      style={{
                        width: '100%',
                        fontSize: '12px',
                        color: '#334155',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        padding: '8px',
                        lineHeight: '1.4',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button style={{
                    border: '1px dashed #CBD5E1',
                    borderRadius: '6px',
                    padding: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}>
                    <Plus size={14} />
                    <span>Add Custom Block</span>
                  </button>
                </div>
              )}

              {/* TAB 2: INSIGHTS & CHARTS */}
              {rightPanelTab === 'insights' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '8px' }}>ASK GEN AI FOR INSIGHTS</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="e.g. Compare digital spend vs TV ROI..."
                        value={chatPrompt}
                        onChange={(e) => setChatPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
                        style={{
                          flex: 1,
                          fontSize: '12px',
                          padding: '8px 12px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px'
                        }}
                      />
                      <button
                        onClick={() => handleSendPrompt()}
                        style={{
                          backgroundColor: '#1E3A8A',
                          color: '#FFFFFF',
                          padding: '8px 12px',
                          borderRadius: '6px'
                        }}
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', marginBottom: '6px' }}>SUGGESTED PROMPTS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        'Analyse pricing sensitivity by cell',
                        'Estimate future RIG momentum',
                        'Highlight Harvest cell drag'
                      ].map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendPrompt(chip)}
                          style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#1E293B',
                            backgroundColor: '#F1F5F9',
                            padding: '6px 10px',
                            borderRadius: '16px',
                            textAlign: 'left',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chat feed */}
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    {chatHistory.map((msg, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: '11px',
                          lineHeight: '1.4',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          backgroundColor: msg.sender === 'user' ? '#1E3A8A' : '#FFFFFF',
                          color: msg.sender === 'user' ? '#FFFFFF' : '#1E293B',
                          border: msg.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                          alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                          maxWidth: '90%'
                        }}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            height: '64px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px'
          }}>
            <button
              onClick={() => setCurrentStep(1)}
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ChevronLeft size={16} />
              <span>BACK TO CONFIGURATION</span>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              style={{
                backgroundColor: '#1E3A8A',
                color: '#FFFFFF',
                padding: '10px 24px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Continue to Share</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: DISTRIBUTION DASHBOARD                                 */}
      {/* ============================================================== */}
      {currentStep === 3 && (
        <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '32px 32px 80px 32px' }} className="animate-fade-in">
          
          <button
            onClick={() => setCurrentStep(2)}
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '20px'
            }}
          >
            <ChevronLeft size={16} />
            <span>STEP 3 OF 3 | Distribution Dashboard</span>
          </button>

          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
            Share Your Report
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '36px' }}>
            Export the presentation deck locally or distribute the compiled summary directly to key stakeholders.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
            
            {/* Card 1: Download PowerPoint */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <FileText size={22} />
                </div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#2563EB', textTransform: 'uppercase', marginBottom: '4px' }}>
                  DOWNLOAD POWERPOINT
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                  Generate Presentation Deck
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>
                  Compile all strategic slides, narrative blocks, and formatted tables into a single PPT file.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Reporting Region:</span>
                    <span style={{ fontWeight: '700', color: '#0F172A' }}>{selectedRegion}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Market Coverage:</span>
                    <span style={{ fontWeight: '700', color: '#0F172A' }}>{selectedMarket}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Slide Templates:</span>
                    <span style={{ fontWeight: '700', color: '#0F172A' }}>{selectedTemplate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Governance Status:</span>
                    <span style={{ fontWeight: '700', color: '#059669' }}>Certified</span>
                  </div>
                </div>
              </div>

              {/* Direct link to download the actual 80-slide deck generated in the POC */}
              <a
                href="/FNOS_European_Executive_Review_80_Slides.pptx"
                download="FNOS_European_Executive_Review_80_Slides.pptx"
                style={{
                  backgroundColor: '#1E3A8A',
                  color: '#FFFFFF',
                  padding: '14px 24px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)'
                }}
              >
                <Download size={18} />
                <span>Download PowerPoint (80 Slides)</span>
              </a>
            </div>

            {/* Card 2: Share via Email */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Share2 size={22} />
                </div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#059669', textTransform: 'uppercase', marginBottom: '4px' }}>
                  SHARE VIA EMAIL
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                  Distribute to Stakeholders
                </h3>

                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '6px' }}>
                    SELECT RECIPIENT
                  </label>
                  <input
                    type="text"
                    defaultValue="richard.branson@mars.com, sarah.director@mars.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '6px' }}>
                    DRAFT SUMMARY & OUTLINE
                  </label>
                  <input
                    type="text"
                    defaultValue={`[FNOS Report] Performance Review — ${selectedRegion} (${selectedMarket})`}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}
                  />
                  <textarea
                    rows={4}
                    defaultValue="Hi Leadership Team, Please find attached the strategic narrative performance deck. Key highlights: Seed cell growth surpassed >10% while category penetration softened by -1.4pp due to price inflation."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      color: '#475569'
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => alert("Report successfully queued and dispatched to stakeholders!")}
                style={{
                  backgroundColor: '#818CF8',
                  color: '#FFFFFF',
                  padding: '14px 24px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Send size={18} />
                <span>SEND REPORT</span>
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
