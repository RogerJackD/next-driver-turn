// Diccionario de Estado de Usuario
// 0 : Eliminado
// 1 : Nuevo
// 2 : Activo
// 3 : Bloqueado
export enum UserStatus {
  DELETED = 0,
  NEW = 1,
  ACTIVE = 2,
  BLOCKED = 3,
}

// Diccionario de Roles
// 0 : Conductor
// 1 : Administrador
export enum UserRole {
  DRIVER = 0,
  ADMIN = 1,
}

// Diccionario de Estado de Asignación Vehículo-Conductor
// 0 : Inactivo
// 1 : Activo
export enum VehicleDriverStatus {
  INACTIVE = 0,
  ACTIVE = 1,
}

// Diccionario de Estado de Vehículo
// 0 : Inactivo
// 1 : Activo
export enum VehicleStatus {
  INACTIVE = 0,
  ACTIVE = 1,
}

// Diccionario de Estado de Zona/Paradero
// 0 : Eliminado
// 1 : Activo
// 2 : Inactivo
export enum VehicleStopStatus {
  DELETED = 0,
  ACTIVE = 1,
  INACTIVE = 2,
}
