# Graph Report - micellia  (2026-10-31)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 366 nodes · 518 edges · 30 communities (22 shown, 8 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.85)
- Token cost: 22,393 input · 237 output

## Graph Freshness
- Built from commit: `37ef000d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Cortex Networking
- Dashboard Controls
- S60 Arithmetic
- Firmware Simulator Parsing
- Container Infrastructure
- Sales Bot Interface
- Cortex Container Configuration
- SEO Page Generation
- Cart and Order Processing
- User Authentication and Profile
- Rust-Python ML Bindings
- Accessibility Controls
- Guided Tour
- Live Sensor Dashboard
- Firmware Startup
- Admin Tasks and Forecasts
- Telemetry Monitoring
- Hero Image Slider
- Content Image Slider
- Firmware and S60 Integration
- Admin Order Management
- S60 Formatting
- 3D Mushroom Visualization
- Production Server Setup
- Code Review MCP Configuration
- Code Review MCP Configuration
- SSL Certificate Issuance
- Session Start Script
- Graph Update Script
- Cell Deployment Script

## God Nodes (most connected - your core abstractions)
1. `S60` - 30 edges
2. `AppState` - 14 edges
3. `micelia-cortex` - 9 edges
4. `handle_node_connection()` - 8 edges
5. `micelia-db` - 8 edges
6. `connectWebSocket()` - 7 edges
7. `sample()` - 7 edges
8. `micelia-redis` - 7 edges
9. `updateActiveButtons()` - 6 edges
10. `renderCart()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `sample()`  [INFERRED]
  system/firmware-sim/src/main.rs → system/firmware-sim/src/model.rs
- `cortex` --depends_on--> `s60`  [EXTRACTED]
  system/cortex/Cargo.toml → system/s60/Cargo.toml
- `firmware` --depends_on--> `s60`  [EXTRACTED]
  system/firmware/Cargo.toml → system/s60/Cargo.toml
- `firmware-sim` --depends_on--> `s60`  [EXTRACTED]
  system/firmware-sim/Cargo.toml → system/s60/Cargo.toml

## Import Cycles
- 1-file cycle: `system/firmware-sim/src/main.rs -> system/firmware-sim/src/main.rs`
- 1-file cycle: `system/cortex/src/main.rs -> system/cortex/src/main.rs`

## Communities (30 total, 8 thin omitted)

### Community 0 - "Cortex Networking"
Cohesion: 0.06
Nodes (23): AppState, ChamberState, create_order(), DashboardAction, get_orders(), handle_node_connection(), handle_websocket(), HTTP_PORT (+15 more)

### Community 1 - "Dashboard Controls"
Cohesion: 0.05
Nodes (36): btnDashboard, btnDeliveries, btnDossier, btnLogout, btnMlForecast, btnNextState, btnTasks, btnTriggerAlert (+28 more)

### Community 2 - "S60 Arithmetic"
Cohesion: 0.08
Nodes (7): S60, .ONE, .SCALE, .ZERO, test_arithmetic(), test_conversion(), test_negative_conversion()

### Community 3 - "Firmware Simulator Parsing"
Cohesion: 0.08
Nodes (16): Args, args(), main(), pins_loopback_destination(), Scenario, ScenarioArg, PressureDrop, Stable (+8 more)

### Community 4 - "Container Infrastructure"
Cohesion: 0.08
Nodes (29): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, interval, retries, test, timeout, container_name (+21 more)

### Community 5 - "Sales Bot Interface"
Cohesion: 0.09
Nodes (14): appendMessage(), cart, DEFAULT_USERS, initSalesBotUI(), LIFESTYLES, miceliaUsers, PUBLIC_ARTICLES, savedUsers (+6 more)

### Community 6 - "Cortex Container Configuration"
Cohesion: 0.10
Nodes (20): context, dockerfile, micelia-db, micelia-redis, DATABASE_URL, PORT, REDIS_URL, STATIC_DIR (+12 more)

### Community 7 - "SEO Page Generation"
Cohesion: 0.17
Nodes (11): articleTemplate(), basePath, dashboardDir, docsDir, escapeHtml(), files, inline(), markdownToHtml() (+3 more)

