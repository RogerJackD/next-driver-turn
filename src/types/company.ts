// ==================== COMPANY TYPES ====================

export interface Company {
  id: number;
  name: string;
  taxId: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// ==================== COMPANY DTOs ====================

export interface CreateCompanyDto {
  name: string;
  taxId: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateCompanyDto {
  name?: string;
  taxId?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: 'active' | 'inactive';
}

// ==================== TYPE HELPERS ====================

export type CompanyStatus = 'active' | 'inactive';