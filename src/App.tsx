import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import { api, ApiError } from './api'

export enum EspeciePet {
  CACHORRO = 'cachorro',
  GATO = 'gato',
  PEIXE = 'peixe',
  PASSARO = 'passaro',
  ROEDOR = 'roedor',
  REPTIL = 'reptil',
}

const especiesPetOptions = Object.values(EspeciePet).map((valor) => ({
  value: valor,
  label: valor.charAt(0).toUpperCase() + valor.slice(1),
}))

const serviceDurationOptions = Array.from({ length: 18 }, (_, index) => {
  const minutes = (index + 1) * 10
  const value = `${minutes}MIN`
  const label = minutes >= 60
    ? minutes === 180
      ? '3HRS'
      : `${Math.floor(minutes / 60)}H${minutes % 60 ? `${minutes % 60}M` : ''}`
    : `${minutes}MIN`

  return { value, label }
})

type Item = Record<string, unknown>
type IconName =
  | 'grid' | 'users' | 'paw' | 'calendar' | 'syringe' | 'shield' | 'stethoscope'
  | 'user' | 'settings' | 'search' | 'bell' | 'help' | 'plus' | 'chevron'
  | 'more' | 'arrow' | 'refresh' | 'menu' | 'close' | 'trash' | 'edit' | 'eye'

const paths: Record<IconName, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  paw: <><circle cx="6.5" cy="8" r="2.5" /><circle cx="17.5" cy="8" r="2.5" /><circle cx="12" cy="5" r="2.5" /><path d="M7 17.2c0-3 2.2-5.2 5-5.2s5 2.2 5 5.2c0 2.4-2 3.8-5 3.8s-5-1.4-5-3.8Z" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
  syringe: <><path d="m18 2 4 4M17 7l3-3M15 5l4 4-8.5 8.5-4-4L15 5ZM6.5 13.5 3 17l4 4 3.5-3.5M2 22l3-3" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
  stethoscope: <><path d="M6 3v6a6 6 0 0 0 12 0V3M4 3h4M16 3h4" /><path d="M18 9v5a4 4 0 0 0 4 4" /><circle cx="22" cy="18" r="1" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.09A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.09 14H3v-4h.09A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63 1.7 1.7 0 0 0 10 3.09V3h4v.09A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9 1.7 1.7 0 0 0 20.91 10H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.7 9a2.5 2.5 0 1 1 3.8 2.1c-1 .6-1.5 1.1-1.5 2.4M12 17h.01" /></>,
  plus: <path d="M12 5v14M5 12h14" />, chevron: <path d="m9 18 6-6-6-6" />,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  arrow: <path d="m19 12-7 7-7-7M12 19V5" />, refresh: <><path d="M20 11a8 8 0 1 0 1 4" /><path d="M20 4v7h-7" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />, close: <path d="m6 6 12 12M18 6 6 18" />,
  trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const modules = [
  { id: 'dashboard', label: 'Visão geral', icon: 'grid' as IconName, path: '/' },
  { id: 'tutores', label: 'Tutores', icon: 'users' as IconName, path: '/tutores' },
  { id: 'pets', label: 'Pets', icon: 'paw' as IconName, path: '/pets' },
  { id: 'agendamentos', label: 'Agendamentos', icon: 'calendar' as IconName, path: '/agendamentos' },
  { id: 'vacinas', label: 'Vacinas', icon: 'shield' as IconName, path: '/vacinas' },
  { id: 'pet-vacina', label: 'Aplicações de vacinas', icon: 'syringe' as IconName, path: '/pet-vacina' },
  { id: 'services', label: 'Serviços', icon: 'stethoscope' as IconName, path: '/services' },
  { id: 'usuarios', label: 'Usuários', icon: 'user' as IconName, path: '/usuarios' },
  { id: 'admin', label: 'Administradores', icon: 'shield' as IconName, path: '/admin' },
  { id: 'configuracoes', label: 'Configurações', icon: 'settings' as IconName, path: '/configuracoes' },
]

