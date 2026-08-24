const FarmJournal = require('../models/FarmJournal');
const FormSchema = require('../models/FormSchema');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/imports';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ hỗ trợ file Excel (.xlsx, .xls) và CSV (.csv)'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Export journal data to Excel (Chuẩn hóa theo form Sổ nhật ký sản xuất VietGAP)
const exportJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'xlsx' } = req.query;

    const journal = await FarmJournal.findById(id)
      .populate('schemaId')
      .populate('userId', 'username fullname farmName organization farmCode farmArea address ward province');

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhật ký'
      });
    }

    const journalUserId = journal.userId ? journal.userId._id.toString() : null;
    if (journalUserId && journalUserId !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xuất nhật ký này'
      });
    }

    const workbook = XLSX.utils.book_new();
    const schemaName = journal.schemaId ? journal.schemaId.name : 'Nhật ký sản xuất';
    const entries = journal.entries || {};
    const user = journal.userId || {};

    const infoGeneral = entries['Thông tin chung'] || entries['thongTinChung'] || {};
    const tenCoSo = infoGeneral.tenCoSo || user.farmName || user.organization || user.fullname || user.username || 'TRẦN QUỐC HUY';
    const diaChiCoSo = infoGeneral.diaChiCoSo || user.address || (user.ward ? `${user.ward}, ${user.province || ''}` : '') || '';
    const hoTen = infoGeneral.hoTen || user.fullname || user.username || tenCoSo;
    const maSoNongHo = infoGeneral.maSoNongHo || user.farmCode || 'VG/TX-H.01';
    const dienTich = infoGeneral.dienTich || user.farmArea || '5000';
    const cayTrong = infoGeneral.cayTrong || schemaName;
    const diaChiSanXuat = infoGeneral.diaChiSanXuat || diaChiCoSo;
    const namSanXuat = infoGeneral.namSanXuat || new Date(journal.createdAt).getFullYear();

    // 1. Sheet Thông tin chung (Trang 1)
    const coverInfo = [
      ['Tên cơ sở: ' + tenCoSo],
      ['Địa chỉ: ' + diaChiCoSo],
      [],
      ['SỔ NHẬT KÝ SẢN XUẤT'],
      [],
      ['THÔNG TIN CHUNG'],
      ['1. Họ và tên tổ chức/cá nhân sản xuất:', hoTen],
      ['2. Mã số nông hộ:', maSoNongHo],
      ['3. Diện tích (m2):', dienTich],
      ['4. Cây trồng:', cayTrong],
      ['5. Địa chỉ sản xuất:', diaChiSanXuat],
      ['6. Năm sản xuất:', namSanXuat],
      [],
      ['Mã QR truy xuất:', journal.qrCode || ''],
      ['Trạng thái:', journal.status === 'Verified' ? 'Đã duyệt' : (journal.status === 'Locked' ? 'Đã khóa' : 'Lưu nháp')]
    ];
    const coverSheet = XLSX.utils.aoa_to_sheet(coverInfo);
    coverSheet['!cols'] = [{ wch: 35 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(workbook, coverSheet, 'Thông tin chung');

    const getTableData = (tableKeySubstrings) => {
      for (const key of Object.keys(entries)) {
        const lower = key.toLowerCase();
        if (tableKeySubstrings.some(sub => lower.includes(sub.toLowerCase()))) {
          const val = entries[key];
          if (Array.isArray(val)) return val;
          if (typeof val === 'object' && val !== null) return [val];
        }
      }
      return [];
    };

    const formatDateVal = (v) => {
      if (!v) return '';
      const d = new Date(v);
      return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString('vi-VN');
    };

    // 2. Sheet Bảng 1: Đánh giá chỉ tiêu ATTP
    const table1Data = getTableData(['Bảng 1', 'Đánh giá', 'ATTP']);
    const b1Rows = [
      ['Bảng 1. Đánh giá các chỉ tiêu gây mất ATTP trong đất/giá thể, nước tưới, nước phục vụ sơ chế và sản phẩm'],
      [],
      ['Ngày tháng', 'Điều kiện', 'Tác nhân gây ô nhiễm', 'Đánh giá hiện tại', 'Biện pháp xử lý']
    ];
    table1Data.forEach(r => {
      b1Rows.push([
        formatDateVal(r.ngayThang || r.thoiGian || r.date),
        r.dieuKien || '',
        Array.isArray(r.tacNhan) ? r.tacNhan.join(', ') : (r.tacNhan || ''),
        r.danhGia || 'Đạt',
        r.bienPhap || ''
      ]);
    });
    const b1Sheet = XLSX.utils.aoa_to_sheet(b1Rows);
    b1Sheet['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 18 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, b1Sheet, 'Bảng 1-Đánh giá ATTP');

    // 3. Sheet Bảng 2.1 & 2.2: Vật tư đầu vào
    const table2Raw = getTableData(['Bảng 2', 'vật tư', 'Đầu vào']);
    const table2_1Data = getTableData(['Bảng 2.1', 'Mua'])?.length > 0
      ? getTableData(['Bảng 2.1', 'Mua'])
      : table2Raw.filter(item => !item.nguyenLieuTuSanXuat && !item.phuongPhapXuLy && !item.isSelfProduced);

    const b21Rows = [
      ['Bảng 2.1 Bảng theo dõi vật tư đầu vào - Mua'],
      [],
      ['Ngày tháng', 'Tên vật tư', 'Đơn vị tính', 'Số lượng', 'Tên và địa chỉ mua vật tư', 'Hạn sử dụng']
    ];
    table2_1Data.forEach(r => {
      b21Rows.push([
        formatDateVal(r.ngayThang || r.thoiGian || r.date),
        r.tenVatTu || r.name || '',
        r.donViTinh || r.dvt || r.unit || 'Kg',
        r.soLuong !== undefined ? r.soLuong : '',
        r.diaChiMua || r.tenVaDiaChiMua || '',
        formatDateVal(r.hanSuDung)
      ]);
    });
    const b21Sheet = XLSX.utils.aoa_to_sheet(b21Rows);
    b21Sheet['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 35 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, b21Sheet, 'Bảng 2.1-Vật tư Mua');

    const table2_2Data = getTableData(['Bảng 2.2', 'Tự sản xuất'])?.length > 0
      ? getTableData(['Bảng 2.2', 'Tự sản xuất'])
      : table2Raw.filter(item => item.nguyenLieuTuSanXuat || item.phuongPhapXuLy || item.isSelfProduced);

    const b22Rows = [
      ['Bảng 2.2 Bảng theo dõi vật tư đầu vào - Tự sản xuất'],
      [],
      ['Ngày tháng', 'Tên vật tư', 'Đơn vị tính', 'Số lượng', 'Tên và địa chỉ mua vật tư', 'Hạn sử dụng', 'Nguyên liệu sản xuất', 'Phương pháp xử lý', 'Hóa chất xử lý', 'Người xử lý']
    ];
    table2_2Data.forEach(r => {
      b22Rows.push([
        formatDateVal(r.ngayThang || r.thoiGian || r.date),
        r.tenVatTu || r.name || '',
        r.donViTinh || r.dvt || 'Kg',
        r.soLuong !== undefined ? r.soLuong : '',
        r.diaChiMua || '',
        formatDateVal(r.hanSuDung),
        r.nguyenLieuTuSanXuat || r.nguyenLieu || '',
        r.phuongPhapXuLy || '',
        r.hoaChatXuLy || '',
        r.nguoiXuLy || ''
      ]);
    });
    const b22Sheet = XLSX.utils.aoa_to_sheet(b22Rows);
    b22Sheet['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, b22Sheet, 'Bảng 2.2-Vật tư Tự SX');

    // 4. Sheet Bảng 3.1 & 3.2: Canh tác
    const table3Raw = getTableData(['Bảng 3', 'canh tác', 'chăm sóc']);
    const table3_1Data = getTableData(['Bảng 3.1', 'Bón phân'])?.length > 0
      ? getTableData(['Bảng 3.1', 'Bón phân'])
      : table3Raw.filter(item => item.tenPhanBon || item.luongPhanBon || (!item.tenThuocBVTV && !item.tenThuoc));

    const b31Rows = [
      ['Bảng 3.1 Nhật ký canh tác - Bón phân'],
      [],
      ['Thời gian thực hiện', 'Tên phân bón', 'Lượng sử dụng (Kg)', 'Đơn vị tính', 'Ghi chú']
    ];
    table3_1Data.forEach(r => {
      b31Rows.push([
        formatDateVal(r.thoiGian || r.thoiGianThucHien || r.ngayThang || r.date),
        r.tenPhanBon || r.tenVatTu || r.name || '',
        r.luongPhanBon !== undefined ? r.luongPhanBon : (r.luongSuDung !== undefined ? r.luongSuDung : (r.soLuong || '')),
        r.donViTinh || r.dvt || 'Kg',
        r.ghiChu || ''
      ]);
    });
    const b31Sheet = XLSX.utils.aoa_to_sheet(b31Rows);
    b31Sheet['!cols'] = [{ wch: 18 }, { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, b31Sheet, 'Bảng 3.1-Bón phân');

    const table3_2Data = getTableData(['Bảng 3.2', 'Thuốc BVTV', 'BVTV'])?.length > 0
      ? getTableData(['Bảng 3.2', 'Thuốc BVTV'])
      : table3Raw.filter(item => item.tenThuocBVTV || item.tenThuoc || item.nongDoPha || item.thoiGianCachLy);

    const b32Rows = [
      ['Bảng 3.2 Nhật ký canh tác - Thuốc BVTV'],
      [],
      ['Ngày tháng', 'Tên thuốc', 'Nồng độ pha', 'Lượng sử dụng', 'Thời gian cách ly (ngày)', 'Ghi chú', 'Đơn vị tính']
    ];
    table3_2Data.forEach(r => {
      b32Rows.push([
        formatDateVal(r.ngayThang || r.thoiGian || r.thoiGianThucHien || r.date),
        r.tenThuocBVTV || r.tenThuoc || r.name || '',
        r.nongDoPha || '',
        r.luongThuocSuDung !== undefined ? r.luongThuocSuDung : (r.luongSuDung !== undefined ? r.luongSuDung : (r.soLuong || '')),
        r.thoiGianCachLy !== undefined ? r.thoiGianCachLy : '',
        r.ghiChu || '',
        r.donViTinh || r.dvt || 'mililit'
      ]);
    });
    const b32Sheet = XLSX.utils.aoa_to_sheet(b32Rows);
    b32Sheet['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, b32Sheet, 'Bảng 3.2-Thuốc BVTV');

    // 5. Sheet Bảng 4.1 & 4.2: Thu hoạch & tiêu thụ
    const table4Raw = getTableData(['Bảng 4', 'thu hoạch', 'tiêu thụ']);
    const table4_1Data = getTableData(['Bảng 4.1', 'Thu hoạch'])?.length > 0
      ? getTableData(['Bảng 4.1', 'Thu hoạch'])
      : (table4Raw.length > 0 ? table4Raw : []);

    const b41Rows = [
      ['Bảng 4.1. Thu hoạch sản phẩm'],
      [],
      ['Thời gian thu hoạch', 'Mã số lô thu hoạch', 'Tên sản phẩm', 'Đơn vị tính', 'Sản lượng']
    ];
    table4_1Data.forEach(r => {
      b41Rows.push([
        formatDateVal(r.thoiGianThuHoach || r.thoiGian || r.ngayThang || r.date),
        r.maSoLo || r.maLo || r.batchCode || '',
        r.tenSanPham || cayTrong || '',
        r.donViTinh || r.dvt || 'Kg',
        r.sanLuong !== undefined ? r.sanLuong : ''
      ]);
    });
    const b41Sheet = XLSX.utils.aoa_to_sheet(b41Rows);
    b41Sheet['!cols'] = [{ wch: 18 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(workbook, b41Sheet, 'Bảng 4.1-Thu hoạch');

    const table4_2Data = getTableData(['Bảng 4.2', 'Tiêu thụ'])?.length > 0
      ? getTableData(['Bảng 4.2', 'Tiêu thụ'])
      : table4Raw.filter(item => item.ngayBan || item.soLuongBan || item.donViMua);

    const b42Rows = [
      ['Bảng 4.2 Tiêu thụ sản phẩm'],
      [],
      ['Ngày bán', 'Mã số lô thu hoạch', 'Tên sản phẩm', 'Số lượng bán', 'Đơn vị tính', 'Đơn vị thu mua/ Địa chỉ', 'Ghi chú']
    ];
    table4_2Data.forEach(r => {
      b42Rows.push([
        formatDateVal(r.ngayBan || r.thoiGian || r.date),
        r.maSoLo || r.maLo || r.batchCode || '',
        r.tenSanPham || cayTrong || '',
        r.soLuongBan !== undefined ? r.soLuongBan : '',
        r.donViTinh || r.dvt || 'Kg',
        r.donViMua || r.donViThuMua || 'Tư thương',
        r.ghiChu || ''
      ]);
    });
    const b42Sheet = XLSX.utils.aoa_to_sheet(b42Rows);
    b42Sheet['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, b42Sheet, 'Bảng 4.2-Tiêu thụ');

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `so-nhat-ky-${hoTen.replace(/\s+/g, '-')}-${timestamp}.${format}`;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    // Write and send file
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: format });
    res.send(buffer);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xuất dữ liệu: ' + error.message
    });
  }
};

// Import journal data from Excel
const importJournal = async (req, res) => {
  try {
    const { schemaId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file để import'
      });
    }

    // Find the schema
    const schema = await FormSchema.findById(schemaId);
    if (!schema) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy schema'
      });
    }

    // Read the uploaded file
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);

    // Parse data from sheets
    const entries = {};
    const importResults = {
      success: 0,
      errors: [],
      warnings: []
    };

    // Process each table
    schema.tables.forEach((table, tableIndex) => {
      // Sanitize sheet name to match what was generated in template
      let sheetName = table.tableName
        .replace(/[:\\\/\?\*\[\]]/g, '-') // Replace invalid chars with dash
        .replace(/\s+/g, ' ')              // Normalize spaces
        .trim();                            // Remove leading/trailing spaces
      
      if (sheetName.length > 31) {
        sheetName = sheetName.substring(0, 28) + '...';
      }
      
      // Try to find sheet by exact name or similar name
      let worksheet = null;
      const sheetNames = workbook.SheetNames;
      
      // First try exact match with sanitized name
      if (sheetNames.includes(sheetName)) {
        worksheet = workbook.Sheets[sheetName];
      } else {
        // Try to find similar sheet name (first 10 chars, case insensitive)
        const searchPattern = table.tableName
          .replace(/[:\\\/\?\*\[\]]/g, '-')
          .substring(0, 10)
          .toLowerCase();
        
        const similarSheet = sheetNames.find(name => 
          name.toLowerCase().includes(searchPattern)
        );
        if (similarSheet) {
          worksheet = workbook.Sheets[similarSheet];
        }
      }

      if (!worksheet) {
        importResults.warnings.push(`Không tìm thấy sheet cho bảng: ${table.tableName}`);
        return;
      }

      // Convert sheet to JSON
      const isMultiRow = table.isMultiRow;
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: isMultiRow ? 1 : 1 });
      
      if (sheetData.length < 2) {
        importResults.warnings.push(`Sheet ${table.tableName} không có dữ liệu`);
        return;
      }

      if (isMultiRow) {
        // Handle horizontal multi-row import
        const headers = sheetData[0];
        const rows = [];
        
        for (let i = 1; i < sheetData.length; i++) {
          const row = sheetData[i];
          if (!row || row.length === 0) continue;

          const entry = {};
          table.fields.forEach(field => {
            const colIndex = headers.indexOf(field.label);
            if (colIndex !== -1) {
              let val = row[colIndex];
              if (val !== undefined && val !== null) {
                if (field.type === 'number') val = parseFloat(val);
                else if (field.type === 'date') val = new Date(val).toISOString();
                else if (field.type === 'boolean') val = (val === 'Có' || val === true);
                entry[field.name] = val;
              }
            }
          });
          if (Object.keys(entry).length > 0) rows.push(entry);
        }
        entries[table.tableName] = rows;
      } else {
        // Vertical format parsing (Existing logic)
        const tableEntries = {};
        for (let i = 1; i < sheetData.length; i++) {
          const row = sheetData[i];
          if (!row || row.length < 2) continue;
          const fieldLabel = row[0];
          const fieldValue = row[1];
          const field = table.fields.find(f => f.label === fieldLabel);
          if (field) {
            let val = fieldValue;
            if (field.type === 'number') val = parseFloat(val);
            else if (field.type === 'date') val = new Date(val).toISOString();
            else if (field.type === 'boolean') val = (val === 'Có' || val === true);
            tableEntries[field.name] = val;
          }
        }
        entries[table.tableName] = tableEntries;
      }
      importResults.success++;
    });

    // Create new journal with imported data
    const newJournal = new FarmJournal({
      schemaId: schema._id,
      userId: req.user.id,
      entries: entries,
      status: 'Draft'
    });

    await newJournal.save();

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Import thành công',
      data: {
        journalId: newJournal._id,
        results: importResults
      }
    });

  } catch (error) {
    console.error('Import error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi import dữ liệu: ' + error.message
    });
  }
};

