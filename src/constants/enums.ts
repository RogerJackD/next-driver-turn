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