const configs: Record<string, { description: string; singular: string; columns: [string, string][]; fields: [string, string, string][] }> = {
  tutores: { description: 'Gerencie os responsáveis pelos pets da clínica', singular: 'tutor', columns: [['id', 'ID'], ['nome', 'Nome'], ['email', 'E-mail'], ['telefone', 'Telefone'], ['pets', 'Pets']], fields: [['nome', 'Nome', 'text'], ['email', 'E-mail', 'email'], ['telefone', 'Telefone', 'tel']] },
  pets: { description: 'Cadastre e acompanhe os animais atendidos pela clínica', singular: 'pet', columns: [['id', 'ID'], ['nome', 'Nome'], ['especie', 'Espécie'], ['raca', 'Raça'], ['tutor', 'Tutor responsável']], fields: [['nome', 'Nome do pet', 'text'], ['especie', 'Espécie', 'select'], ['raca', 'Raça', 'text'], ['id_tutor', 'Tutor responsável', 'number']] },
  agendamentos: { description: 'Organize os atendimentos e a agenda da clínica', singular: 'agendamento', columns: [['id', 'ID'], ['data_hora', 'Data'], ['pet', 'Pet'], ['servico', 'Serviço'], ['status', 'Status']], fields: [['id_pet', 'Pet', 'number'], ['id_servico', 'Serviço', 'number'], ['data_hora', 'Data', 'date'], ['status', 'Status', 'text']] },
  vacinas: { description: 'Gerencie o catálogo de vacinas da clínica', singular: 'vacina', columns: [['id', 'ID'], ['nome', 'Nome da vacina'], ['descricao', 'Descrição']], fields: [['nome', 'Nome da vacina', 'text'], ['descricao', 'Descrição', 'text']] },
  'pet-vacina': { description: 'Acompanhe o histórico de vacinação dos pets', singular: 'aplicação', columns: [['id', 'ID'], ['pet', 'Pet'], ['vacina', 'Vacina'], ['data_aplicacao', 'Aplicação'], ['data_proxima_dose', 'Próxima dose']], fields: [['id_pet', 'Pet', 'number'], ['id_vacina', 'Vacina', 'number'], ['data_aplicacao', 'Data da aplicação', 'date'], ['data_proxima_dose', 'Próxima dose', 'date']] },
  services: { description: 'Gerencie os procedimentos oferecidos pela clínica', singular: 'serviço', columns: [['id', 'ID'], ['servico', 'Nome do serviço'], ['duracao_min', 'Duração'], ['valor', 'Valor']], fields: [['servico', 'Nome do serviço', 'text'], ['duracao_min', 'Duração', 'select'], ['valor', 'Valor', 'text']] },
  usuarios: { description: 'Gerencie os usuários cadastrados no sistema', singular: 'usuário', columns: [['id', 'ID'], ['nome', 'Nome'], ['email', 'E-mail'], ['role', 'Papel'], ['ativo', 'Situação']], fields: [['nome', 'Nome', 'text'], ['email', 'E-mail', 'email'], ['senha', 'Senha', 'password'], ['role', 'Papel', 'text']] },
  admin: { description: 'Gerencie os administradores da plataforma', singular: 'administrador', columns: [['id', 'ID'], ['nome', 'Nome'], ['email', 'E-mail']], fields: [['nome', 'Nome', 'text'], ['email', 'E-mail', 'email'], ['senha', 'Senha', 'password']] },
}

const display = (value: unknown) => {
  if (value == null || value === '') return '—'
  if (typeof value === 'object') return String((value as Item).nome ?? 'Relacionado')
  if (typeof value === 'boolean') return value ? 'Ativo' : 'Inativo'
  return String(value)
}

const formatServiceDuration = (value: unknown) => {
  if (value == null || value === '') return '—'
  const minutes = Number(value)
  if (Number.isNaN(minutes)) return String(value)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) return `${hours}h`
  return `${hours}h ${remainingMinutes}min`
}

function Button({ children, variant = 'primary', icon, onClick, type = 'button' }: { children: ReactNode; variant?: string; icon?: IconName; onClick?: () => void; type?: 'button' | 'submit' }) {
  return <button className={`btn ${variant}`} onClick={onClick} type={type}>{icon && <Icon name={icon} size={18} />}<span>{children}</span></button>
}

