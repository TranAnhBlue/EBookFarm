export const ROLES = {
  ADMIN: 'ADMIN',
  HTX_DIRECTOR: 'HTX_DIRECTOR',
  HTX_TECHNICAL: 'HTX_TECHNICAL',
  HTX_DISTRIBUTION: 'HTX_DISTRIBUTION',
  HTX_ACCOUNTANT: 'HTX_ACCOUNTANT',
  HTX_SUPERVISOR: 'HTX_SUPERVISOR',
  FARMER: 'FARMER',
};

const LEGACY_ROLE_MAP = {
  ADMIN: ROLES.ADMIN,
  HTX: ROLES.HTX_DIRECTOR,
  HTX_DIRECTOR: ROLES.HTX_DIRECTOR,
  HTX_TECHNICAL: ROLES.HTX_TECHNICAL,
  HTX_DISTRIBUTION: ROLES.HTX_DISTRIBUTION,
  HTX_ACCOUNTANT: ROLES.HTX_ACCOUNTANT,
  HTX_SUPERVISOR: ROLES.HTX_SUPERVISOR,
  FARMER: ROLES.FARMER,
  USER: ROLES.FARMER,
};

export const normalizeRole = (role) => LEGACY_ROLE_MAP[String(role || '').toUpperCase()] || String(role || '').toUpperCase();

export const isAdmin = (role) => normalizeRole(role) === ROLES.ADMIN;
export const isFarmer = (role) => normalizeRole(role) === ROLES.FARMER;
export const isHtx = (role) => [
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_TECHNICAL,
  ROLES.HTX_DISTRIBUTION,
  ROLES.HTX_ACCOUNTANT,
  ROLES.HTX_SUPERVISOR,
].includes(normalizeRole(role));

export const roleLabel = (role) => ({
  [ROLES.ADMIN]: 'Quản trị viên',
  [ROLES.HTX_DIRECTOR]: 'Giám đốc HTX',
  [ROLES.HTX_TECHNICAL]: 'Ban kỹ thuật',
  [ROLES.HTX_DISTRIBUTION]: 'Ban phân phối',
  [ROLES.HTX_ACCOUNTANT]: 'Kế toán',
  [ROLES.HTX_SUPERVISOR]: 'Ban kiểm soát',
  [ROLES.FARMER]: 'Thành viên VietGAP',
}[normalizeRole(role)] || role || 'Thành viên');
