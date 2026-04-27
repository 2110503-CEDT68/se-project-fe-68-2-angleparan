export interface DentistItem {
  _id: string;
  name: string;
  experience: number;
  expertise: string;
  workingHours?: {
    start: number; // เช่น 9
    end: number;   // เช่น 17
  };

  __v?: number;
  id?: string;

  // virtual field (optional เพราะ backend populate)
  appointments?: AppointmentItem[];
}

  
export interface DentistJson {
  success: boolean;
  count: number;
  pagination: Object;
  data: DentistItem[];
}

export interface UserItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  dentistProfile?: DentistItem;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface AppointmentItem {
  _id: string;
  apptDate: string; // Date จาก backend -> string (ISO)
  user: string | UserItem;     // ObjectId (user id)
  dentist: string | DentistItem;  // ObjectId (dentist id)
  status: AppointmentStatus;
  createdAt?: string;
}

export interface AppointmentJson {
  success: boolean
  count: number
  pagination?: any
  data: AppointmentItem[]
}

export interface RatingItem {
  _id: string;
  rating: number;       // 1–5
  comment?: string;
  dentist: string;
  user: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface RatingJson {
  success: boolean;
  count: number;
  data: RatingItem[];
}

// summary ที่ดึงจาก /api/v1/ratings/summary
// key = dentistId, value = { avg, count }
export type RatingSummaryMap = Record<string, { avg: number; count: number }>;

export interface RatingSummaryJson {
  success: boolean;
  data: RatingSummaryMap;
}

export interface RecordItem {
  _id: string;
  treatmentDetails?: string; 
  cancelReason?: string;     
  notes?: string;            
  status: AppointmentStatus; 
  apptDate: string;
  user?: UserItem; 
  dentist?: DentistItem;
  createdAt: string;
  updatedAt?: string;
}

export interface RecordJson {
  success: boolean;
  count: number;
  pagination?: any;
  data: RecordItem[];
}
