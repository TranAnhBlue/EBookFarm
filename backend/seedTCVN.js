const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TCVN = require('./src/models/TCVN');

dotenv.config();

const tcvns = [
  {
    stt: 1,
    code: 'TCVN 9988:2013',
    name: 'Xác định nguồn gốc sản phẩm cá có vây – Quy định về thông tin cần ghi lại trong chuỗi phân phối cá đánh bắt',
    scope: 'Tiêu chuẩn này quy định thông tin sẽ được ghi lại trong các chuỗi cung ứng cá đánh bắt trên biển nhằm thiết lập việc xác định nguồn gốc sản phẩm có xuất xứ từ cá đánh bắt.\nTiêu chuẩn này quy định cách thức các sản phẩm cá được buôn bán, và thông tin về chúng sẽ được mỗi bên kinh doanh thực phẩm mua các sản phẩm này qua chuỗi phân phối tạo ra và lưu giữ.\nTiêu chuẩn này áp dụng cụ thể cho quá trình phân phối đến người tiêu dùng cá đánh bắt ở biển và các sản phẩm của chúng, từ khâu đánh bắt đến nhà bán lẻ hoặc bếp ăn lớn.',
    notes: 'Cùng với TCVN 9989 (ISO 12877) về cá nuôi, tiêu chuẩn này cung cấp các vấn đề cơ bản để thực hiện chuỗi xác định nguồn gốc cá.'
  },
  {
    stt: 2,
    code: 'TCVN 9989:2013',
    name: 'Xác định nguồn gốc sản phẩm cá có vây – Quy định về thông tin cần ghi lại trong chuỗi phân phối cá nuôi',
    scope: 'Tiêu chuẩn này quy định thông tin sẽ được ghi lại trong các chuỗi cung ứng cá nuôi nhằm thiết lập khả năng xác định nguồn gốc sản phẩm có xuất xứ từ cá nuôi.\nTiêu chuẩn này quy định cách thức các sản phẩm cá được buôn bán, và thông tin về chúng sẽ được mỗi bên kinh doanh thực phẩm mua các sản phẩm này qua chuỗi phân phối tạo ra và lưu giữ.\nTiêu chuẩn này áp dụng cho quá trình phân phối đến người tiêu dùng cá nuôi trồng và các sản phẩm của chúng, từ khâu nuôi ăn, gây giống và đánh bắt đến nhà bán lẻ hoặc bếp ăn lớn.',
    notes: 'Tiêu chuẩn này được áp dụng cùng TCVN 9988 (ISO 12875) về cá đánh bắt và cung cấp các vấn đề cơ bản để thực hiện chuỗi xác định nguồn gốc cá.'
  },
  {
    stt: 3,
    code: 'TCVN 12455:2018',
    name: 'Truy xuất nguồn gốc các sản phẩm động vật giáp xác – Quy định về thông tin cần ghi lại trong chuỗi phân phối động vật giáp xác nuôi',
    scope: 'Tiêu chuẩn này quy định thông tin cần được ghi lại trong các chuỗi cung ứng động vật giáp xác nuôi nhằm thiết lập việc truy xuất nguồn gốc sản phẩm từ động vật giáp xác nuôi.\nTiêu chuẩn này áp dụng cụ thể cho quá trình phân phối động vật giáp xác và các sản phẩm từ động vật giáp xác dùng làm thực phẩm, từ cơ sở nuôi đến cơ sở bán lẻ hoặc cơ sở kinh doanh dịch vụ ăn uống.',
    notes: 'Bao gồm Cơ sở nuôi (giống, ương, thu hoạch), Chế biến, Buôn bán, Bán lẻ, Logistic, Thức ăn chăn nuôi.'
  },
  {
    stt: 4,
    code: 'TCVN 12456:2018',
    name: 'Truy xuất nguồn gốc các sản phẩm động vật giáp xác – Quy định về thông tin cần ghi lại trong chuỗi phân phối động vật giáp xác đánh bắt',
    scope: 'Tiêu chuẩn này quy định thông tin cần được ghi lại trong các chuỗi cung ứng động vật giáp xác đánh bắt tự nhiên nhằm thiết lập việc truy xuất nguồn gốc sản phẩm từ động vật giáp xác đánh bắt tự nhiên.\nTiêu chuẩn này áp dụng cụ thể cho quá trình phân phối động vật giáp xác và các sản phẩm từ động vật giáp xác dùng làm thực phẩm, từ khâu đánh bắt đến cơ sở bán lẻ hoặc cơ sở kinh doanh dịch vụ ăn uống.',
    notes: 'Bao gồm Cơ sở đánh bắt, Kinh doanh cảng, Chế biến, Vận chuyển, Bán lẻ.'
  },
  {
    stt: 5,
    code: 'TCVN 12457:2018',
    name: 'Truy xuất nguồn gốc các sản phẩm nhuyễn thể – Quy định về thông tin cần ghi lại trong chuỗi phân phối nhuyễn thể nuôi',
    scope: 'Tiêu chuẩn này quy định thông tin cần được ghi lại trong các chuỗi cung ứng nhuyễn thể nuôi (ngoại trừ nhuyễn thể chân đầu) nhằm thiết lập việc truy xuất nguồn gốc sản phẩm từ nhuyễn thể nuôi.\nTiêu chuẩn này áp dụng cụ thể cho quá trình phân phối nhuyễn thể và các sản phẩm từ nhuyễn thể dùng làm thực phẩm, từ cơ sở nuôi đến cơ sở bán lẻ hoặc cơ sở kinh doanh dịch vụ ăn uống.',
    notes: 'Bao gồm Cung cấp giống, Nuôi, Thu hoạch, Làm sạch, Chế biến, Logistic.'
  },
  {
    stt: 6,
    code: 'TCVN 12458:2018',
    name: 'Truy xuất nguồn gốc các sản phẩm nhuyễn thể – Quy định về thông tin cần ghi lại trong chuỗi phân phối nhuyễn thể đánh bắt',
    scope: 'Tiêu chuẩn này quy định thông tin cần được ghi lại trong các chuỗi cung ứng nhuyễn thể đánh bắt tự nhiên nhằm thiết lập việc truy xuất nguồn gốc sản phẩm từ nhuyễn thể đánh bắt tự nhiên.\nTiêu chuẩn này áp dụng cụ thể cho quá trình phân phối nhuyễn thể và các sản phẩm từ nhuyễn thể, từ khâu đánh bắt đến cơ sở bán lẻ hoặc cơ sở kinh doanh dịch vụ ăn uống.',
    notes: ''
  },
  {
    stt: 7,
    code: 'TCVN 12850:2019',
    name: 'Truy xuất nguồn gốc – Yêu cầu chung đối với hệ thống truy xuất nguồn gốc',
    scope: 'Tiêu chuẩn này quy định các yêu cầu chung đối với hệ thống truy xuất nguồn gốc trong một tổ chức cũng như toàn bộ chuỗi cung ứng.\nTiêu chuẩn này được áp dụng cho tất cả các lĩnh vực sản xuất, kinh doanh, không phân biệt quy mô của tổ chức, chuỗi cung ứng.',
    notes: 'Áp dụng đồng thời với các tiêu chuẩn quốc gia cho từng lĩnh vực.'
  },
  {
    stt: 8,
    code: 'TCVN 12851:2019',
    name: 'Truy xuất nguồn gốc - Yêu cầu đối với tổ chức đánh giá và chứng nhận hệ thống truy xuất nguồn gốc',
    scope: 'Tiêu chuẩn này quy định các nguyên tắc và yêu cầu đối với năng lực, tính nhất quán và khách quan của tổ chức thực hiện việc đánh giá và chứng nhận hệ thống truy xuất nguồn gốc.',
    notes: ''
  },
  {
    stt: 9,
    code: 'TCVN 13166-1:2020',
    name: 'Truy xuất nguồn gốc – Yêu cầu đối với chuỗi cung ứng thịt gia súc và gia cầm – Phần 1: Yêu cầu chung',
    scope: 'Tiêu chuẩn này đưa ra các yêu cầu đối với chuỗi cung ứng thịt gia súc và gia cầm (bao gồm thịt tươi, thịt mát, thịt đông lạnh) để đảm bảo khả năng truy xuất nguồn gốc.',
    notes: 'Bao gồm chăn nuôi, vận chuyển, giết mổ, sơ chế, phân phối, bán lẻ.'
  },
  {
    stt: 10,
    code: 'TCVN 13166-2:2020',
    name: 'Truy xuất nguồn gốc – Yêu cầu đối với chuỗi cung ứng thịt gia súc và gia cầm – Phần 2: Thịt trâu và thịt bò',
    scope: 'Tiêu chuẩn này đưa ra các yêu cầu cụ thể đối với chuỗi cung ứng thịt trâu và thịt bò để đảm bảo khả năng truy xuất nguồn gốc.',
    notes: 'Sử dụng đồng thời với TCVN 13166-1:2020.'
  },
  {
    stt: 11,
    code: 'TCVN 13166-3:2020',
    name: 'Truy xuất nguồn gốc – Yêu cầu đối với chuỗi cung ứng thịt gia súc và gia cầm – Phần 3: Thịt cừu',
    scope: 'Tiêu chuẩn này đưa ra các yêu cầu cụ thể đối với chuỗi cung ứng thịt cừu để đảm bảo khả năng truy xuất nguồn gốc.',
    notes: 'Sử dụng đồng thời với TCVN 13166-1:2020.'
  },
  {
    stt: 12,
    code: 'TCVN 13166-4:2020',
    name: 'Truy xuất nguồn gốc – Yêu cầu đối với chuỗi cung ứng thịt gia súc và gia cầm – Phần 4: Thịt lợn',
    scope: 'Tiêu chuẩn này đưa ra các yêu cầu cụ thể đối với chuỗi cung ứng thịt lợn để đảm bảo khả năng truy xuất nguồn gốc.',
    notes: 'Sử dụng đồng thời với TCVN 13166-1:2020.'
  },
  {
    stt: 13,
    code: 'TCVN 13166-5:2020',
    name: 'Truy xuất nguồn gốc – Yêu cầu đối với chuỗi cung ứng thịt gia súc và gia cầm – Phần 5: Thịt gia cầm',
    scope: 'Tiêu chuẩn này đưa ra các yêu cầu cụ thể đối với chuỗi cung ứng thịt gia cầm để đảm bảo khả năng truy xuất nguồn gốc.',
    notes: 'Sử dụng đồng thời với TCVN 13166-1:2020.'
  },
  {
    stt: 14,
    code: 'TCVN 13167:2020',
    name: 'Truy xuất nguồn gốc – Các tiêu chí đánh giá đối với hệ thống truy xuất nguồn gốc thực phẩm',
    scope: 'Tiêu chuẩn này quy định các tiêu chí đánh giá đối với hệ thống truy xuất nguồn gốc thực phẩm, nhằm xác định các yếu tố cần thiết để xây dựng các biện pháp thực hành đối với việc sản xuất và phân phối sản phẩm thực phẩm.',
    notes: 'Danh mục kiểm tra (checklist) cho chăn nuôi, trồng trọt, chế biến, logistic, bán lẻ.'
  },
  {
    stt: 15,
    code: 'TCVN 13258:2020',
    name: 'Truy xuất nguồn gốc – Yêu cầu đối với chuỗi cung ứng hóa dược',
    scope: 'Tiêu chuẩn này đưa ra các yêu cầu đối với truy xuất nguồn gốc trong chuỗi cung ứng thuốc hoá dược.',
    notes: 'Áp dụng đồng thời với TCVN 12850:2019.'
  },
  {
    stt: 16,
    code: 'TCVN 13142-1:2020',
    name: 'Cacao được sản xuất bền vững và có thể truy xuất nguồn gốc – Phần 1: Yêu cầu đối với hệ thống quản lý sản xuất cacao bền vững',
    scope: 'Tiêu chuẩn này quy định các yêu cầu mức cao đối với hệ thống quản lý sản xuất cacao bền vững, bao gồm các quá trình sau thu hoạch và truy xuất nguồn gốc.',
    notes: ''
  },
  {
    stt: 17,
    code: 'TCVN 13142-2:2020',
    name: 'Cacao được sản xuất bền vững và có thể truy xuất nguồn gốc – Phần 2: Yêu cầu đối với kết quả thực hiện',
    scope: 'Tiêu chuẩn này quy định các yêu cầu đối với kết quả thực hiện về các khía cạnh kinh tế, xã hội và môi trường để sản xuất cacao bền vững.',
    notes: ''
  },
  {
    stt: 18,
    code: 'TCVN 13142-3:2020',
    name: 'Cacao được sản xuất bền vững và có thể truy xuất nguồn gốc – Phần 3: Yêu cầu về truy xuất nguồn gốc',
    scope: 'Tiêu chuẩn này quy định các yêu cầu cơ bản để thiết kế và áp dụng các hệ thống truy xuất chuỗi cung ứng cacao đối với hạt cacao sản xuất bền vững.',
    notes: ''
  },
  {
    stt: 19,
    code: 'TCVN 13142-4:2020',
    name: 'Cacao được sản xuất bền vững và có thể truy xuất nguồn gốc - Phần 4: Yêu cầu đối với các chương trình chứng nhận',
    scope: 'Tiêu chuẩn này quy định các yêu cầu đối với các chương trình chứng nhận đối với cacao được sản xuất bền vững và có thể truy xuất nguồn gốc.',
    notes: ''
  },
  {
    stt: 20,
    code: 'TCVN 13274:2020',
    name: 'Truy xuất nguồn gốc – Hướng dẫn định dạng các mã dùng cho truy vết',
    scope: 'Tiêu chuẩn này quy định hướng dẫn định dạng các mã dùng cho truy vết sử dụng trong hệ thống truy xuất nguồn gốc vật phẩm, hàng hoá.',
    notes: ''
  },
  {
    stt: 21,
    code: 'TCVN 13275:2020',
    name: 'Truy xuất nguồn gốc – Định dạng vật mang dữ liệu',
    scope: 'Tiêu chuẩn này quy định về định dạng vật mang dữ liệu để mã hóa các mã truy vết được sử dụng trên các dạng bao gói và hộp/vật đựng đặc thù.',
    notes: ''
  },
  {
    stt: 22,
    code: 'TCVN 12827:2023',
    name: 'Truy xuất nguồn gốc – Yêu cầu đối với chuỗi cung ứng rau quả tươi',
    scope: 'Tiêu chuẩn này đưa ra các yêu cầu đối với chuỗi cung ứng rau quả tươi để đảm bảo khả năng truy xuất nguồn gốc từ cơ sở trồng trọt đến bán lẻ.',
    notes: 'Mô hình ứng dụng hệ thống GS1.'
  },
  {
    stt: 23,
    code: 'TCVN 13805:2023',
    name: 'Truy xuất nguồn gốc – Yêu cầu đối với chuỗi cung ứng sữa và sản phẩm sữa',
    scope: 'Tiêu chuẩn này đưa ra các yêu cầu đối với chuỗi cung ứng sữa và sản phẩm sữa để đảm bảo khả năng truy xuất nguồn gốc.',
    notes: 'Mô hình ứng dụng hệ thống GS1 (Blockchain, IoT, mã vạch thông minh).'
  },
  {
    stt: 24,
    code: 'TCVN 13814:2023',
    name: 'Truy xuất nguồn gốc – Yêu cầu đối với chuỗi cung ứng nước quả',
    scope: 'Tiêu chuẩn này đưa ra các yêu cầu đối với chuỗi cung ứng nước quả từ cơ sở chế biến đến bán lẻ.',
    notes: 'Mô hình ứng dụng hệ thống GS1.'
  },
  {
    stt: 25,
    code: 'TCVN 13840:2023',
    name: 'Truy xuất nguồn gốc – Yêu cầu đối với chuỗi cung ứng cà phê nhân',
    scope: 'Tiêu chuẩn này đưa ra các yêu cầu đối với chuỗi cung ứng cà phê nhân từ trồng trọt đến bán lẻ.',
    notes: 'Mô hình ứng dụng hệ thống GS1.'
  },
  {
    stt: 26,
    code: 'TCVN 13843:2023',
    name: 'Truy xuất nguồn gốc – Yêu cầu đối với chuỗi cung ứng mật ong',
    scope: 'Tiêu chuẩn này đưa ra các yêu cầu đối với chuỗi cung ứng mật ong, bao gồm cả mật ong bánh tổ.',
    notes: 'Mô hình ứng dụng hệ thống GS1.'
  },
  {
    stt: 27,
    code: 'TCVN 13987:2024',
    name: 'Truy xuất nguồn gốc – Yêu cầu về thu thập thông tin trong truy xuất nguồn gốc thực phẩm',
    scope: 'Tiêu chuẩn này đưa ra các yêu cầu thu thập thông tin cho sản phẩm thực phẩm đóng gói.',
    notes: ''
  },
  {
    stt: 28,
    code: 'TCVN 13991:2024',
    name: 'Truy xuất nguồn gốc – Hướng dẫn truy xuất nguồn gốc thủy sản',
    scope: 'Tiêu chuẩn này đưa ra các hướng dẫn về cách xác định, định danh và theo dõi đối tượng truy xuất nguồn gốc thủy sản (ngoại trừ nhuyễn thể, giáp xác, cá có vây).',
    notes: ''
  },
  {
    stt: 29,
    code: 'TCVN 13994:2024',
    name: 'Truy xuất nguồn gốc – Yêu cầu đối với quá trình sản xuất thuốc lá',
    scope: 'Tiêu chuẩn này quy định các nguyên tắc chung và quy trình truy xuất nguồn gốc trong sản xuất thuốc lá điếu.',
    notes: ''
  },
  {
    stt: 30,
    code: 'TCVN 13988:2024',
    name: 'Truy xuất nguồn gốc – Yêu cầu đối với chuỗi cung ứng rượu vang',
    scope: 'Tiêu chuẩn này đưa ra các yêu cầu cụ thể đối với chuỗi cung ứng rượu vang làm từ nho.',
    notes: ''
  },
  {
    stt: 31,
    code: 'TCVN 13990:2024',
    name: 'Truy xuất nguồn gốc – Yêu cầu đối với logistic chuỗi lạnh cho thực phẩm',
    scope: 'Tiêu chuẩn này đưa ra các yêu cầu đối với dịch vụ logistic chuỗi lạnh cho thực phẩm đóng gói sẵn.',
    notes: ''
  },
  {
    stt: 32,
    code: 'TCVN 13995:2024',
    name: 'Truy xuất nguồn gốc – Yêu cầu đối với chuỗi cung ứng trang thiết bị y tế',
    scope: 'Tiêu chuẩn này đưa ra các yêu cầu đối với truy xuất nguồn gốc trong chuỗi cung ứng trang thiết bị y tế.',
    notes: 'Áp dụng đồng thời với TCVN 12850:2019.'
  },
  {
    stt: 33,
    code: 'TCVN 13993:2024',
    name: 'Truy xuất nguồn gốc – Hướng dẫn thu thập thông tin đối với chuỗi cung ứng chè',
    scope: 'Tiêu chuẩn này đưa ra hướng dẫn thu thập thông tin phục vụ truy xuất nguồn gốc chè (vườn chè, sản xuất, tiêu thụ).',
    notes: ''
  },
  {
    stt: 34,
    code: 'TCVN 13989:2024',
    name: 'Truy xuất nguồn gốc – Yêu cầu đối với chuỗi cung ứng sản phẩm dược mỹ phẩm',
    scope: 'Tiêu chuẩn này đưa ra các yêu cầu đối với chuỗi cung ứng dược mỹ phẩm để truy xuất nguồn gốc.',
    notes: ''
  },
  {
    stt: 35,
    code: 'TCVN 13992:2024',
    name: 'Truy xuất nguồn gốc – Hướng dẫn thu thập thông tin đối với chuỗi cung ứng đồ chơi trẻ em',
    scope: 'Tiêu chuẩn này đưa ra các hướng dẫn thu thập thông tin trong chuỗi cung ứng đồ chơi trẻ em.',
    notes: ''
  }
];

const seedTCVN = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await TCVN.deleteMany();
        console.log('Cleared existing TCVN data');

        await TCVN.insertMany(tcvns);
        console.log('Seeded TCVN data successfully');

        process.exit();
    } catch (error) {
        console.error('Error seeding TCVN:', error);
        process.exit(1);
    }
};

seedTCVN();
