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

export interface AppointmentItem {
  _id: string;
  apptDate: string; // Date จาก backend -> string (ISO)
  user: string | UserItem;     // ObjectId (user id)
  dentist: string | DentistItem;  // ObjectId (dentist id)
  createdAt?: string;
}

export interface AppointmentJson {
  success: boolean
  count: number
  pagination?: any
  data: AppointmentItem[]
}