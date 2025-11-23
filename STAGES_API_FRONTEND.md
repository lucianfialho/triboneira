# Stages API - Guia Frontend

## Visão Geral

O endpoint Stages retorna todos os stages (etapas) de um evento multi-stage, como CS2 Majors que têm Stage 1, Stage 2 e Playoffs.

**Endpoint:** `GET /api/events/[externalId]/stages`

**Quando usar:**
- Eventos CS2 Majors (que têm múltiplos stages)
- Criar navegação por tabs (Stage 1 / Stage 2 / Playoffs)
- Mostrar linha do tempo do evento
- Listar todos os sub-eventos relacionados

## Tipos TypeScript

```typescript
interface StageInfo {
  id: number;
  externalId: string;
  name: string;
  shortName: string;        // "Stage 1", "Stage 2", "Playoffs"
  type: 'swiss' | 'bracket' | 'qualifier' | 'other';
  status: string;           // "upcoming", "ongoing", "finished"
  dateStart: string | null; // ISO 8601
  dateEnd: string | null;
  numberOfTeams: number | null;
}

interface StagesResponse {
  event: {
    id: number;
    externalId: string;
    name: string;
    status: string;
  };
  hasStages: boolean;
  stages: StageInfo[];
}
```

## Estrutura da Resposta

```json
{
  "event": {
    "id": 16,
    "externalId": "8042",
    "name": "StarLadder Budapest Major 2025",
    "status": "upcoming"
  },
  "hasStages": true,
  "stages": [
    {
      "id": 14,
      "externalId": "8504",
      "name": "StarLadder Budapest Major 2025 Stage 1",
      "shortName": "Stage 1",
      "type": "swiss",
      "status": "upcoming",
      "dateStart": "2025-11-24T11:00:00.000Z",
      "dateEnd": "2025-11-27T11:00:00.000Z",
      "numberOfTeams": 16
    },
    {
      "id": 15,
      "externalId": "8505",
      "name": "StarLadder Budapest Major 2025 Stage 2",
      "shortName": "Stage 2",
      "type": "swiss",
      "status": "upcoming",
      "dateStart": "2025-11-29T11:00:00.000Z",
      "dateEnd": "2025-12-02T11:00:00.000Z",
      "numberOfTeams": 16
    },
    {
      "id": 16,
      "externalId": "8042",
      "name": "StarLadder Budapest Major 2025",
      "shortName": "Playoffs",
      "type": "bracket",
      "status": "upcoming",
      "dateStart": null,
      "dateEnd": null,
      "numberOfTeams": 16
    }
  ]
}
```

## Como Usar

### 1. Navegação por Tabs

Use para criar tabs de navegação entre stages:

