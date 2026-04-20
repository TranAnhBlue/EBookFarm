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

// Export journal data to Excel
const exportJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'xlsx' } = req.query;

    // Find the journal with schema details
    const journal = await FarmJournal.findById(id)
      .populate('schemaId')
      .populate('userId', 'username fullname');

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhật ký'
      });
    }

    // Check if user owns this journal or is admin
    if (journal.userId._id.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xuất nhật ký này'
      });
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add journal info sheet
    const journalInfo = [
      ['Thông tin nhật ký'],
      ['Tên schema:', journal.schemaId.name],
      ['Mô tả:', journal.schemaId.description],
      ['Người tạo:', journal.userId.fullname || journal.userId.username],
      ['Ngày tạo:', new Date(journal.createdAt).toLocaleDateString('vi-VN')],
      ['Trạng thái:', journal.status === 'Completed' ? 'Đã hoàn thành' : 'Đang thực hiện'],
      ['Mã QR:', journal.qrCode],
      []
    ];

    const infoSheet = XLSX.utils.aoa_to_sheet(journalInfo);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Thông tin chung');

    // Add data sheets for each table
    journal.schemaId.tables.forEach((table, index) => {
      const tableData = journal.entries[table.tableName] || {};
      
      // Create headers
      const headers = ['Trường', 'Giá trị', 'Loại dữ liệu'];
      const rows = [headers];

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

        rows.push([
          field.label,
          displayValue,
          field.type
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      
      // Auto-size columns
      const colWidths = [
        { wch: 30 }, // Field name
        { wch: 20 }, // Value
        { wch: 15 }  // Type
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
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `nhat-ky-${journal.schemaId.name.replace(/\s+/g, '-')}-${timestamp}.${format}`;

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
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (sheetData.length < 2) {
        importResults.warnings.push(`Sheet ${table.tableName} không có dữ liệu`);
        return;
      }

      // Parse the data (assuming format: Field Name | Value | Type)
      const tableEntries = {};
      
      for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        if (row.length < 2) continue;

        const fieldLabel = row[0];
        const fieldValue = row[1];

        // Find field by label
        const field = table.fields.find(f => f.label === fieldLabel);
        if (!field) {
          importResults.warnings.push(`Không tìm thấy trường: ${fieldLabel} trong bảng ${table.tableName}`);
          continue;
        }

        // Convert value based on field type
        let convertedValue = fieldValue;
        
        try {
          switch (field.type) {
            case 'number':
              convertedValue = fieldValue ? parseFloat(fieldValue) : null;
              break;
            case 'date':
              if (fieldValue) {
                // Handle various date formats
                const dateValue = new Date(fieldValue);
                if (!isNaN(dateValue.getTime())) {
                  convertedValue = dateValue.toISOString();
                } else {
                  throw new Error(`Invalid date format: ${fieldValue}`);
                }
              }
              break;
            case 'boolean':
              convertedValue = fieldValue === 'Có' || fieldValue === true || fieldValue === 'true';
              break;
            default:
              convertedValue = fieldValue ? fieldValue.toString() : '';
          }

          tableEntries[field.name] = convertedValue;
          importResults.success++;

        } catch (error) {
          importResults.errors.push(`Lỗi chuyển đổi dữ liệu trường ${fieldLabel}: ${error.message}`);
        }
      }

      entries[table.tableName] = tableEntries;
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
      const headers = ['Trường', 'Giá trị', 'Loại dữ liệu', 'Ghi chú'];
      const rows = [headers];

      // Add field templates
      table.fields.forEach(field => {
        let example = '';
        let note = '';

        switch (field.type) {
          case 'text':
            example = 'Nhập văn bản';
            break;
          case 'number':
            example = '123';
            note = 'Chỉ nhập số';
            break;
          case 'date':
            example = '01/01/2025';
            note = 'DD/MM/YYYY';
            break;
          case 'select':
            example = field.options ? field.options[0] : 'Chọn từ danh sách';
            note = field.options ? `Chọn: ${field.options.join(', ')}` : '';
            break;
          case 'boolean':
            example = 'Có';
            note = 'Có hoặc Không';
            break;
          default:
            example = '';
        }

        rows.push([
          field.label,
          example,
          field.type,
          note
        ]);
      });

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