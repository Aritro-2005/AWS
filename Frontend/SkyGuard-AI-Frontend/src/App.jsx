import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Cloud,
  CloudRain,
  Cpu,
  Database,
  Gauge,
  Home,
  Menu,
  Radio,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Thermometer,
  Wifi,
  WifiOff,
  X,
  Droplets,
  Wind,
  Zap,
  Clock3,
  MapPin,
  BrainCircuit
} from "lucide-react";

const initialReadings = {
  temperature: 31.8,
  humidity: 67,
  pressure: 1008.4
};

const stations = [
  { id: "AWS-001", location: "Kolkata North", status: "Online", temp: 31.8, humidity: 67, pressure: 1008.4 },
  { id: "AWS-002", location: "Salt Lake", status: "Online", temp: 31.4, humidity: 69, pressure: 1008.1 },
  { id: "AWS-003", location: "New Town", status: "Warning", temp: 38.7, humidity: 42, pressure: 1002.7 }
];

const anomalies = [
  {
    id: 1,
    type: "Temperature anomaly",
    station: "AWS-003",
    severity: "High",
    time: "10:42:18",
    detail: "Temperature is significantly different from nearby stations.",
    confidence: 94
  },
  {
    id: 2,
    type: "Communication issue",
    station: "AWS-004",
    severity: "Medium",
    time: "10:38:02",
    detail: "Intermittent data packets detected.",
    confidence: 87
  },
  {
    id: 3,
    type: "Sensor drift",
    station: "AWS-001",
    severity: "Low",
    time: "10:24:31",
    detail: "Small deviation from historical sensor baseline.",
    confidence: 72
  }
];

