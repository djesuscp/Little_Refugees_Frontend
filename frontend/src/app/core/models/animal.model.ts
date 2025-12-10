export interface AnimalPhoto {
  url: string;
}

export interface AnimalShelterInfo {
  name: string;
  email: string;
  address: string;
  phone?: string | null;
  description?: string | null;
}

export interface AnimalPublic {
  id: number;
  name: string;
  species: string;
  breed: string;
  gender: string;
  age: number | null;
  description?: string | null;
  photos: AnimalPhoto[];
  shelter: AnimalShelterInfo;
}

// 👇 NUEVO: modelo para la vista de detalle
export interface AnimalDetail extends AnimalPublic {
  adopted: boolean;
}
