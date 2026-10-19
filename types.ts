
  export type AppMode = 'demo' | 'isolated';

  export interface Attachment {
    name: string;
    url: string; // Stored as a data URL
  }

  export enum TaskType {
    MEETING = 'MEETING',
    SETUP = 'SETUP',
    READING = 'READING',
    OPERATIONAL = 'OPERATIONAL',
  }
  export const TASK_TYPE_LABEL: Record<TaskType,string> = {
    MEETING: '🤝 Reunión',
    SETUP: '💻 Configuración',
    READING: '📚 Lectura',
    OPERATIONAL: '✅ Tarea Operativa',
  };

  export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
    completedAt?: string;
  }

  export interface Referent {
    name: string;
    email?: string;
  }

  export interface Task {
    id: string;
    title: string;
    day: number;
    week: number;
    resource?: string;
    referent: Referent;
    type: TaskType;
    completed: boolean;
    attachments?: Attachment[];
    subtasks?: Subtask[];
    completedAt?: string;
    linkedKnowledgeItemIds?: string[];
    isGlobal?: boolean;
    globalTaskId?: string;
    createdInProfileId?: string;
  }

  // Added AdminDocument interface to support Legajo Digital functionality used in EssentialsView
  export interface AdminDocument {
    id: string;
    title: string;
    status: 'pending' | 'uploaded' | 'verified';
    required: boolean;
    uploadedAt?: string;
    verifiedAt?: string;
    fileName?: string;
    fileUrl?: string;
  }

  export interface OnboardingInfo {
    profileId?: string;
    newHireName: string;
    jobTitle: string;
    jobSummary: string;
    teamName: string;
    teamFunctions: string;
    teamMembers: string;
    managerId?: string;
    manager: string;
    managerPosition?: string;
    teamLead: string;
    teamLeadPosition?: string;
    jurisdiction: string;
    onboardingStartDate?: string;
    // Added documentationDeadline to support EssentialsView and OnboardingInfoFormModal
    documentationDeadline?: string;
    deskNumber?: string;
    workEquipment?: string;
    workAddress?: string;
    remoteWorkDay?: string;
  }

  export interface OnboardingProfile {
    id: string;
    info: OnboardingInfo;
    status?: 'active' | 'cancelled' | 'archived' | 'completed';
    tasks: Task[];
    // Updated to use AdminDocument[] for consistency with EssentialsView
    documents: AdminDocument[];
  }

  export type View = 'leader' | 'newHire' | 'admin';
  export type DisplayMode = 'board' | 'calendar' | 'repository' | 'analytics';
  export type KnowledgeCategoryKey = keyof typeof KNOWLEDGE_CATEGORY_LABEL;
  export type KnowledgeCategoryLabel =
    (typeof KNOWLEDGE_CATEGORY_LABEL)[KnowledgeCategoryKey];

  export const KNOWLEDGE_CATEGORY_LABEL = {
    INSTITUTIONAL: '🏛️ Institucional y Cultura',
    TEAM: '👥 Equipo y Roles',
    TOOLS: '⚙️ Herramientas y Procedimientos',
    ROLE_GUIDE: '📘 Guía del Rol',
    MILESTONES: '📅 Hitos y Seguimiento',
    SUPPORT: '💬 Espacio de Apoyo y Preguntas',
  } as const;

  export enum KnowledgeCategory {
    INSTITUTIONAL = 'INSTITUTIONAL',
    TEAM = 'TEAM',
    TOOLS = 'TOOLS',
    ROLE_GUIDE = 'ROLE_GUIDE',
    MILESTONES = 'MILESTONES',
    SUPPORT = 'SUPPORT',
  }

  export interface KnowledgeItem {
      id: string;
      title: string;
      description: string;
      url?: string;
      attachment?: Attachment;
      category: KnowledgeCategoryKey;
      visibleOnDay?: number;
      isGlobal?: boolean;
      profileId?: string;
      teamName?: string;
  }