```tsx
function MajorTabs({ eventId }: { eventId: string }) {
  const [stagesData, setStagesData] = useState<StagesResponse | null>(null);
  const [currentStage, setCurrentStage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}/stages`)
      .then(res => res.json())
      .then(data => {
        setStagesData(data);
        // Set first stage as default
        if (data.stages.length > 0) {
          setCurrentStage(data.stages[0].externalId);
        }
      });
  }, [eventId]);

  if (!stagesData || !stagesData.hasStages) {
    return <SingleStageView eventId={eventId} />;
  }

  return (
    <div className="major-container">
      {/* Header */}
      <h1>{stagesData.event.name}</h1>

      {/* Tabs */}
      <div className="tabs">
        {stagesData.stages.map(stage => (
          <button
            key={stage.externalId}
            className={`tab ${currentStage === stage.externalId ? 'active' : ''}`}
            onClick={() => setCurrentStage(stage.externalId)}
          >
            {stage.shortName}
            {stage.status === 'ongoing' && <span className="live-dot">🔴</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="tab-content">
        {stagesData.stages.map(stage => (
          <div
            key={stage.externalId}
            style={{ display: currentStage === stage.externalId ? 'block' : 'none' }}
          >
            {stage.type === 'swiss' ? (
              <SwissView eventId={stage.externalId} />
            ) : (
              <BracketView eventId={stage.externalId} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Timeline do Evento

Mostrar cronograma com datas de cada stage:

```tsx
function EventTimeline({ eventId }: { eventId: string }) {
  const [stagesData, setStagesData] = useState<StagesResponse | null>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}/stages`)
      .then(res => res.json())
      .then(data => setStagesData(data));
  }, [eventId]);

  if (!stagesData) return <Loading />;

  return (
    <div className="timeline">
      <h3>Cronograma do Evento</h3>

      {stagesData.stages.map((stage, index) => {
        const isActive = stage.status === 'ongoing';
        const isPast = stage.status === 'finished';

        return (
          <div key={stage.externalId} className={`timeline-item ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}>
            {/* Timeline dot */}
            <div className="timeline-dot">
              {isPast && '✓'}
              {isActive && '●'}
              {!isPast && !isActive && index + 1}
            </div>

            {/* Stage info */}
            <div className="timeline-content">
              <h4>{stage.shortName}</h4>
              <p className="stage-type">{stage.type === 'swiss' ? 'Swiss System' : 'Playoffs'}</p>

              {stage.dateStart && (
                <p className="dates">
                  {new Date(stage.dateStart).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'short'
                  })}
                  {' - '}
                  {stage.dateEnd && new Date(stage.dateEnd).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
              )}

              <span className={`status-badge ${stage.status}`}>
                {stage.status === 'upcoming' && '📅 Em breve'}
                {stage.status === 'ongoing' && '🔴 Ao vivo'}
                {stage.status === 'finished' && '✅ Concluído'}
              </span>
            </div>

            {/* Connector line */}
            {index < stagesData.stages.length - 1 && (
              <div className="timeline-connector" />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### 3. Seletor de Stage

Menu dropdown para selecionar stage:

```tsx
function StageSelector({ eventId, onStageChange }: {
  eventId: string;
  onStageChange: (stageId: string) => void;
}) {
  const [stagesData, setStagesData] = useState<StagesResponse | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('');

  useEffect(() => {
    fetch(`/api/events/${eventId}/stages`)
      .then(res => res.json())
      .then(data => {
        setStagesData(data);
        if (data.stages.length > 0) {
          const firstStage = data.stages[0].externalId;
          setSelectedStage(firstStage);
          onStageChange(firstStage);
        }
      });
  }, [eventId]);

  if (!stagesData || !stagesData.hasStages) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stageId = e.target.value;
    setSelectedStage(stageId);
    onStageChange(stageId);
  };

  return (
    <select value={selectedStage} onChange={handleChange} className="stage-selector">
      {stagesData.stages.map(stage => (
        <option key={stage.externalId} value={stage.externalId}>
          {stage.shortName}
          {stage.status === 'ongoing' && ' (Ao vivo)'}
          {stage.dateStart && ` - ${new Date(stage.dateStart).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`}
        </option>
      ))}
    </select>
  );
}
```

### 4. Resumo do Stage

Card com informações de cada stage:

```tsx
function StageCard({ stage }: { stage: StageInfo }) {
  return (
    <div className={`stage-card ${stage.type} ${stage.status}`}>
      {/* Header */}
      <div className="stage-header">
        <h3>{stage.shortName}</h3>
        <span className={`type-badge ${stage.type}`}>
          {stage.type === 'swiss' && '🎯 Swiss'}
          {stage.type === 'bracket' && '🏆 Playoffs'}
        </span>
      </div>

      {/* Info */}
      <div className="stage-info">
        {stage.numberOfTeams && (
          <div className="info-item">
            <span className="label">Times:</span>
            <span className="value">{stage.numberOfTeams}</span>
          </div>
        )}

        {stage.dateStart && (
          <div className="info-item">
            <span className="label">Data:</span>
            <span className="value">
              {new Date(stage.dateStart).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}

        <div className="info-item">
          <span className="label">Status:</span>
          <span className={`value status-${stage.status}`}>
            {stage.status === 'upcoming' && 'Em breve'}
            {stage.status === 'ongoing' && 'Ao vivo'}
            {stage.status === 'finished' && 'Concluído'}
          </span>
        </div>
      </div>

      {/* Action */}
      <Link href={`/events/${stage.externalId}`} className="view-stage-btn">
        Ver {stage.shortName}
      </Link>
    </div>
  );
}

function StagesGrid({ eventId }: { eventId: string }) {
  const [stagesData, setStagesData] = useState<StagesResponse | null>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}/stages`)
      .then(res => res.json())
      .then(data => setStagesData(data));
  }, [eventId]);

  if (!stagesData) return <Loading />;

  return (
    <div className="stages-grid">
      {stagesData.stages.map(stage => (
        <StageCard key={stage.externalId} stage={stage} />
      ))}
    </div>
  );
}
```

## CSS Sugerido

```css
/* Tabs */
.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 24px;
}

.tab {
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
}

.tab:hover {
  color: #000;
  background: #f5f5f5;
}

.tab.active {
  color: #1976d2;
  border-bottom-color: #1976d2;
}

.tab .live-dot {
  margin-left: 8px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Timeline */
.timeline {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.timeline-item {
  position: relative;
  padding-left: 60px;
  padding-bottom: 40px;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #666;
}

.timeline-item.active .timeline-dot {
  background: #1976d2;
  color: white;
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.2);
}

.timeline-item.past .timeline-dot {
  background: #4caf50;
  color: white;
}

.timeline-connector {
  position: absolute;
  left: 19px;
  top: 40px;
  width: 2px;
  height: calc(100% - 40px);
  background: #e0e0e0;
}

.timeline-content h4 {
  margin: 0 0 8px;
  font-size: 18px;
}

.timeline-content .stage-type {
  color: #666;
  margin: 0 0 8px;
  font-size: 14px;
}

.timeline-content .dates {
  color: #999;
  font-size: 14px;
  margin: 0 0 12px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.upcoming {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge.ongoing {
  background: #ffebee;
  color: #d32f2f;
}

.status-badge.finished {
  background: #e8f5e9;
  color: #2e7d32;
}

/* Stage Cards */
.stages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  padding: 20px;
}

.stage-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stage-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stage-card.ongoing {
  border: 2px solid #ff4444;
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
}

.type-badge.swiss {
  background: #e3f2fd;
  color: #1976d2;
}

.type-badge.bracket {
  background: #fff3e0;
  color: #f57c00;
}

.stage-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.info-item .label {
  color: #666;
  font-size: 14px;
}

.info-item .value {
  font-weight: 500;
}

.view-stage-btn {
  display: block;
  width: 100%;
  padding: 12px;
  text-align: center;
  background: #1976d2;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
}

.view-stage-btn:hover {
  background: #1565c0;
}
```

## Detecção Automática de Tipo

O endpoint detecta automaticamente o tipo de cada stage:

- **`swiss`**: Stages com "Stage 1" ou "Stage 2" no nome
- **`bracket`**: Evento principal (Playoffs) ou eventos com "Playoff" no nome
- **`qualifier`**: Eventos com "Qualifier" no nome (filtrados por padrão)
- **`other`**: Outros tipos de sub-eventos

## Notas Importantes

1. **hasStages**: Use para verificar se o evento tem stages antes de mostrar tabs
   ```tsx
   if (!data.hasStages) {
     return <SingleStageView eventId={eventId} />;
   }
   ```

2. **shortName**: Já vem processado para exibição ("Stage 1", "Stage 2", "Playoffs")
   - Não precisa fazer processamento adicional no frontend

3. **Ordem**: Stages vêm ordenados automaticamente:
   - Swiss Stages primeiro (Stage 1, Stage 2, ...)
   - Bracket/Playoffs por último

4. **Qualifiers**: Por padrão, Qualifiers são filtrados
   - Para incluir, seria necessário ajustar o backend

5. **dateStart/dateEnd**: Podem ser `null` para Playoffs que ainda não têm datas definidas

## Exemplo Completo

```tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function MajorEventPage({ eventId }: { eventId: string }) {
  const [stagesData, setStagesData] = useState<StagesResponse | null>(null);
  const [currentStageId, setCurrentStageId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}/stages`)
      .then(res => res.json())
      .then(data => {
        setStagesData(data);
        if (data.stages.length > 0) {
          setCurrentStageId(data.stages[0].externalId);
        }
      });
  }, [eventId]);

  if (!stagesData) return <div>Carregando...</div>;

  // Se não tem stages, é um evento simples
  if (!stagesData.hasStages) {
    return <SingleEventView eventId={eventId} />;
  }

  const currentStage = stagesData.stages.find(s => s.externalId === currentStageId);

  return (
    <div className="major-event-page">
      {/* Header */}
      <header className="event-header">
        <h1>{stagesData.event.name}</h1>
        <EventTimeline eventId={eventId} />
      </header>

      {/* Tabs Navigation */}
      <nav className="stages-tabs">
        {stagesData.stages.map(stage => (
          <button
            key={stage.externalId}
            className={`tab ${currentStageId === stage.externalId ? 'active' : ''}`}
            onClick={() => setCurrentStageId(stage.externalId)}
          >
            <span className="tab-name">{stage.shortName}</span>
            {stage.status === 'ongoing' && <span className="live-indicator">🔴</span>}
            {stage.dateStart && (
              <span className="tab-date">
                {new Date(stage.dateStart).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Stage Content */}
      <main className="stage-content">
        {currentStage && (
          <>
            {currentStage.type === 'swiss' ? (
              <SwissSystemView eventId={currentStage.externalId} />
            ) : currentStage.type === 'bracket' ? (
              <BracketView eventId={currentStage.externalId} />
            ) : (
              <GenericEventView eventId={currentStage.externalId} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
```

---

## Suporte

Se encontrar problemas:
- Verifique se o `eventId` corresponde a um Major (ex: 8042)
- Para eventos simples (sem stages), `hasStages` retorna `false`
- O endpoint retorna 404 se o evento não existir
- Confira logs do servidor para erros 500