// Export multiple journals
const exportMultipleJournals = async (req, res) => {
  try {
    const { journalIds } = req.body;

    if (!journalIds || !Array.isArray(journalIds) || journalIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất một nhật ký để xuất'
      });
    }

    // Find journals
    const journals = await FarmJournal.find({
      _id: { $in: journalIds },
      $or: [
        { userId: req.user.id },
        ...(req.user.role === 'Admin' ? [{}] : [])
      ]
    })
    .populate('schemaId')
    .populate('userId', 'username fullname');

    if (journals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhật ký nào'
      });
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add summary sheet
    const summaryData = [
      ['Danh sách nhật ký xuất'],
      ['Thời gian xuất:', new Date().toLocaleString('vi-VN')],
      ['Số lượng:', journals.length],
      [],
      ['STT', 'Tên schema', 'Người tạo', 'Ngày tạo', 'Trạng thái', 'Mã QR']
    ];

    journals.forEach((journal, index) => {
      summaryData.push([
        index + 1,
        journal.schemaId.name,
        journal.userId.fullname || journal.userId.username,
        new Date(journal.createdAt).toLocaleDateString('vi-VN'),
        journal.status === 'Completed' ? 'Đã hoàn thành' : 'Đang thực hiện',
        journal.qrCode
      ]);
    });

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng quan');

    // Add each journal as separate sheets
    journals.forEach((journal, journalIndex) => {
      journal.schemaId.tables.forEach((table, tableIndex) => {
        const tableData = journal.entries[table.tableName] || {};
        
        // Create headers
        const headers = ['Trường', 'Giá trị'];
        const rows = [
          [`Nhật ký: ${journal.schemaId.name} - ${journal.qrCode}`],
          [],
          headers
        ];

        // Add field data
        table.fields.forEach(field => {
          const value = tableData[field.name];
          let displayValue = '';

          if (value !== undefined && value !== null) {
            if (field.type === 'date') {
              displayValue = new Date(value).toLocaleDateString('vi-VN');
            } else if (field.type === 'boolean') {
              displayValue = value ? 'Có' : 'Không';
            } else {
              displayValue = value.toString();
            }
          }

          rows.push([field.label, displayValue]);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        
        // Sanitize and create unique sheet name
        let sanitizedTableName = table.tableName
          .replace(/[:\\\/\?\*\[\]]/g, '-') // Replace invalid chars with dash
          .replace(/\s+/g, ' ')              // Normalize spaces
          .trim();                            // Remove leading/trailing spaces
        
        const sheetName = `${journalIndex + 1}-${sanitizedTableName}`.substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });
    });

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `nhat-ky-nhieu-${timestamp}.xlsx`;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    // Write and send file
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);

  } catch (error) {
    console.error('Multiple export error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xuất dữ liệu: ' + error.message
    });
  }
};

