const ROLES = {
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

const HTX_ROLES = [
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_TECHNICAL,
  ROLES.HTX_DISTRIBUTION,
  ROLES.HTX_ACCOUNTANT,
  ROLES.HTX_SUPERVISOR,
];

const normalizeRole = (role) => {
  const normalized = String(role || '').trim().toUpperCase();
  return LEGACY_ROLE_MAP[normalized] || normalized;
};

const isAdminRole = (role) => normalizeRole(role) === ROLES.ADMIN;
const isFarmerRole = (role) => normalizeRole(role) === ROLES.FARMER;
const isHtxRole = (role) => HTX_ROLES.includes(normalizeRole(role));

const canManageHtxJournals = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_TECHNICAL,
].includes(normalizeRole(role));

const canViewHtxJournals = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_TECHNICAL,
  ROLES.HTX_SUPERVISOR,
].includes(normalizeRole(role));

const canManageDistribution = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
].includes(normalizeRole(role));

const canManageSupplies = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
].includes(normalizeRole(role));

const canViewDistribution = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_TECHNICAL,
  ROLES.HTX_SUPERVISOR,
].includes(normalizeRole(role));

const canManageInventory = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_DISTRIBUTION,
].includes(normalizeRole(role));

const canViewInventory = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_DISTRIBUTION,
  ROLES.HTX_SUPERVISOR,
  ROLES.HTX_TECHNICAL,
  ROLES.FARMER,
].includes(normalizeRole(role));

const canManageFinance = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_ACCOUNTANT,
].includes(normalizeRole(role));

const canManageDistributionFinance = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_DISTRIBUTION,
  ROLES.HTX_ACCOUNTANT,
].includes(normalizeRole(role));

const canManageHtxMembers = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_TECHNICAL,
].includes(normalizeRole(role));

const canViewHtxMembers = (role) => [
  ROLES.ADMIN,
  ROLES.HTX_DIRECTOR,
  ROLES.HTX_TECHNICAL,
  ROLES.HTX_DISTRIBUTION,
  ROLES.HTX_ACCOUNTANT,
  ROLES.HTX_SUPERVISOR,
].includes(normalizeRole(role));

const getHtxOwnerId = (user) => {
  if (!user) return null;
  const role = normalizeRole(user.role);
  if (role === ROLES.ADMIN) return user._id;
  if (role === ROLES.HTX_DIRECTOR) return user._id;
  if (isHtxRole(role)) return user.htxId || user._id;
  return user.htxId || user._id;
};

const htxDirectorRoleQuery = {
  $in: ['HTX_DIRECTOR', 'HTX', 'Htx'],
};

module.exports = {
  ROLES,
  HTX_ROLES,
  normalizeRole,
  isAdminRole,
  isFarmerRole,
  isHtxRole,
  canManageHtxJournals,
  canViewHtxJournals,
  canManageDistribution,
  canManageSupplies,
  canViewDistribution,
  canManageInventory,
  canViewInventory,
  canManageFinance,
  canManageDistributionFinance,
  canManageHtxMembers,
  canViewHtxMembers,
  getHtxOwnerId,
  htxDirectorRoleQuery,
};
