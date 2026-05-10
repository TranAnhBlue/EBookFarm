// Storage key constants
const STORAGE = {
  TOKEN: 'token',
  USER_INFO: 'user',
  REMEMBER_LOGIN: 'ebookfarm-remember',
}

export const getStorage = (name) => localStorage.getItem(name)
export const setStorage = (name, value) => localStorage.setItem(name, value)
export const deleteStorage = (name) => localStorage.removeItem(name)
export const clearAuthStorage = () => {
  deleteStorage(STORAGE.TOKEN)
  deleteStorage(STORAGE.USER_INFO)
}

export default STORAGE