// Generate import template
const generateImportTemplate = async (req, res) => {
  try {
    const { schemaId } = req.params;

    // Find the schema
    const schema = await FormSchema.findById(schemaId);
    if (!schema) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy schema'
      });
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add instruction sheet
    const instructions = [
      ['HƯỚNG DẪN IMPORT DỮ LIỆU'],
      [],
      ['1. Mỗi sheet tương ứng với một bảng trong nhật ký'],
      ['2. Cột "Trường" chứa tên trường (KHÔNG được thay đổi)'],
      ['3. Cột "Giá trị" là nơi bạn nhập dữ liệu'],
      ['4. Cột "Loại dữ liệu" cho biết kiểu dữ liệu cần nhập'],
      ['5. Định dạng ngày: DD/MM/YYYY hoặc YYYY-MM-DD'],
      ['6. Định dạng boolean: "Có" hoặc "Không"'],
      ['7. Lưu file dưới định dạng .xlsx trước khi import'],
      [],
      ['LƯU Ý:'],
      ['- Không thay đổi tên sheet'],
      ['- Không thay đổi tên trường trong cột "Trường"'],
      ['- Chỉ nhập dữ liệu vào cột "Giá trị"']
    ];

    const instructionSheet = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Hướng dẫn');

    // Add template sheets for each table
    schema.tables.forEach((table) => {
      if (table.isMultiRow) {
        // Horizontal Header for Multi-row
        const headers = table.fields.map(f => f.label);
        const exampleRow = table.fields.map(field => {
          if (field.type === 'number') return '123';
          if (field.type === 'date') return '01/01/2025';
          if (field.type === 'boolean') return 'Có';
          return `Nhập ${field.label}`;
        });
        rows.push(headers);
        rows.push(exampleRow);
      } else {
        // Vertical List for Single-row
        const headers = ['Trường', 'Giá trị', 'Loại dữ liệu', 'Ghi chú'];
        rows.push(headers);
        table.fields.forEach(field => {
          let example = '';
          let note = '';
          switch (field.type) {
            case 'text': example = 'Nhập văn bản'; break;
            case 'number': example = '123'; note = 'Chỉ nhập số'; break;
            case 'date': example = '01/01/2025'; note = 'DD/MM/YYYY'; break;
            case 'select': example = field.options ? field.options[0] : 'Chọn từ danh sách'; note = field.options ? `Chọn: ${field.options.join(', ')}` : ''; break;
            case 'boolean': example = 'Có'; note = 'Có hoặc Không'; break;
            default: example = '';
          }
          rows.push([field.label, example, field.type, note]);
        });
      }

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      
      // Auto-size columns
      const colWidths = [
        { wch: 30 }, // Field name
        { wch: 20 }, // Value
        { wch: 15 }, // Type
        { wch: 25 }  // Note
      ];
      worksheet['!cols'] = colWidths;

      // Sanitize sheet name: remove invalid characters : \ / ? * [ ]
      let sheetName = table.tableName
        .replace(/[:\\\/\?\*\[\]]/g, '-') // Replace invalid chars with dash
        .replace(/\s+/g, ' ')              // Normalize spaces
        .trim();                            // Remove leading/trailing spaces
      
      // Limit sheet name to 31 characters (Excel limit)
      if (sheetName.length > 31) {
        sheetName = sheetName.substring(0, 28) + '...';
      }
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // Generate filename
    const filename = `mau-import-${schema.name.replace(/\s+/g, '-')}.xlsx`;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    // Write and send file
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);

  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo mẫu import: ' + error.message
    });
  }
};

module.exports = {
  exportJournal,
  importJournal: [upload.single('file'), importJournal],
  exportMultipleJournals,
  generateImportTemplate
};