function App() {
  const [path, setPath] = useState(location.pathname)
  const [mobileOpen, setMobileOpen] = useState(false)
  const active = modules.find(m => m.path === path) ?? modules[0]
  const navigate = (next: string) => { history.pushState({}, '', next); setPath(next); setMobileOpen(false) }
  useEffect(() => { const pop = () => setPath(location.pathname); addEventListener('popstate', pop); return () => removeEventListener('popstate', pop) }, [])

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Icon name="paw" size={23} /></div><div><strong>CliniPet</strong><span>Gestão veterinária</span></div><button className="mobile-close" onClick={() => setMobileOpen(false)}><Icon name="close" /></button></div>
      <nav><span className="nav-label">MENU PRINCIPAL</span>{modules.slice(0, 9).map(m => <button key={m.id} onClick={() => navigate(m.path)} className={active.id === m.id ? 'active' : ''}><Icon name={m.icon} /><span>{m.label}</span>{active.id === m.id && <i />}</button>)}
        <span className="nav-label lower">SISTEMA</span>{modules.slice(9).map(m => <button key={m.id} onClick={() => navigate(m.path)} className={active.id === m.id ? 'active' : ''}><Icon name={m.icon} /><span>{m.label}</span></button>)}
      </nav>
      <div className="profile"><div className="avatar">MS</div><div><strong>Marina Silva</strong><span>Gestora da clínica</span></div><Icon name="more" /></div>
    </aside>
    {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} />}
    <main>
      <header className="topbar">
        <button className="menu-toggle" onClick={() => setMobileOpen(true)}><Icon name="menu" /></button>
        <div className="crumb"><span>CliniPet</span><Icon name="chevron" size={15} /><strong>{active.label}</strong></div>
        <div className="top-actions"><label className="global-search"><Icon name="search" size={18} /><input placeholder="Buscar no CliniPet..." /><kbd>⌘ K</kbd></label><button className="icon-btn"><Icon name="help" /></button><button className="icon-btn notification"><Icon name="bell" /><i /></button><div className="top-avatar">MS</div></div>
      </header>
      <div className="content">{active.id === 'dashboard' ? <Dashboard navigate={navigate} /> : active.id === 'configuracoes' ? <Settings /> : configs[active.id] ? <ResourcePage id={active.id} label={active.label} /> : <NotFound navigate={navigate} />}</div>
    </main>
  </div>
}

function Dashboard({ navigate }: { navigate: (path: string) => void }) {
  const [counts, setCounts] = useState<Record<string, number>>({ tutores: 0, pets: 0, agendamentos: 0, vacinas: 0 })
  const [offline, setOffline] = useState(false)
  useEffect(() => { Promise.all(['tutores', 'pets', 'agendamentos', 'vacinas'].map(async key => [key, (await api.list(key)).length] as const)).then(rows => setCounts(Object.fromEntries(rows))).catch(() => setOffline(true)) }, [])
  const date = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date())
  const stats = [['tutores', 'Tutores cadastrados', 'users'], ['pets', 'Pets cadastrados', 'paw'], ['agendamentos', 'Agendamentos', 'calendar'], ['vacinas', 'Vacinas no catálogo', 'shield']] as const
  return <>
    <section className="page-heading"><div><span className="eyebrow">PAINEL DA CLÍNICA</span><h1>Olá, Marina</h1><p>Confira o que está acontecendo hoje na sua clínica.</p></div><div className="heading-actions"><Button variant="secondary" icon="paw" onClick={() => navigate('/pets')}>Cadastrar pet</Button><Button icon="plus" onClick={() => navigate('/agendamentos')}>Novo agendamento</Button></div></section>
    <div className="date-row"><Icon name="calendar" size={17} /><span>{date.charAt(0).toUpperCase() + date.slice(1)}</span></div>
    {offline && <div className="connection"><div><Icon name="refresh" /><span><strong>Backend indisponível</strong> Não foi possível carregar os dados em localhost:3000.</span></div><button onClick={() => location.reload()}>Tentar novamente</button></div>}
    <section className="stats">{stats.map(([key, label, icon], i) => <article className="stat-card" key={key}><div className={`stat-icon tint-${i}`}><Icon name={icon} /></div><div><span>{label}</span><strong>{counts[key]}</strong><small>Dados da API</small></div></article>)}</section>
    <section className="dashboard-grid">
      <article className="panel appointments"><PanelHead title="Próximos atendimentos" subtitle="Agenda da clínica" action="Ver agenda" onClick={() => navigate('/agendamentos')} /><Empty icon="calendar" title="Nenhum atendimento encontrado" text="Os próximos agendamentos aparecerão aqui." action="Criar agendamento" onClick={() => navigate('/agendamentos')} /></article>
      <article className="panel quick"><PanelHead title="Ações rápidas" subtitle="Acesse as tarefas mais usadas" /><div className="quick-grid">{[
        ['Novo tutor', 'users', '/tutores'], ['Cadastrar pet', 'paw', '/pets'], ['Nova vacina', 'shield', '/vacinas'], ['Novo serviço', 'stethoscope', '/services']
      ].map(([label, icon, to]) => <button key={label} onClick={() => navigate(to)}><span><Icon name={icon as IconName} /></span>{label}<Icon name="chevron" size={16} /></button>)}</div></article>
      <article className="panel recent"><PanelHead title="Pets recentes" subtitle="Últimos animais cadastrados" action="Ver todos" onClick={() => navigate('/pets')} /><Empty icon="paw" title="Nenhum pet cadastrado" text="Cadastre o primeiro pet para começar." action="Cadastrar pet" onClick={() => navigate('/pets')} /></article>
      <article className="panel vaccines"><PanelHead title="Próximas doses" subtitle="Acompanhamento de vacinação" action="Ver histórico" onClick={() => navigate('/pet-vacina')} /><Empty icon="syringe" title="Nenhuma dose programada" text="As próximas doses serão exibidas nesta área." /></article>
    </section>
  </>
}