### Community 8 - "Cart and Order Processing"
Cohesion: 0.20
Nodes (12): addToCart(), appendSalesBotMessage(), calculateTotal(), closeProfileModal(), finishOrder(), handleSalesBotSubmit(), logoutUser(), orderPredictedItem() (+4 more)

### Community 9 - "User Authentication and Profile"
Cohesion: 0.28
Nodes (9): closeLoginModal(), connectClientWebSocket(), loadUserOrders(), loginSocial(), loginUser(), openProfileModal(), renderProfileOrders(), runMLPrediction() (+1 more)

### Community 10 - "Rust-Python ML Bindings"
Cohesion: 0.32
Nodes (3): cortex(), predict_sales(), s60_to_string()

### Community 11 - "Accessibility Controls"
Cohesion: 0.29
Nodes (8): applySavedA11ySettings(), initAccessibilityUI(), setA11yAnimations(), setA11yContrast(), setA11yFontSize(), setA11yTheme(), toggleAccessibilityPanel(), updateActiveButtons()

### Community 12 - "Guided Tour"
Cohesion: 0.50
Nodes (7): clearHighlights(), closeWhatsAppWidget(), exitTour(), handleNext(), renderStep(), startTour(), typeWriter()

### Community 13 - "Live Sensor Dashboard"
Cohesion: 0.48
Nodes (6): connectWebSocket(), setGaugeValue(), updateCO2(), updateHumidity(), updateStateUI(), updateTemperature()

### Community 15 - "Admin Tasks and Forecasts"
Cohesion: 0.40
Nodes (5): balanceTaskAssignee(), getTasks(), loadAndRenderTasks(), renderMlForecastChart(), switchView()

### Community 16 - "Telemetry Monitoring"
Cohesion: 0.60
Nodes (5): generateTelemetryHash(), openTelemetryStudyModal(), renderTelemetryChart(), renderTelemetryLogsTable(), updateLiveTelemetryStudy()

### Community 17 - "Hero Image Slider"
Cohesion: 0.60
Nodes (5): initHeroSlider(), resetHeroInterval(), setHeroSlide(), showHeroSlide(), startHeroInterval()

### Community 18 - "Content Image Slider"
Cohesion: 0.40
Nodes (5): moveSlider(), resetSliderInterval(), setSlide(), showSlide(), sliderInterval

### Community 19 - "Firmware and S60 Integration"
Cohesion: 0.50
Nodes (4): cortex, firmware, firmware-sim, s60

### Community 20 - "Admin Order Management"
Cohesion: 0.50
Nodes (4): addLog(), changeOrderStatus(), loadAdminOrders(), renderLogs()

### Community 22 - "3D Mushroom Visualization"
Cohesion: 0.67
Nodes (4): createWireframeOysterMushroom(), initMycelium3D(), animate(), updatePointsArray()

### Community 23 - "Production Server Setup"
Cohesion: 0.83
Nodes (3): crear_zona_dns(), es_ipv4_publica_valida(), setup_multi_production.sh script

## Knowledge Gaps
- **10 isolated node(s):** `MAX_TELEMETRY_FRAME_BYTES`, `cortex`, `firmware`, `firmware-sim`, `uvx` (+5 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 170 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `services` connect `Container Infrastructure` to `Cortex Container Configuration`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `MAX_TELEMETRY_FRAME_BYTES`, `cortex`, `firmware` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Cortex Networking` be split into smaller, more focused modules?**
  _Cohesion score 0.06095791001451379 - nodes in this community are weakly interconnected._
- **Why does `micelia-cortex` connect `Cortex Container Configuration` to `Container Infrastructure`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Should `Dashboard Controls` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `S60 Arithmetic` be split into smaller, more focused modules?**
  _Cohesion score 0.08408408408408409 - nodes in this community are weakly interconnected._
- **Should `Firmware Simulator Parsing` be split into smaller, more focused modules?**
  _Cohesion score 0.07657657657657657 - nodes in this community are weakly interconnected._