const { execSync } = require('child_process');
const fs = require('fs');

const map = [
  { old: 'frontend/src/components/AIChatWidget.jsx', new: 'src/components/AIChatWidget/index.jsx' },
  { old: 'frontend/src/components/ExcelImport.jsx', new: 'src/components/ExcelImport/index.jsx' },
  { old: 'frontend/src/components/JournalAIAssistant.jsx', new: 'src/components/JournalAIAssistant/index.jsx' },
  { old: 'frontend/src/components/PublicFooter.jsx', new: 'src/components/Layout/Footer/index.jsx' },
  { old: 'frontend/src/components/PublicNavbar.jsx', new: 'src/components/Layout/Header/index.jsx' },
  { old: 'frontend/src/components/LocationSelector.jsx', new: 'src/components/LocationSelector/index.jsx' },
  { old: 'frontend/src/components/EditReasonModal.jsx', new: 'src/components/Modal/EditReason/index.jsx' },
  { old: 'frontend/src/components/ForceChangePasswordModal.jsx', new: 'src/components/Modal/ForceChangePassword/index.jsx' },
  { old: 'frontend/src/components/JournalHistoryModal.jsx', new: 'src/components/Modal/JournalHistory/index.jsx' },
  { old: 'frontend/src/components/NotificationBell.jsx', new: 'src/components/NotificationBell/index.jsx' },
  { old: 'frontend/src/components/VoiceInput.jsx', new: 'src/components/VoiceInput/index.jsx' },
  { old: 'frontend/src/pages/Admin/AccountInfo.jsx', new: 'src/pages/USER/AccountInfo/index.jsx' }
];

for (const item of map) {
  try {
    const originalContent = execSync(`git show HEAD:${item.old}`).toString('utf8');
    
    // Apply imports replacements
    let content = originalContent
      .replace(/['"](\.\.\/)+services\/api['"]/g, "'src/services/01_axios'")
      .replace(/['"]\.\/api['"]/g, "'src/services/01_axios'")
      .replace(/['"]\.\.\/\.\.\/services\/01_axios['"]/g, "'src/services/01_axios'")
      .replace(/['"]\.\.\/services\/01_axios['"]/g, "'src/services/01_axios'")
      .replace(/['"](\.\.\/)+services\/locationService['"]/g, "'src/services/LocationService'")
      .replace(/['"](\.\.\/)+services\/notificationService['"]/g, "'src/services/NotificationService'")
      .replace(/['"](\.\.\/)+store\/authStore['"]/g, "'src/services/core/authSession'");

    // Relative to src replacements
    const replacements = [
      { regex: /from\s+['"](?:\.\.\/)+components\/(.*?)['"]/g, to: "from 'src/components/$1'" },
      { regex: /from\s+['"](?:\.\.\/)+utils\/(.*?)['"]/g, to: "from 'src/utils/$1'" },
      { regex: /from\s+['"](?:\.\.\/)+services\/(.*?)['"]/g, to: "from 'src/services/$1'" },
      { regex: /from\s+['"](?:\.\.\/)+assets\/(.*?)['"]/g, to: "from 'src/assets/$1'" },
      { regex: /from\s+['"](?:\.\.\/)+lib\/(.*?)['"]/g, to: "from 'src/lib/$1'" },
      { regex: /from\s+['"](?:\.\.\/)+store\/(.*?)['"]/g, to: "from 'src/store/$1'" },
      { regex: /import\s+(.*?)\s+from\s+['"](?:\.\.\/)+components\/PublicNavbar['"]/g, to: "import $1 from 'src/components/Layout/Header'" },
      { regex: /import\s+(.*?)\s+from\s+['"](?:\.\.\/)+components\/PublicFooter['"]/g, to: "import $1 from 'src/components/Layout/Footer'" }
    ];

    for (const { regex, to } of replacements) {
      content = content.replace(regex, to);
    }
    
    // Special fix for PublicNavbar and PublicFooter
    content = content.replace(/import PublicNavbar from ['"]src\/components\/PublicNavbar['"]/g, 'import PublicNavbar from "src/components/Layout/Header"');
    content = content.replace(/import PublicFooter from ['"]src\/components\/PublicFooter['"]/g, 'import PublicFooter from "src/components/Layout/Footer"');

    // authStore fixes
    if (content.includes('useAuthStore')) {
      content = content.replace(/import\s+\{.*useAuthStore.*\}\s+from\s+['"]([^'"]+)['"]/g, "import authSession from 'src/services/core/authSession'");
      content = content.replace(/const\s+\{\s*user\s*\}\s*=\s*useAuthStore\(\)/g, "const user = authSession.getUser()");
      content = content.replace(/const\s+\{\s*user\s*,\s*token\s*\}\s*=\s*useAuthStore\(\)/g, "const user = authSession.getUser();\n  const token = authSession.getAccessToken()");
      content = content.replace(/const\s+\{\s*token\s*\}\s*=\s*useAuthStore\(\)/g, "const token = authSession.getAccessToken()");
    }
    
    // AIChatWidget index.css fix
    if (item.new.includes('AIChatWidget')) {
      content = content.replace(/AIChatWidget\.css/g, 'index.css');
    }

    fs.writeFileSync(item.new, content, 'utf8');
    console.log(`Restored ${item.new}`);
  } catch (err) {
    console.error(`Failed to restore ${item.new}: ${err.message}`);
  }
}
