const mongoose = require('mongoose');
const FarmJournal = require('./src/models/FarmJournal');
const FormSchema = require('./src/models/FormSchema');
const XLSX = require('xlsx');
require('dotenv').config();

const testExport = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const journal = await FarmJournal.findOne().populate('schemaId').populate('userId');
    if (!journal) {
      console.log('No journals found');
      return process.exit(0);
    }

    console.log('Found journal:', journal._id);
    
    if (!journal.schemaId) {
       console.log('schemaId is null');
    }
    if (!journal.userId) {
       console.log('userId is null');
    }

    const workbook = XLSX.utils.book_new();

    const journalInfo = [
      ['Thông tin nhật ký'],
      ['Tên schema:', journal.schemaId ? journal.schemaId.name : 'Unknown'],
      ['Mô tả:', journal.schemaId ? journal.schemaId.description : ''],
      ['Người tạo:', journal.userId ? (journal.userId.fullname || journal.userId.username) : 'Unknown'],
      ['Ngày tạo:', new Date(journal.createdAt).toLocaleDateString('vi-VN')],
      ['Trạng thái:', journal.status === 'Completed' ? 'Đã hoàn thành' : 'Đang thực hiện'],
      ['Mã QR:', journal.qrCode],
      []
    ];

    const infoSheet = XLSX.utils.aoa_to_sheet(journalInfo);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Thông tin chung');

    if (journal.schemaId && journal.schemaId.tables) {
        journal.schemaId.tables.forEach((table, index) => {
          const tableData = journal.entries[table.tableName];
          let rows = [];

          if (Array.isArray(tableData)) {
            const headers = table.fields.map(f => f.label);
            rows.push(headers);

            tableData.forEach(rowData => {
              const row = table.fields.map(field => {
                const value = rowData[field.name];
                if (value === undefined || value === null) return '';
                if (field.type === 'date') return new Date(value).toLocaleDateString('vi-VN');
                if (field.type === 'boolean') return value ? 'Có' : 'Không';
                return value.toString();
              });
              rows.push(row);
            });
          } else {
            const headers = ['Trường', 'Giá trị', 'Loại dữ liệu'];
            rows.push(headers);
            const dataObj = tableData || {};

            table.fields.forEach(field => {
              const value = dataObj[field.name];
              let displayValue = '';

              if (value !== undefined && value !== null) {
                if (field.type === 'date') displayValue = new Date(value).toLocaleDateString('vi-VN');
                else if (field.type === 'boolean') displayValue = value ? 'Có' : 'Không';
                else displayValue = value.toString();
              }

              rows.push([field.label, displayValue, field.type]);
            });
          }

          const worksheet = XLSX.utils.aoa_to_sheet(rows);
          
          let sheetName = table.tableName
            .replace(/[:\\\/\?\*\[\]]/g, '-')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (sheetName.length > 31) {
            sheetName = sheetName.substring(0, 28) + '...';
          }
          
          console.log('Adding sheet:', sheetName);
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });
    }

    console.log('Export logic succeeded without throwing error on this journal.');
    process.exit(0);
  } catch (err) {
    console.error('EXPORT FAILED WITH ERROR:', err);
    process.exit(1);
  }
};

testExport();