function PanelHead({ title, subtitle, action, onClick }: { title: string; subtitle: string; action?: string; onClick?: () => void }) {
  return <div className="panel-head"><div><h2>{title}</h2><p>{subtitle}</p></div>{action && <button onClick={onClick}>{action}<Icon name="chevron" size={15} /></button>}</div>
}

function Empty({ icon, title, text, action, onClick }: { icon: IconName; title: string; text: string; action?: string; onClick?: () => void }) {
  return <div className="empty"><span><Icon name={icon} /></span><strong>{title}</strong><p>{text}</p>{action && <Button variant="ghost" icon="plus" onClick={onClick}>{action}</Button>}</div>
}

function ResourcePage({ id, label }: { id: string; label: string }) {
  const config = configs[id]
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Item | null>(null)
  const [toast, setToast] = useState('')
  const load = () => { setLoading(true); setError(''); api.list(id).then(setItems).catch((e: ApiError) => setError(e.message)).finally(() => setLoading(false)) }
  useEffect(load, [id])
  const visible = useMemo(() => items.filter(item => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [items, query])
  const remove = async (item: Item) => { if (!confirm(`Excluir ${display(item.nome ?? item.id)}? Registros relacionados podem ser removidos em cascata.`)) return; try { await api.remove(id, Number(item.id)); setToast('Registro excluído com sucesso.'); load() } catch (e) { setToast((e as Error).message) } }
  const closeModal = () => { setModal(false); setEditing(null) }
  return <>
    <section className="page-heading compact"><div><span className="eyebrow">CADASTROS</span><h1>{label}</h1><p>{config.description}</p></div><Button icon="plus" onClick={() => { setEditing(null); setModal(true) }}>Novo {config.singular}</Button></section>
    <article className="table-panel">
      <div className="table-tools"><label className="table-search"><Icon name="search" size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={`Pesquisar ${label.toLowerCase()}...`} /></label><div><button className="filter-btn" onClick={load}><Icon name="refresh" size={17} />Atualizar</button></div></div>
      {loading ? <div className="skeleton-wrap">{[1, 2, 3, 4].map(i => <div className="skeleton" key={i} />)}</div> : error ? <div className="error-state"><span><Icon name="refresh" /></span><h3>Não foi possível carregar os dados</h3><p>{error}</p><Button variant="secondary" onClick={load}>Tentar novamente</Button></div> : visible.length === 0 ? <Empty icon={id === 'pets' ? 'paw' : 'grid'} title={query ? 'Nenhum resultado encontrado' : `Nenhum ${config.singular} cadastrado`} text={query ? 'Tente ajustar os termos da pesquisa.' : 'Comece adicionando o primeiro registro.'} action={!query ? `Novo ${config.singular}` : undefined} onClick={() => setModal(true)} /> :
        <div className="table-scroll"><table><thead><tr>{config.columns.map(([, title]) => <th key={title}>{title}<Icon name="arrow" size={12} /></th>)}<th>Ações</th></tr></thead><tbody>{visible.map((item, i) => <tr key={String(item.id ?? i)}>{config.columns.map(([key]) => <td key={key}>{key === 'servico' ? display(item[key]) : key === 'duracao_min' ? formatServiceDuration(item[key]) : key === 'status' || key === 'ativo' ? <span className="badge">{display(item[key])}</span> : display(item[key])}</td>)}<td><div className="row-actions"><button title="Visualizar"><Icon name="eye" size={17} /></button><button title="Editar" onClick={() => { setEditing(item); setModal(true) }}><Icon name="edit" size={17} /></button><button title="Excluir" onClick={() => remove(item)}><Icon name="trash" size={17} /></button></div></td></tr>)}</tbody></table></div>}
      <div className="pagination"><span>Exibindo {visible.length} de {items.length} registros</span><div><button disabled>Anterior</button><button className="current">1</button><button disabled>Próxima</button></div></div>
    </article>
    {modal && <CreateModal resource={id} config={config} item={editing} close={closeModal} done={() => { setModal(false); setToast(editing ? 'Registro atualizado com sucesso.' : 'Registro cadastrado com sucesso.'); setEditing(null); load() }} />}
    {toast && <div className="toast"><Icon name="shield" /><span>{toast}</span><button onClick={() => setToast('')}><Icon name="close" size={16} /></button></div>}
  </>
}

function CreateModal({ resource, config, item, close, done }: { resource: string; config: typeof configs[string]; item: Item | null; close: () => void; done: () => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [tutores, setTutores] = useState<Item[]>([])
  const [showCreateTutor, setShowCreateTutor] = useState(false)
  const [newTutor, setNewTutor] = useState({ nome: '', email: '', telefone: '' })

  useEffect(() => {
    if (resource !== 'pets') return
    api.list('tutores').then(setTutores).catch(() => setTutores([]))
  }, [resource])

  const formatDurationForApi = (value: FormDataEntryValue | null) => {
    if (!value) return undefined
    const text = String(value).trim().toUpperCase()
    if (!text) return undefined
    if (text.endsWith('MIN')) return Number(text.replace('MIN', ''))
    if (text.endsWith('HRS')) return Number(text.replace('HRS', '')) * 60
    if (text.includes('H')) {
      const hours = Number(text.split('H')[0])
      const minutesPart = text.includes('M') ? text.split('H')[1].replace('M', '') : '0'
      return hours * 60 + Number(minutesPart)
    }
    return Number(text)
  }

  const submitNewTutor = async () => {
    if (!newTutor.nome.trim()) {
      setError('Informe o nome do tutor antes de salvar.')
      return
    }

    try {
      const created = await api.create('tutores', {
        nome: newTutor.nome.trim(),
        email: newTutor.email.trim() || undefined,
        telefone: newTutor.telefone.trim() || undefined,
      }) as Item

      const nextTutors = [...tutores, created]
      setTutores(nextTutors)
      setShowCreateTutor(false)
      setNewTutor({ nome: '', email: '', telefone: '' })
      setError('')
      const select = document.querySelector<HTMLSelectElement>('select[name="id_tutor"]')
      if (select) {
        select.value = String(created.id ?? '')
      }
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const formData = new FormData(event.currentTarget)
    const data: Item = Object.fromEntries(formData)
    config.fields.filter(f => f[2] === 'number').forEach(([key]) => { data[key] = Number(data[key]) })
    config.fields.filter(f => f[2] === 'password').forEach(([key]) => { if (!data[key]) delete data[key] })

    if (resource === 'services') {
      const durationValue = formData.get('duracao_min')
      const parsedDuration = formatDurationForApi(durationValue)
      if (parsedDuration == null) {
        setError('Selecione uma duração válida para o serviço.')
        setSaving(false)
        return
      }

      data.duracao_min = String(parsedDuration)
      data.duracao = String(parsedDuration)
      data.servico = String(data.servico ?? '').trim()
      if (!data.servico) {
        setError('Informe o nome do serviço.')
        setSaving(false)
        return
      }
    }

    try {
      if (item) await api.update(resource, Number(item.id), data)
      else await api.create(resource, data)
      done()
    } catch (e) {
      setError((e as Error).message)
      setSaving(false)
    }
  }

  const heading = item ? `Editar ${config.singular}` : `Novo ${config.singular}`

  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}><section className="modal"><div className="modal-head"><div><span className="modal-icon"><Icon name={item ? 'edit' : 'plus'} /></span><div><h2>{heading}</h2><p>{item ? 'Atualize os dados abaixo.' : 'Preencha os dados abaixo para cadastrar.'}</p></div></div><button onClick={close}><Icon name="close" /></button></div><form onSubmit={submit}><div className="form-grid">{config.fields.map(([name, label, type]) => {
    if (name === 'id_tutor' && resource === 'pets') {
      const tutorOptions = tutores.length > 0 ? tutores.map((tutor: Item) => ({ value: String(tutor.id ?? ''), label: String(tutor.nome ?? 'Tutor') })) : []
      return <label key={name} className="full-width"><span>{label}</span><div className="select-combo"><select name={name} required defaultValue={item?.[name] ? String(item[name]) : ''}>
        {!item && <option value="">Selecione um tutor</option>}
        {tutorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        <option value="__new_tutor__">+ Cadastrar novo tutor</option>
      </select><button type="button" className="mini-action" onClick={() => setShowCreateTutor((current) => !current)}>{showCreateTutor ? 'Fechar' : 'Novo tutor'}</button></div>{showCreateTutor && <div className="inline-form"><div className="inline-inputs"><input type="text" value={newTutor.nome} onChange={event => setNewTutor(current => ({ ...current, nome: event.target.value }))} placeholder="Nome do tutor" /><input type="email" value={newTutor.email} onChange={event => setNewTutor(current => ({ ...current, email: event.target.value }))} placeholder="E-mail" /><input type="tel" value={newTutor.telefone} onChange={event => setNewTutor(current => ({ ...current, telefone: event.target.value }))} placeholder="Telefone" /></div><button type="button" className="mini-save" onClick={submitNewTutor}>Salvar tutor</button></div>}<small>Campo conforme contrato de integração</small></label>
    }

    if (type === 'select' || name === 'duracao') {
      const options = getSelectOptions(name)
      return <label key={name}><span>{label}</span><select name={name} required defaultValue={item?.[name] ? String(item[name]) : ''}>
        {!item && <option value="">Selecione uma opção</option>}
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select><small>Campo conforme contrato de integração</small></label>
    }

    return <label key={name}><span>{label}</span><input name={name} type={type} required={!item || type !== 'password'} defaultValue={item && type !== 'password' ? display(item[name]) === '—' ? '' : String(item[name]) : ''} placeholder={`Informe ${label.toLowerCase()}`} /><small>Campo conforme contrato de integração</small></label>
  })}</div>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><Button variant="secondary" onClick={close}>Cancelar</Button><Button type="submit" icon={saving ? 'refresh' : item ? 'edit' : 'plus'}>{saving ? 'Salvando...' : item ? 'Salvar alterações' : 'Cadastrar'}</Button></div></form></section></div>
}

function Settings() {
  return <><section className="page-heading compact"><div><span className="eyebrow">SISTEMA</span><h1>Configurações</h1><p>Preferências gerais e conexão com a API.</p></div></section><article className="settings-card"><div className="setting-icon"><Icon name="settings" /></div><div><h2>Integração com o backend</h2><p>A aplicação utiliza a variável <code>VITE_API_URL</code> para se conectar à API NestJS.</p><label><span>URL-base atual</span><input value={import.meta.env.VITE_API_URL || 'http://localhost:3000'} readOnly /></label><small>As rotas são consumidas diretamente, sem os prefixos /api ou /v1.</small></div><span className="badge warning">Configuração local</span></article></>
}

function NotFound({ navigate }: { navigate: (path: string) => void }) {
  return <div className="not-found"><span>404</span><h1>Página não encontrada</h1><p>O endereço acessado não existe no CliniPet.</p><Button onClick={() => navigate('/')}>Voltar à visão geral</Button></div>
}

const getSelectOptions = (name: string) => {
  if (name === 'duracao_min') return serviceDurationOptions
  if (name === 'especie') return especiesPetOptions
  return []
}

export default App
