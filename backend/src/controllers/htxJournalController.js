const HtxJournal = require('../models/HtxJournal');
const FarmJournal = require('../models/FarmJournal');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { isAdminRole, isHtxRole, getHtxOwnerId } = require('../utils/roles');

const createHtxJournal = async (req, res) => {
  try {
    const { name, description, schemaId } = req.body;
    if (!isHtxRole(req.user.role) && !isAdminRole(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Báº¡n khÃ´ng cÃ³ quyá»n táº¡o sá»•.' });
    }

    const htxJournal = new HtxJournal({
      name,
      description,
      schemaId,
      htxId: getHtxOwnerId(req.user),
      farmers: []
    });

    const saved = await htxJournal.save();

    // ThÃ´ng bÃ¡o cho toÃ n bá»™ Admin biáº¿t cÃ³ sá»• HTX má»›i Ä‘Æ°á»£c táº¡o
    const admins = await User.find({ role: { $regex: /^admin$/i } });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        sender: req.user._id,
        title: 'Sá»• nháº­t kÃ½ HTX má»›i',
        message: `HTX ${req.user.fullname || req.user.username} vá»«a táº¡o sá»• káº¿ hoáº¡ch má»›i: ${name}`,
        type: 'System',
        relatedId: saved._id,
        relatedModel: 'HtxJournal'
      });
    }

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHtxJournals = async (req, res) => {
  try {
    const filter = isAdminRole(req.user.role) ? {} : { htxId: getHtxOwnerId(req.user) };
    const journals = await HtxJournal.find(filter)
      .populate('schemaId')
      .populate('htxId', 'fullname username')
      .populate('farmers.farmerId', 'fullname username email')
      .populate('farmers.farmJournalId');
    res.json({ success: true, data: journals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addFarmersToJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const { farmerIds } = req.body; // Array of farmer IDs

    const htxJournal = await HtxJournal.findById(id);
    if (!htxJournal) return res.status(404).json({ success: false, message: 'KhÃ´ng tÃ¬m tháº¥y sá»•.' });

    if (htxJournal.htxId.toString() !== String(getHtxOwnerId(req.user)) && !isAdminRole(req.user.role)) {
      return res.status(403).json({ success: false, message: 'KhÃ´ng cÃ³ quyá»n.' });
    }

    const addedFarmers = [];
    for (const farmerId of farmerIds) {
      // Check if farmer already exists
      if (htxJournal.farmers.some(f => f.farmerId.toString() === farmerId.toString())) {
        continue; // Skip if already added
      }

      // Create FarmJournal for the farmer
      const farmJournal = new FarmJournal({
        userId: farmerId,
        schemaId: htxJournal.schemaId,
        htxJournalId: htxJournal._id,
        entries: {},
        status: 'Draft'
      });
      await farmJournal.save();

      htxJournal.farmers.push({
        farmerId,
        farmJournalId: farmJournal._id,
        status: 'ChÆ°a nháº­p'
      });
      addedFarmers.push(farmerId);

      // Create notification for farmer
      const categoryLabels = {
        'trongtrot': 'VietGAP Trá»“ng trá»t',
        'channuoi': 'VietGAHP ChÄƒn nuÃ´i',
        'thuysan': 'VietGAP Thá»§y sáº£n',
        'huuco': 'Há»¯u cÆ¡',
        'huuco_caytrong': 'Há»¯u cÆ¡ CÃ¢y trá»“ng',
        'huuco_channuoi': 'Há»¯u cÆ¡ ChÄƒn nuÃ´i',
        'huuco_thuysan': 'Há»¯u cÆ¡ Thá»§y sáº£n',
        'thongminh': 'NÃ´ng nghiá»‡p ThÃ´ng minh'
      };
      
      // Fetch schema for category info
      const FormSchema = require('../models/FormSchema');
      const schema = await FormSchema.findById(htxJournal.schemaId);
      const catLabel = schema ? categoryLabels[schema.category] || '' : '';

      await createNotification({
        recipient: farmerId,
        sender: req.user._id,
        title: 'Sá»• nháº­t kÃ½ má»›i',
        message: `Báº¡n Ä‘Ã£ Ä‘Æ°á»£c phÃ¢n cÃ´ng tham gia sá»• [${catLabel}]: ${htxJournal.name}`,
        type: 'Journal_Assigned',
        relatedId: farmJournal._id,
        relatedModel: 'FarmJournal',
        categoryLabel: catLabel
      });
    }

    await htxJournal.save();
    res.json({ success: true, message: `ÄÃ£ thÃªm ${addedFarmers.length} nÃ´ng dÃ¢n vÃ o sá»•.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFarmerStatus = async (req, res) => {
  try {
    const { id, farmerId } = req.params;
    const { status, feedback } = req.body;

    const htxJournal = await HtxJournal.findById(id);
    if (!htxJournal) return res.status(404).json({ success: false, message: 'KhÃ´ng tÃ¬m tháº¥y sá»•.' });

    if (htxJournal.htxId.toString() !== String(getHtxOwnerId(req.user)) && !isAdminRole(req.user.role)) {
      return res.status(403).json({ success: false, message: 'KhÃ´ng cÃ³ quyá»n.' });
    }

    const farmerEntry = htxJournal.farmers.find(f => f.farmerId.toString() === farmerId.toString());
    if (!farmerEntry) return res.status(404).json({ success: false, message: 'NÃ´ng dÃ¢n khÃ´ng thuá»™c sá»• nÃ y.' });

    if (feedback !== undefined) {
      farmerEntry.feedback = feedback;
      if (farmerEntry.farmJournalId) {
        await FarmJournal.findByIdAndUpdate(farmerEntry.farmJournalId, { 
          feedback: feedback 
        });
      }
    }

    if (status) {
      farmerEntry.status = status;
      
      // Äá»“ng bá»™ tráº¡ng thÃ¡i xuá»‘ng FarmJournal
      if (farmerEntry.farmJournalId) {
        let farmJournalStatus = 'Draft';
        if (status === 'Chá» duyá»‡t') farmJournalStatus = 'Submitted';
        if (status === 'ÄÃ£ duyá»‡t') farmJournalStatus = 'Verified';
        if (status === 'Cáº§n chá»‰nh sá»­a' || status === 'KhÃ´ng Ä‘áº¡t') farmJournalStatus = 'Draft';
        
        await FarmJournal.findByIdAndUpdate(farmerEntry.farmJournalId, { 
          status: farmJournalStatus,
          htxStatus: status // LÆ°u cáº£ tráº¡ng thÃ¡i tiáº¿ng Viá»‡t cá»§a HTX
        });

        // Create notification for farmer
        const categoryLabels = {
          'trongtrot': 'VietGAP Trá»“ng trá»t',
          'channuoi': 'VietGAHP ChÄƒn nuÃ´i',
          'thuysan': 'VietGAP Thá»§y sáº£n',
          'huuco': 'Há»¯u cÆ¡',
          'huuco_caytrong': 'Há»¯u cÆ¡ CÃ¢y trá»“ng',
          'huuco_channuoi': 'Há»¯u cÆ¡ ChÄƒn nuÃ´i',
          'huuco_thuysan': 'Há»¯u cÆ¡ Thá»§y sáº£n',
          'thongminh': 'NÃ´ng nghiá»‡p ThÃ´ng minh'
        };
        const FormSchema = require('../models/FormSchema');
        const schema = await FormSchema.findById(htxJournal.schemaId);
        const catLabel = schema ? categoryLabels[schema.category] || '' : '';

        let nTitle = 'Cáº­p nháº­t tráº¡ng thÃ¡i sá»•';
        let nMessage = `Sá»• "${htxJournal.name}" cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c cáº­p nháº­t tráº¡ng thÃ¡i: ${status}`;
        let nType = 'Journal_Verified';

        if (status === 'Cáº§n chá»‰nh sá»­a') {
          nTitle = 'YÃªu cáº§u chá»‰nh sá»­a sá»•';
          nMessage = `HTX yÃªu cáº§u báº¡n chá»‰nh sá»­a sá»• "${htxJournal.name}". Pháº£n há»“i: ${feedback || 'KhÃ´ng cÃ³'}`;
          nType = 'Journal_Revision_Requested';
        }

        await createNotification({
          recipient: farmerId,
          sender: req.user._id,
          title: nTitle,
          message: `${nMessage} [${catLabel}]`,
          type: nType,
          relatedId: farmerEntry.farmJournalId,
          relatedModel: 'FarmJournal',
          categoryLabel: catLabel
        });
      }
    }

    await htxJournal.save();
    res.json({ success: true, data: htxJournal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// For Farmers to get their assigned HTX journals
const getMyHtxJournals = async (req, res) => {
  try {
    const journals = await HtxJournal.find({
      'farmers.farmerId': req.user._id
    })
      .populate('schemaId')
      .populate('htxId', 'fullname username');

    // Mapped response so farmer only sees their own farmJournalId and status
    const mapped = journals.map(j => {
      const myEntry = j.farmers.find(f => f.farmerId.toString() === req.user._id.toString());
      return {
        _id: j._id,
        name: j.name,
        description: j.description,
        schemaId: j.schemaId,
        htxId: j.htxId,
        status: j.status,
        myStatus: myEntry?.status,
        myFeedback: myEntry?.feedback,
        myFarmJournalId: myEntry?.farmJournalId,
        createdAt: j.createdAt
      };
    });

    res.json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFarmersForHtx = async (req, res) => {
  try {
    const isHtx = isHtxRole(req.user.role);
    const isAdmin = isAdminRole(req.user.role);

    let filter = { role: { $regex: /^farmer$/i } };

    if (isHtx) {
      // Chá»‰ láº¥y nÃ´ng dÃ¢n thuá»™c HTX nÃ y
      filter.htxId = getHtxOwnerId(req.user);
    }

    const farmers = await User.find(filter)
      .select('fullname username email phone address farmName farmArea farmType certifications avatar status createdAt');
    res.json({ success: true, data: farmers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHtxJournalSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const htxJournal = await HtxJournal.findById(id).populate('schemaId');
    if (!htxJournal) return res.status(404).json({ success: false, message: 'KhÃ´ng tÃ¬m tháº¥y sá»•.' });

    const farmJournals = await FarmJournal.find({ htxJournalId: id }).populate('userId', 'fullname username');
    
    // Aggregation logic
    const summary = {
      totalFarmers: farmJournals.length,
      farmersStatus: {},
      dataAggregation: {} // Will hold sums or lists of values per field
    };

    // Initialize status counts
    farmJournals.forEach(fj => {
      const status = fj.htxStatus || 'ChÆ°a nháº­p';
      summary.farmersStatus[status] = (summary.farmersStatus[status] || 0) + 1;
    });

    // Aggregate entries based on schema fields
    if (htxJournal.schemaId && htxJournal.schemaId.tables) {
      htxJournal.schemaId.tables.forEach(table => {
        const tableName = table.tableName;
        summary.dataAggregation[tableName] = {};

        table.fields.forEach(field => {
          const fieldName = field.name;
          const fieldType = field.type;

          summary.dataAggregation[tableName][fieldName] = {
            type: fieldType,
            value: fieldType === 'number' ? 0 : []
          };

          farmJournals.forEach(fj => {
            const tableData = fj.entries?.[tableName];
            if (!tableData) return;

            const processValue = (val) => {
              if (val !== undefined && val !== null) {
                if (fieldType === 'number') {
                  summary.dataAggregation[tableName][fieldName].value += Number(val);
                } else if (typeof val === 'string' && val.trim() !== '') {
                  if (!summary.dataAggregation[tableName][fieldName].value.includes(val)) {
                    summary.dataAggregation[tableName][fieldName].value.push(val);
                  }
                }
              }
            };

            if (Array.isArray(tableData)) {
              tableData.forEach(row => processValue(row[fieldName]));
            } else {
              processValue(tableData[fieldName]);
            }
          });
        });
      });
    }

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const authorizeBrand = async (req, res) => {
  try {
    const { id } = req.params; // id cá»§a FarmJournal
    const { authorized } = req.body;

    const journal = await FarmJournal.findById(id);
    if (!journal) {
      return res.status(404).json({ success: false, message: 'KhÃ´ng tÃ¬m tháº¥y nháº­t kÃ½' });
    }

    journal.brandAuthorized = authorized;
    journal.brandAuthorizedAt = authorized ? new Date() : null;
    journal.brandAuthorizedBy = authorized ? req.user._id : null;

    await journal.save();

    res.json({ 
      success: true, 
      message: authorized ? 'ÄÃ£ cáº¥p quyá»n thÆ°Æ¡ng hiá»‡u HTX' : 'ÄÃ£ thu há»“i quyá»n thÆ°Æ¡ng hiá»‡u',
      data: journal 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeFarmerFromHtx = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const htxId = getHtxOwnerId(req.user);

    // 1. Cáº­p nháº­t User Ä‘á»ƒ bá» htxId
    const user = await User.findById(farmerId);
    if (!user) return res.status(404).json({ success: false, message: 'KhÃ´ng tÃ¬m tháº¥y nÃ´ng dÃ¢n.' });

    if (user.htxId?.toString() !== htxId.toString() && !isAdminRole(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Báº¡n khÃ´ng cÃ³ quyá»n gá»¡ nÃ´ng dÃ¢n nÃ y.' });
    }

    user.htxId = null;
    await user.save();

    // 2. Gá»¡ khá»i cÃ¡c HtxJournal cá»§a HTX nÃ y
    await HtxJournal.updateMany(
      { htxId: htxId },
      { $pull: { farmers: { farmerId: farmerId } } }
    );

    res.json({ success: true, message: 'ÄÃ£ gá»¡ nÃ´ng dÃ¢n khá»i HTX thÃ nh cÃ´ng.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createHtxJournal,
  getHtxJournals,
  addFarmersToJournal,
  updateFarmerStatus,
  getMyHtxJournals,
  getFarmersForHtx,
  getHtxJournalSummary,
  authorizeBrand,
  removeFarmerFromHtx
};

