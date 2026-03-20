export interface DentistItem {
  _id: string;
  name: string;
  experience: number;
  expertise: string;
  workingHours: {
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


export interface AppointmentItem {
  _id?: string;
  apptDate: string; // Date จาก backend -> string (ISO)
  user: string;     // ObjectId (user id)
  dentist: string;  // ObjectId (dentist id)
  createdAt?: string;
}
