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

export const normalizeRole = (role) => {
  const normalized = String(role || '').trim().toUpperCase();
  return LEGACY_ROLE_MAP[normalized] || normalized;
};

export const isAdmin = (role) => normalizeRole(role) === ROLES.ADMIN;
export const isFarmer = (role) => normalizeRole(role) === ROLES.FARMER;
export const isHtx = (role) => [
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_TECHNICAL,
  ROLES.HTX_DISTRIBUTION,
  ROLES.HTX_ACCOUNTANT,
  ROLES.HTX_SUPERVISOR,
].includes(normalizeRole(role));

export const isHtxDirector = (role) => normalizeRole(role) === ROLES.HTX_DIRECTOR;
export const isHtxTechnical = (role) => normalizeRole(role) === ROLES.HTX_TECHNICAL;
export const isHtxDistribution = (role) => normalizeRole(role) === ROLES.HTX_DISTRIBUTION;
export const isHtxAccountant = (role) => normalizeRole(role) === ROLES.HTX_ACCOUNTANT;
export const isHtxSupervisor = (role) => normalizeRole(role) === ROLES.HTX_SUPERVISOR;

export const roleLabel = (role) => ({
  [ROLES.ADMIN]: 'Quản trị viên',
  [ROLES.HTX_DIRECTOR]: 'Giám đốc HTX',
  [ROLES.HTX_TECHNICAL]: 'Ban kỹ thuật',
  [ROLES.HTX_DISTRIBUTION]: 'Ban phân phối',
  [ROLES.HTX_ACCOUNTANT]: 'Kế toán',
  [ROLES.HTX_SUPERVISOR]: 'Ban kiểm soát',
  [ROLES.FARMER]: 'Thành viên VietGAP',
}[normalizeRole(role)] || role || 'Thành viên');

export const getRoleHomePath = (role) => {
  const normalized = normalizeRole(role);
  // All roles should start at dashboard
  // Role-specific consoles are accessible via sidebar
  return '/dashboard';
};

export const canViewHtxJournals = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_TECHNICAL,
  ROLES.HTX_SUPERVISOR,
].includes(normalizeRole(role));

export const canManageHtxJournals = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_TECHNICAL,
].includes(normalizeRole(role));

export const canManageHtxMembers = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_TECHNICAL,
].includes(normalizeRole(role));

export const canViewHtxMembers = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_TECHNICAL,
  ROLES.HTX_DISTRIBUTION,
  ROLES.HTX_ACCOUNTANT,
  ROLES.HTX_SUPERVISOR,
].includes(normalizeRole(role));

export const canAccessHtxFarmerManagement = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_TECHNICAL,
  ROLES.HTX_SUPERVISOR,
].includes(normalizeRole(role));

export const canManageTraceability = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
].includes(normalizeRole(role));

export const canViewTraceability = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_TECHNICAL,
  ROLES.HTX_SUPERVISOR,
].includes(normalizeRole(role));

export const canManageSupplies = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
].includes(normalizeRole(role));

export const canViewInventory = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_DISTRIBUTION,
  ROLES.HTX_SUPERVISOR,
  ROLES.HTX_TECHNICAL,
  ROLES.FARMER,
].includes(normalizeRole(role));

export const canManageInventory = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_DISTRIBUTION,
].includes(normalizeRole(role));

export const canManageFinance = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_ACCOUNTANT,
].includes(normalizeRole(role));

export const canManageTechnicalOperations = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_TECHNICAL,
].includes(normalizeRole(role));

export const canHandleFarmerSubmissions = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_TECHNICAL,
].includes(normalizeRole(role));

export const canManageDistributionOperations = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_DISTRIBUTION,
].includes(normalizeRole(role));

export const canManageAccountingOperations = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_ACCOUNTANT,
].includes(normalizeRole(role));

export const canManageDistributionFinance = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_DISTRIBUTION,
  ROLES.HTX_ACCOUNTANT,
].includes(normalizeRole(role));

export const canViewHtxReports = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_SUPERVISOR,
].includes(normalizeRole(role));
