// Modelo para las fotos del animal.
export interface AnimalPhoto {
  url: string;
}

// Modelo para los datos de la protectora a la que pertenece el animal.
export interface AnimalShelterInfo {
  name: string;
  email: string;
  address: string;
  phone?: string | null;
  description?: string | null;
}

// Modelo animal público.
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

// Modelo para la vista de detalle.
export interface AnimalDetail extends AnimalPublic {
  adopted: boolean;
}