function App() {
  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [live, setLive] = useState(true);
  const [readings, setReadings] = useState(initialReadings);
  const [selectedStation, setSelectedStation] = useState("AWS-001");

  const navigation = [
    { name: "Dashboard", icon: Home },
    { name: "Live Monitoring", icon: Activity },
    { name: "Anomaly Detection", icon: BrainCircuit },
    { name: "Stations", icon: Radio },
    { name: "Communication", icon: Wifi },
    { name: "History", icon: Database },
    { name: "Alerts", icon: Bell }
  ];

  const currentStation = useMemo(
    () => stations.find((s) => s.id === selectedStation) || stations[0],
    [selectedStation]
  );

  function refreshReadings() {
    setReadings({
      temperature: +(31 + Math.random() * 2).toFixed(1),
      humidity: Math.round(64 + Math.random() * 7),
      pressure: +(1006 + Math.random() * 4).toFixed(1)
    });
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><ShieldCheck size={24} /></div>
          <div>
            <div className="brand-name">SKYGUARD</div>
            <div className="brand-sub">AI WEATHER INTELLIGENCE</div>
          </div>
        </div>

        <div className="station-mini">
          <div className="mini-dot"></div>
          <div>
            <strong>{selectedStation}</strong>
            <span>{currentStation.location}</span>
          </div>
          <ChevronRight size={16} />
        </div>

        <div className="nav-label">MONITORING</div>
        <nav>
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${active === name ? "active" : ""}`}
              onClick={() => {
                setActive(name);
                setSidebarOpen(false);
              }}
            >
              <Icon size={18} />
              <span>{name}</span>
              {name === "Alerts" && <b className="nav-count">3</b>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-card">
            <div className="system-card-head">
              <span>System health</span>
              <span className="health-dot"></span>
            </div>
            <strong>98.6%</strong>
            <div className="health-line"><span></span></div>
            <small>All core services operational</small>
          </div>

          <button className="settings-btn" onClick={() => setShowSettings(true)}>
            <Settings size={18} /> Settings
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={22} />
          </button>

          <div className="page-title">
            <div className="eyebrow">AUTOMATIC WEATHER STATION / AI CONTROL CENTER</div>
            <h1>{active}</h1>
          </div>

          <div className="top-actions">
            <div className={`live-pill ${live ? "online" : "offline"}`}>
              <span></span>
              {live ? "LIVE SYSTEM" : "PAUSED"}
            </div>
            <button className="icon-button" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={19} />
              <b>3</b>
            </button>
            <button className="profile" onClick={() => setShowSettings(true)}>
              <span>BG</span>
              <div>
                <strong>Operator</strong>
                <small>Admin</small>
              </div>
            </button>
          </div>
        </header>

        <section className="content">
          {active === "Dashboard" && (
            <Dashboard
              readings={readings}
              live={live}
              setLive={setLive}
              refreshReadings={refreshReadings}
              stations={stations}
              selectedStation={selectedStation}
              setSelectedStation={setSelectedStation}
              onOpenAnomaly={() => setActive("Anomaly Detection")}
            />
          )}

          {active === "Live Monitoring" && (
            <LiveMonitoring readings={readings} refreshReadings={refreshReadings} live={live} />
          )}

          {active === "Anomaly Detection" && (
            <AnomalyDetection onBack={() => setActive("Dashboard")} />
          )}

          {active === "Stations" && (
            <Stations
              stations={stations}
              selectedStation={selectedStation}
              setSelectedStation={setSelectedStation}
            />
          )}

          {active === "Communication" && <Communication />}
          {active === "History" && <History />}
          {active === "Alerts" && <Alerts />}
        </section>
      </main>

      {showNotifications && (
        <div className="floating-panel notification-panel">
          <div className="panel-title">
            <strong>Recent alerts</strong>
            <button onClick={() => setShowNotifications(false)}><X size={17} /></button>
          </div>
          <div className="notification">
            <AlertTriangle size={18} />
            <div><strong>AWS-003 anomaly</strong><span>Temperature deviation detected</span></div>
          </div>
          <div className="notification">
            <WifiOff size={18} />
            <div><strong>AWS-004 communication</strong><span>Intermittent packets</span></div>
          </div>
          <div className="notification">
            <CheckCircle2 size={18} />
            <div><strong>AWS-001 recovered</strong><span>Sensor is operating normally</span></div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="eyebrow">SYSTEM CONTROL</div>
                <h2>SkyGuard Settings</h2>
              </div>
              <button onClick={() => setShowSettings(false)}><X /></button>
            </div>
            <div className="setting-row"><span>Live monitoring</span><button className={`switch ${live ? "on" : ""}`} onClick={() => setLive(!live)}><span></span></button></div>
            <div className="setting-row"><span>AI anomaly detection</span><button className="switch on"><span></span></button></div>
            <div className="setting-row"><span>Nearby station comparison</span><button className="switch on"><span></span></button></div>
            <div className="setting-row"><span>Automatic alerts</span><button className="switch on"><span></span></button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function Dashboard({ readings, live, setLive, refreshReadings, stations, selectedStation, setSelectedStation, onOpenAnomaly }) {
  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">REAL-TIME AWS OBSERVATION</div>
          <h2>Weather station intelligence at a glance.</h2>
          <p>Monitor sensor health, detect anomalies and compare nearby stations in real time.</p>
        </div>
        <div className="header-buttons">
          <button className="secondary-btn" onClick={refreshReadings}><RefreshCw size={16} /> Refresh</button>
          <button className={`primary-btn ${!live ? "paused" : ""}`} onClick={() => setLive(!live)}>
            <span className="btn-live-dot"></span>{live ? "Live monitoring" : "Monitoring paused"}
          </button>
        </div>
      </div>

      <div className="sensor-grid">
        <SensorCard
          icon={<Thermometer />}
          label="Temperature"
          value={readings.temperature}
          unit="°C"
          status="Normal"
          detail="Within expected range"
          graph={[28, 29, 30, 29, 31, 30, 32, 31, 32, readings.temperature]}
          type="temperature"
        />
        <SensorCard
          icon={<Droplets />}
          label="Humidity"
          value={readings.humidity}
          unit="%"
          status="Normal"
          detail="Stable sensor reading"
          graph={[61, 64, 63, 65, 66, 65, 68, 67, 66, readings.humidity]}
          type="humidity"
        />
        <SensorCard
          icon={<Gauge />}
          label="Atmospheric Pressure"
          value={readings.pressure}
          unit="hPa"
          status="Normal"
          detail="Stable atmospheric pressure"
          graph={[1005, 1007, 1006, 1008, 1007, 1009, 1008, 1007, 1008, readings.pressure]}
          type="pressure"
        />
      </div>

      <div className="section-heading">
        <div>
          <span className="section-kicker">PPT WORKFLOW</span>
          <h3>Core detection pipeline</h3>
        </div>
        <span className="live-time"><Clock3 size={15} /> Updated just now</span>
      </div>

      <div className="workflow-grid">
        <WorkflowCard
          icon={<BrainCircuit />}
          number="01"
          title="Anomaly Detection"
          text="AI compares current readings with historical patterns and nearby AWS stations."
          status="Monitoring"
          tone="cyan"
          onClick={onOpenAnomaly}
        />
        <WorkflowCard
          icon={<Cpu />}
          number="02"
          title="Malfunction Detection"
          text="Identify unusual sensor behaviour, drift, spikes and potentially corrupted values."
          status="3 events"
          tone="orange"
          onClick={onOpenAnomaly}
        />
        <WorkflowCard
          icon={<Wifi />}
          number="03"
          title="Communication"
          text="Monitor station connectivity and detect missing or interrupted data packets."
          status="1 warning"
          tone="purple"
          onClick={() => {}}
        />
      </div>

      <div className="two-column">
        <div className="panel station-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">NEARBY STATIONS</span>
              <h3>Station comparison</h3>
            </div>
            <span className="tiny-status"><span></span> 3 stations online</span>
          </div>

          <div className="station-table">
            <div className="table-row table-head">
              <span>Station</span><span>Temperature</span><span>Humidity</span><span>Pressure</span><span>Status</span>
            </div>
            {stations.map((station) => (
              <button
                className={`table-row station-row ${selectedStation === station.id ? "selected" : ""}`}
                key={station.id}
                onClick={() => setSelectedStation(station.id)}
              >
                <span className="station-name"><i></i><strong>{station.id}</strong><small>{station.location}</small></span>
                <span>{station.temp}°C</span>
                <span>{station.humidity}%</span>
                <span>{station.pressure}</span>
                <span className={`status ${station.status.toLowerCase()}`}>{station.status}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel alert-panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">AI INSIGHT</span>
              <h3>Latest anomaly</h3>
            </div>
            <BrainCircuit size={20} />
          </div>
          <div className="ai-alert">
            <div className="ai-icon"><AlertTriangle /></div>
            <div>
              <span className="severity high">HIGH SEVERITY</span>
              <h4>AWS-003 temperature anomaly</h4>
              <p>38.7°C detected while nearby stations are around 31–32°C.</p>
            </div>
          </div>
          <div className="confidence">
            <div><span>AI confidence</span><strong>94%</strong></div>
            <div className="confidence-track"><span style={{ width: "94%" }}></span></div>
          </div>
          <button className="outline-full" onClick={onOpenAnomaly}>View detection details <ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="system-flow">
        <div className="flow-title">
          <div><span className="section-kicker">SYSTEM FLOW</span><h3>Sensor → Server → AI → Alert</h3></div>
          <span>SkyGuard AI</span>
        </div>
        <div className="flow">
          <FlowItem icon={<Thermometer />} title="Sensors" text="Temp • Humidity • Pressure" />
          <FlowArrow />
          <FlowItem icon={<Database />} title="Storage" text="SD card / Server" />
          <FlowArrow />
          <FlowItem icon={<BrainCircuit />} title="AI Detection" text="Compare & classify" />
          <FlowArrow />
          <FlowItem icon={<Bell />} title="Alert" text="Notify operator" />
        </div>
      </div>
    </>
  );
}

function SensorCard({ icon, label, value, unit, status, detail, graph, type }) {
  const points = graph.map((v, i) => {
    const min = Math.min(...graph);
    const max = Math.max(...graph);
    const y = 42 - ((v - min) / Math.max(max - min, 1)) * 30;
    return `${i * 11},${y}`;
  }).join(" ");

  return (
    <div className={`sensor-card ${type}`}>
      <div className="sensor-top">
        <div className="sensor-icon">{icon}</div>
        <span className="status normal"><span></span>{status}</span>
      </div>
      <div className="sensor-label">{label}</div>
      <div className="sensor-value">{value}<small>{unit}</small></div>
      <div className="sensor-detail">{detail}</div>
      <svg className="sparkline" viewBox="0 0 100 48" preserveAspectRatio="none">
        <polyline points={points} fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="sensor-footer"><span>Live value</span><span>Last 10 samples</span></div>
    </div>
  );
}

function WorkflowCard({ icon, number, title, text, status, tone, onClick }) {
  return (
    <button className={`workflow-card ${tone}`} onClick={onClick}>
      <div className="workflow-card-top">
        <div className="workflow-icon">{icon}</div>
        <span>{number}</span>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <div className="workflow-bottom"><span>{status}</span><ChevronRight size={16} /></div>
    </button>
  );
}

function FlowItem({ icon, title, text }) {
  return (
    <div className="flow-item">
      <div className="flow-icon">{icon}</div>
      <div><strong>{title}</strong><span>{text}</span></div>
    </div>
  );
}

function FlowArrow() {
  return <div className="flow-arrow"><ChevronRight size={17} /></div>;
}

function LiveMonitoring({ readings, refreshReadings, live }) {
  return (
    <div className="page-stack">
      <div className="page-intro">
        <div><span className="section-kicker">LIVE DATA STREAM</span><h2>Sensor monitoring</h2><p>Continuous observation of temperature, humidity and atmospheric pressure.</p></div>
        <button className="primary-btn" onClick={refreshReadings}><RefreshCw size={16}/> Update readings</button>
      </div>
      <div className="sensor-grid">
        <SensorCard icon={<Thermometer />} label="Temperature" value={readings.temperature} unit="°C" status="Normal" detail="Live ESP32 sensor" graph={[29,30,29,31,30,31,32,31,32,readings.temperature]} type="temperature" />
        <SensorCard icon={<Droplets />} label="Humidity" value={readings.humidity} unit="%" status="Normal" detail="Live ESP32 sensor" graph={[62,64,63,65,64,66,68,67,66,readings.humidity]} type="humidity" />
        <SensorCard icon={<Gauge />} label="Pressure" value={readings.pressure} unit="hPa" status="Normal" detail="Live pressure sensor" graph={[1005,1006,1007,1007,1008,1007,1009,1008,1008,readings.pressure]} type="pressure" />
      </div>
      <div className="large-chart panel">
        <div className="panel-header"><div><span className="section-kicker">REAL-TIME TREND</span><h3>Sensor behaviour</h3></div><span className={`stream-status ${live ? "on" : ""}`}><span></span>{live ? "Streaming" : "Paused"}</span></div>
        <TrendChart />
      </div>
    </div>
  );
}

function TrendChart() {
  const lines = [
    "0,160 60,145 120,152 180,130 240,136 300,112 360,120 420,96 480,104 540,84 600,92 660,70 720,80",
    "0,105 60,110 120,103 180,112 240,100 300,108 360,96 420,102 480,94 540,100 600,90 660,95 720,88"
  ];
  return (
    <div className="trend-wrap">
      <div className="chart-y"><span>High</span><span>Normal</span><span>Low</span></div>
      <svg viewBox="0 0 720 180" preserveAspectRatio="none" className="trend-svg">
        {[20, 60, 100, 140, 180].map(y => <line key={y} x1="0" y1={y} x2="720" y2={y} className="grid-line" />)}
        <polyline points={lines[0]} className="chart-line main-line" fill="none" />
        <polyline points={lines[1]} className="chart-line secondary-line" fill="none" />
      </svg>
      <div className="chart-x"><span>-60m</span><span>-45m</span><span>-30m</span><span>-15m</span><span>Now</span></div>
    </div>
  );
}

function AnomalyDetection() {
  const [selected, setSelected] = useState(anomalies[0]);
  return (
    <div className="page-stack">
      <div className="page-intro">
        <div><span className="section-kicker">AI / ML ENGINE</span><h2>Anomaly detection</h2><p>Detect unusual readings using historical and nearby-station comparisons.</p></div>
        <div className="ai-engine-badge"><BrainCircuit size={18}/> AI Engine Active</div>
      </div>
      <div className="anomaly-layout">
        <div className="panel anomaly-list">
          <div className="panel-header"><div><span className="section-kicker">DETECTED EVENTS</span><h3>Recent anomalies</h3></div><span className="event-count">3 events</span></div>
          {anomalies.map(item => (
            <button key={item.id} className={`anomaly-item ${selected.id === item.id ? "selected" : ""}`} onClick={() => setSelected(item)}>
              <div className={`anomaly-symbol ${item.severity.toLowerCase()}`}><AlertTriangle size={18}/></div>
              <div className="anomaly-copy"><strong>{item.type}</strong><span>{item.station} • {item.time}</span><p>{item.detail}</p></div>
              <ChevronRight size={17}/>
            </button>
          ))}
        </div>
        <div className="panel detection-detail">
          <div className="detail-head"><div><span className={`severity ${selected.severity.toLowerCase()}`}>{selected.severity.toUpperCase()} SEVERITY</span><h3>{selected.type}</h3><p>{selected.station} • Detected at {selected.time}</p></div><div className="big-confidence">{selected.confidence}%<small>confidence</small></div></div>
          <div className="detection-box"><div className="detection-icon"><BrainCircuit /></div><div><strong>AI analysis</strong><p>{selected.detail} The model compares the current observation against historical behaviour and nearby station values before generating the event.</p></div></div>
          <div className="compare-grid"><div><span>Observed</span><strong>38.7°C</strong></div><div><span>Nearby average</span><strong>31.8°C</strong></div><div><span>Deviation</span><strong>+6.9°C</strong></div></div>
          <div className="correction"><div className="correction-icon"><CheckCircle2 /></div><div><span>RECOMMENDED ACTION</span><strong>Inspect AWS-003 temperature sensor</strong><p>Use nearby station and historical values as a reference before accepting the reading.</p></div></div>
        </div>
      </div>
    </div>
  );
}

function Stations({ stations, selectedStation, setSelectedStation }) {
  return (
    <div className="page-stack">
      <div className="page-intro"><div><span className="section-kicker">AWS NETWORK</span><h2>Weather stations</h2><p>Compare nearby stations to identify suspicious sensor observations.</p></div><div className="network-status"><span></span>Network connected</div></div>
      <div className="station-cards">
        {stations.map(s => (
          <button key={s.id} className={`station-card ${selectedStation === s.id ? "selected" : ""}`} onClick={() => setSelectedStation(s.id)}>
            <div className="station-card-head"><div className="station-pin"><MapPin size={17}/></div><span className={`status ${s.status.toLowerCase()}`}>{s.status}</span></div>
            <strong>{s.id}</strong><span>{s.location}</span>
            <div className="station-values"><div><small>Temp</small><b>{s.temp}°C</b></div><div><small>Humidity</small><b>{s.humidity}%</b></div><div><small>Pressure</small><b>{s.pressure}</b></div></div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Communication() {
  return (
    <div className="page-stack">
      <div className="page-intro"><div><span className="section-kicker">COMMUNICATION HEALTH</span><h2>Station connectivity</h2><p>Monitor data transmission between AWS stations and the SkyGuard server.</p></div></div>
      <div className="comm-grid">
        <Metric icon={<Wifi />} label="Connected stations" value="3 / 4" detail="75% network availability" />
        <Metric icon={<Zap />} label="Data packets" value="98.2%" detail="Successful delivery rate" />
        <Metric icon={<Server />} label="Server latency" value="84 ms" detail="Average response time" />
      </div>
      <div className="panel">
        <div className="panel-header"><div><span className="section-kicker">CONNECTION LOG</span><h3>Communication events</h3></div></div>
        {["AWS-001 — packet received successfully", "AWS-002 — packet received successfully", "AWS-004 — intermittent connection", "AWS-003 — packet received successfully"].map((x, i) => (
          <div className="log-row" key={x}><span className={`log-dot ${i === 2 ? "warn" : ""}`}></span><strong>{x}</strong><small>{i * 4 + 2} min ago</small></div>
        ))}
      </div>
    </div>
  );
}

function History() {
  return (
    <div className="page-stack">
      <div className="page-intro"><div><span className="section-kicker">SERVER DATA</span><h2>Historical observations</h2><p>Previous readings used by SkyGuard for anomaly and data-corruption comparison.</p></div><button className="secondary-btn"><Search size={16}/> Search data</button></div>
      <div className="panel">
        <div className="history-filters"><button className="filter-active">Today</button><button>7 days</button><button>30 days</button></div>
        <div className="history-table">
          <div className="table-row table-head"><span>Timestamp</span><span>Station</span><span>Temperature</span><span>Humidity</span><span>Pressure</span><span>Result</span></div>
          {[
            ["10:42:18","AWS-003","38.7°C","42%","1002.7","Anomaly"],
            ["10:41:18","AWS-001","31.8°C","67%","1008.4","Normal"],
            ["10:40:18","AWS-002","31.4°C","69%","1008.1","Normal"],
            ["10:39:18","AWS-003","37.9°C","43%","1002.9","Warning"],
            ["10:38:18","AWS-001","31.7°C","68%","1008.3","Normal"]
          ].map(row => <div className="table-row" key={row.join("-")}>{row.map((cell,i)=><span key={i} className={i===5 ? `result ${cell.toLowerCase()}` : ""}>{cell}</span>)}</div>)}
        </div>
      </div>
    </div>
  );
}

function Alerts() {
  return (
    <div className="page-stack">
      <div className="page-intro"><div><span className="section-kicker">OPERATOR NOTIFICATIONS</span><h2>Alerts & reports</h2><p>Important anomaly and communication events requiring attention.</p></div><button className="primary-btn"><Bell size={16}/> Configure alerts</button></div>
      <div className="alert-list">
        <AlertRow icon={<AlertTriangle />} title="AWS-003 temperature anomaly" station="New Town" severity="High" text="Reading differs significantly from nearby stations." time="10:42:18" />
        <AlertRow icon={<WifiOff />} title="AWS-004 communication issue" station="Howrah" severity="Medium" text="Packets are arriving intermittently." time="10:38:02" />
        <AlertRow icon={<RefreshCw />} title="AWS-001 sensor drift" station="Kolkata North" severity="Low" text="Small deviation detected against historical baseline." time="10:24:31" />
      </div>
    </div>
  );
}

function AlertRow({ icon, title, station, severity, text, time }) {
  return <div className="panel alert-row"><div className={`alert-row-icon ${severity.toLowerCase()}`}>{icon}</div><div className="alert-row-main"><div><span className={`severity ${severity.toLowerCase()}`}>{severity}</span><span className="alert-time">{time}</span></div><h3>{title}</h3><p>{text}</p><small><MapPin size={13}/> {station}</small></div><button className="outline-btn">View</button></div>;
}

function Metric({ icon, label, value, detail }) {
  return <div className="metric-card"><div className="metric-icon">{icon}</div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

export default App;