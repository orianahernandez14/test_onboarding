
import React from 'react';
import {
  ShieldCheck,
  PersonUp,
  Diagram3,
  PencilFill,
  Trash3Fill,
  Link45deg,
  Paperclip,
  People,
  PeopleFill,
  Briefcase,
  GeoAlt,
  Laptop,
  LaptopFill,
  House,
  Building,
  Buildings,
  CalendarEvent,
  Calendar3,
  InfoCircle,
  PcDisplayHorizontal,
  Search,
  Stars,
  Person,
  Envelope,
  JournalText,
  BookFill,
  BarChart,
  BarChartSteps,
  Map,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  GearFill,
  Download,
  Upload,
  ChatDotsFill,
  PlusCircleFill,
  Check2Square,
  Cloud,
  CloudCheck,
  EmojiSmile,
  Lock,
  FileEarmark,
  GripVertical,
} from 'react-bootstrap-icons';

const IconWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
    const dimensions = className.includes('h-') || className.includes('w-') ? '' : 'h-5 w-5';
    return (
        <div className={`${dimensions} ${className} flex items-center justify-center flex-shrink-0`}>{children}</div>
    );
};

const ActionIconWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
    const dimensions = className.includes('h-') || className.includes('w-') ? '' : 'h-4 w-4';
    return (
        <div className={`${dimensions} ${className} flex items-center justify-center flex-shrink-0`}>{children}</div>
    );
};

// --- Icons Definition ---

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Search className="w-full h-full" />
  </ActionIconWrapper>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Stars className="w-full h-full" />
  </ActionIconWrapper>
);

export const CloudIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Cloud className="w-full h-full" />
  </ActionIconWrapper>
);

export const CloudSyncIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <CloudCheck className="w-full h-full" />
  </ActionIconWrapper>
);

export const MeetingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <PeopleFill className="w-full h-full" />
  </ActionIconWrapper>
);

export const SetupIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <LaptopFill className="w-full h-full" />
  </ActionIconWrapper>
);

export const ReadingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <BookFill className="w-full h-full" />
  </ActionIconWrapper>
);

export const OperationalIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <GearFill className="w-full h-full" />
  </ActionIconWrapper>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <PencilFill className="w-full h-full" />
  </ActionIconWrapper>
);

export const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Trash3Fill className="w-full h-full" />
  </ActionIconWrapper>
);

export const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Link45deg className="w-full h-full" />
  </ActionIconWrapper>
);

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Person className="w-full h-full" />
  </ActionIconWrapper>
);

export const GrabberIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <GripVertical className="w-full h-full" />
  </ActionIconWrapper>
);

export const PaperclipIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Paperclip className="w-full h-full" />
  </ActionIconWrapper>
);

export const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <CalendarEvent className="w-full h-full" />
  </ActionIconWrapper>
);

export const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Envelope className="w-full h-full" />
  </ActionIconWrapper>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <PlusCircleFill className="w-full h-full" />
  </ActionIconWrapper>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Download className="w-full h-full" />
  </ActionIconWrapper>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Upload className="w-full h-full" />  
  </ActionIconWrapper>
);

export const BoardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Map className="w-full h-full" />
  </ActionIconWrapper>
);

export const CalendarViewIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Calendar3 className="w-full h-full" />
  </ActionIconWrapper>
);

export const KnowledgeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <JournalText className="w-full h-full" />
  </ActionIconWrapper>
);

export const AnalyticsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <BarChartSteps className="w-full h-full" />
  </ActionIconWrapper>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <ChevronDown className="w-full h-full" />
  </ActionIconWrapper>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <CheckCircle className="w-full h-full" />
  </ActionIconWrapper>
);

export const TeamIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <People className="w-full h-full" />
  </ActionIconWrapper>
);

export const BuildingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Buildings className="w-full h-full" />
  </ActionIconWrapper>
);

export const WelcomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <EmojiSmile className="w-full h-full" />
  </ActionIconWrapper>
);

export const BriefcaseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Briefcase className="w-full h-full" />
  </ActionIconWrapper>
);

export const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <InfoCircle className="w-full h-full" />
  </ActionIconWrapper>
);

export const ManagerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <PersonUp className="w-full h-full" />
  </ActionIconWrapper>
);

export const DeskIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <PcDisplayHorizontal className="w-full h-full" />
  </ActionIconWrapper>
);

export const LaptopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Laptop className="w-full h-full" />
  </ActionIconWrapper>
);

export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <House className="w-full h-full" />
  </ActionIconWrapper>
);

export const TinyLockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Lock className="w-full h-full" />
  </ActionIconWrapper>
);

export const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <ChevronLeft className="w-full h-full" />
  </ActionIconWrapper>
);

export const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <ChevronRight className="w-full h-full" />
  </ActionIconWrapper>
);

export const TinyHomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <House className="w-full h-full" />
  </ActionIconWrapper>
);

export const TinyBuildingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Building className="w-full h-full" />
  </ActionIconWrapper>
);

export const ChatbotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <ChatDotsFill className="w-full h-full" />
  </ActionIconWrapper>
);

export const LeaderChatbotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <ChatDotsFill className="w-full h-full" />
  </ActionIconWrapper>
);

export const NotificationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Envelope className="w-full h-full" />
  </ActionIconWrapper>
);

export const NewHireIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Person className="w-full h-full" />
  </ActionIconWrapper>
);

export const LeaderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <PersonUp className="w-full h-full" />
  </ActionIconWrapper>
);

export const AdminIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <ShieldCheck className="w-full h-full" />
  </ActionIconWrapper>
);

export const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <FileEarmark className="w-full h-full" />
  </ActionIconWrapper>
);

export const ZipIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Download className="w-full h-full" />
  </ActionIconWrapper>
);

export const CheckSquareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Check2Square className="w-full h-full" />
  </ActionIconWrapper>
);

export const JurisdictionIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <Diagram3 className="w-full h-full" />
  </ActionIconWrapper>
);

export const AddressIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <GeoAlt className="w-full h-full" />
  </ActionIconWrapper>
);

export const KnowledgeBookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <ActionIconWrapper className={className}>
    <JournalText className="w-full h-full" />
  </ActionIconWrapper>
);
